"""Tests for skill-audit. Run: python3 -m unittest discover -s tests -v"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import skill_audit as sa


def write_skill(root: Path, body: str, extra: dict | None = None) -> Path:
    skill = root / "demo-skill"
    skill.mkdir(parents=True)
    (skill / "SKILL.md").write_text(body, encoding="utf-8")
    for rel, content in (extra or {}).items():
        p = skill / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
    return skill


class ExtractionTests(unittest.TestCase):
    def test_extracts_path_repo_and_link(self):
        text = (
            "Run ~/workspace/tools/run.sh and see [guide](references/guide.md).\n"
            "Repo: `dsect-net/quantum` and https://github.com/ScottyVenable/fermata\n"
        )
        refs = sa.extract_references(text, "SKILL.md")
        kinds = {(r.kind, r.value) for r in refs}
        self.assertIn(("path", "~/workspace/tools/run.sh"), kinds)
        self.assertIn(("link", "references/guide.md"), kinds)
        self.assertIn(("repo", "dsect-net/quantum"), kinds)
        self.assertIn(("repo", "ScottyVenable/fermata"), kinds)

    def test_mimetype_is_not_a_repo(self):
        refs = sa.extract_references("Send as `text/plain` please.\n", "SKILL.md")
        self.assertEqual([r for r in refs if r.kind == "repo"], [])

    def test_file_paths_are_not_repos(self):
        text = ("See `references/access-modes.md`, `projects/README.md`, "
                "`assets/hs33.png`, press `Ctrl/Cmd-P`, format `text/markdown`.\n")
        refs = sa.extract_references(text, "SKILL.md")
        self.assertEqual([r for r in refs if r.kind == "repo"], [])

    def test_real_repos_still_detected(self):
        refs = sa.extract_references("Repos: `dsect-net/quantum` and `Cadential-Studios/prometheia`.\n", "SKILL.md")
        repos = {r.value for r in refs if r.kind == "repo"}
        self.assertEqual(repos, {"dsect-net/quantum", "Cadential-Studios/prometheia"})


class AuditTests(unittest.TestCase):
    def test_live_and_dead_paths(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            skill = write_skill(
                root,
                "Good: [g](references/guide.md) and `scripts/run.sh`\n"
                "Bad: [b](references/missing.md)\n",
                extra={"references/guide.md": "# guide", "scripts/run.sh": "#!/bin/sh\n"},
            )
            # scripts/run.sh was referenced via backticked relative pattern? It is
            # not in references/-style folders list except scripts/ — covered.
            report = sa.audit_skill(skill, home=root)
            dead_values = {r.value for r in report.dead}
            self.assertIn("references/missing.md", dead_values)
            self.assertNotIn("references/guide.md", dead_values)

    def test_placeholder_is_skipped_not_dead(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            skill = write_skill(root, "Template: ~/workspace/{{NAME}}/x.md\n")
            report = sa.audit_skill(skill, home=root)
            self.assertTrue(any(r.status == "skipped" for r in report.references))
            self.assertEqual(report.dead, [])

    def test_repo_checker_injection(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            skill = write_skill(root, "Repo: `acme/widgets` and `acme/gone`\n")

            def fake_checker(repo):
                return ("ok", "fake") if repo == "acme/widgets" else ("dead", "fake 404")

            report = sa.audit_skill(skill, repo_checker=fake_checker, home=root)
            dead = {r.value for r in report.dead}
            self.assertEqual(dead, {"acme/gone"})

    def test_repo_unverified_without_checker(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            skill = write_skill(root, "Repo: `acme/widgets`\n")
            report = sa.audit_skill(skill, repo_checker=None, home=root)
            repo_refs = [r for r in report.references if r.kind == "repo"]
            self.assertEqual(repo_refs[0].status, "unverified")
            self.assertEqual(report.dead, [])

    def test_remote_home_is_unverified_not_dead(self):
        ref = sa.Reference(kind="path", value="/home/scott/codex", source_file="SKILL.md", line=1)
        sa.verify_path(ref, Path("/tmp"), Path("/home/hatch"), current_user="hatch")
        self.assertEqual(ref.status, "unverified")

    def test_date_placeholder_is_skipped(self):
        ref = sa.Reference(kind="path", value="~/workspace/wroc/weeks/week-YYYY-MM-DD.yaml",
                           source_file="SKILL.md", line=1)
        sa.verify_path(ref, Path("/tmp"), Path("/home/hatch"), current_user="hatch")
        self.assertEqual(ref.status, "skipped")

    def test_find_skills(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            write_skill(root, "x")
            (root / "not-a-skill").mkdir()
            found = sa.find_skills([root])
            self.assertEqual([p.name for p in found], ["demo-skill"])


if __name__ == "__main__":
    unittest.main()
