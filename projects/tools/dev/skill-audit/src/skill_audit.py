#!/usr/bin/env python3
"""skill-audit — find dead references in agent skill files before they rot.

Skills (SKILL.md and friends) point at real things: files on disk, repos,
sibling files, helper scripts. Those things move. When a skill silently
references a path or repo that no longer exists, the agent following it
fails mid-task — usually at the worst moment. This tool scans skill
Markdown, extracts the references, and verifies the ones that can be
checked offline (paths, relative links) plus, optionally, GitHub repos
via the `gh` CLI.

Usage:
    python3 skill_audit.py [SKILL_ROOT ...] [--json] [--check-repos]
                           [--strict]

With no roots, defaults to ~/workspace/custom-skills and /opt/muse/skills
(whichever exist). Exit code: 0 = clean, 1 = dead references found
(or any finding at all with --strict), 2 = usage error.

Stdlib only. No network access except the optional `gh` repo check.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

TRAILING_PUNCT = ".,;:!?)\"'"

# Absolute / home-relative paths, e.g. ~/workspace/x.md, /opt/muse/skills/y
PATH_RE = re.compile(r"(~/(?:[^\s`'\"\)\]\}<>|]+)|/(?:opt|home|usr/local|mnt|tmp)/[^\s`'\"\)\]\}<>|]+)")
# Backticked relative refs into a skill's own folders
REL_REF_RE = re.compile(r"`((?:references|scripts|assets|templates|examples|docs)/[^\s`]+)`")
# Markdown links: [text](target)
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
# github.com/owner/repo URLs
GH_URL_RE = re.compile(r"github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?(?:[/)\s`'\"\)\]]|$)")
# Backticked owner/repo (optionally with #issue)
GH_TICK_RE = re.compile(r"`([A-Za-z0-9][A-Za-z0-9_.-]*)/([A-Za-z0-9_.-]+?)(?:#\d+)?`")
# gh CLI usage: gh -R owner/repo, --repo owner/repo, gh repo view owner/repo
GH_CLI_RE = re.compile(r"(?:-R|--repo|repo\s+view)\s+([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)")

# Backticked owner/repo tokens that are not repos (mimetypes, date formats…)
NOT_REPOS = {
    "text/plain", "text/html", "application/json", "application/pdf",
    "image/png", "image/jpeg", "audio/mpeg", "video/mp4",
    "month/day", "yyyy/mm", "mm/dd",
}
# First segments that are folder names, not GitHub owners: `references/x.md`,
# `projects/README.md`, `assets/logo.png` are paths wearing a repo costume.
NOT_OWNERS = {
    "references", "scripts", "assets", "templates", "examples", "docs",
    "system", "projects", "archive", "static", "image", "images", "bin",
    "src", "lib", "text", "application", "audio", "video", "action",
    "ctrl", "cmd", "alt", "shift",
}
# A "repo" whose name ends in a file extension is a file path, not a repo.
FILE_EXTS = (".md", ".py", ".png", ".jpg", ".jpeg", ".gif", ".yaml", ".yml",
             ".json", ".txt", ".html", ".htm", ".sh", ".ts", ".js", ".css",
             ".toml", ".cfg", ".db", ".ttf", ".svg", ".xml", ".csv")


def _looks_like_repo(owner: str, name: str) -> bool:
    if f"{owner}/{name}".lower() in NOT_REPOS:
        return False
    if owner.lower() in NOT_OWNERS:
        return False
    if name.lower().endswith(FILE_EXTS):
        return False
    if "." in owner:  # owners are usernames/orgs; dots mean a path or domain
        return False
    return True

PLACEHOLDER_HINTS = ("{{", "<", ">", "*", "$", "://")
DATE_PLACEHOLDER_RE = re.compile(r"YYYY|XXXX|MM-DD")
REMOTE_HOME_RE = re.compile(r"^/home/([^/]+)/")


@dataclass
class Reference:
    kind: str            # path | relative | link | repo
    value: str           # as written in the document
    source_file: str     # markdown file it was found in
    line: int
    status: str = "unchecked"   # ok | dead | unverified | skipped
    detail: str = ""


@dataclass
class SkillReport:
    name: str
    root: str
    files_scanned: int = 0
    references: list = field(default_factory=list)

    @property
    def dead(self):
        return [r for r in self.references if r.status == "dead"]

    @property
    def ok_count(self):
        return sum(1 for r in self.references if r.status == "ok")


def _clean(token: str) -> str:
    token = token.strip()
    while token and token[-1] in TRAILING_PUNCT:
        token = token[:-1]
    return token


def _is_placeholder(value: str) -> bool:
    return any(h in value for h in PLACEHOLDER_HINTS) or bool(DATE_PLACEHOLDER_RE.search(value))


def extract_references(text: str, source_file: str) -> list[Reference]:
    refs: list[Reference] = []
    seen: set[tuple[str, str, int]] = set()

    def add(kind: str, value: str, line: int):
        value = _clean(value)
        if not value:
            return
        key = (kind, value, line)
        if key in seen:
            return
        seen.add(key)
        refs.append(Reference(kind=kind, value=value, source_file=source_file, line=line))

    for lineno, line in enumerate(text.splitlines(), start=1):
        for m in PATH_RE.finditer(line):
            add("path", m.group(1), lineno)
        for m in REL_REF_RE.finditer(line):
            add("relative", m.group(1), lineno)
        for m in LINK_RE.finditer(line):
            target = m.group(1)
            if target.startswith(("http://", "https://", "mailto:", "#")):
                gh = GH_URL_RE.search(target)
                if gh:
                    add("repo", f"{gh.group(1)}/{gh.group(2)}", lineno)
                continue
            add("link", target.split("#")[0], lineno)
        for m in GH_URL_RE.finditer(line):
            add("repo", f"{m.group(1)}/{m.group(2)}", lineno)
        for m in GH_CLI_RE.finditer(line):
            add("repo", f"{m.group(1)}/{m.group(2)}", lineno)
        for m in GH_TICK_RE.finditer(line):
            if _looks_like_repo(m.group(1), m.group(2)):
                add("repo", f"{m.group(1)}/{m.group(2)}", lineno)
    return refs


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------

def verify_path(ref: Reference, base_dir: Path, home: Path,
                remote_prefixes: tuple[str, ...] = ("/mnt/",),
                current_user: str | None = None) -> None:
    if _is_placeholder(ref.value):
        ref.status, ref.detail = "skipped", "template/placeholder reference"
        return
    raw = ref.value
    if raw.startswith("/tmp/"):
        ref.status, ref.detail = "skipped", "ephemeral /tmp path — existence is not a stable claim"
        return
    m = REMOTE_HOME_RE.match(raw)
    if current_user is not None:
        user = current_user
    elif os.environ.get("USER"):
        user = os.environ["USER"]
    elif home.parent == Path("/home"):
        user = home.name  # USER is often unset in cron/agent shells; HOME is reliable
    else:
        user = ""
    if m and user and m.group(1) != user:
        ref.status = "unverified"
        ref.detail = f"path is under /home/{m.group(1)} — a different host/user than this machine ({user}); not checkable here"
        return
    if any(raw.startswith(p) for p in remote_prefixes):
        ref.status = "unverified"
        ref.detail = "path is under a remote-prefix mount; not checkable from this host (see --remote-prefix)"
        return
    if raw.startswith("~/"):
        target = home / raw[2:]
    elif raw.startswith("/"):
        target = Path(raw)
    else:  # relative / link kinds resolve against the file's directory
        target = base_dir / raw
    ref.status = "ok" if target.exists() else "dead"
    if ref.status == "dead":
        ref.detail = f"not found: {target}"


def make_gh_checker():
    """Return a repo-check function using the gh CLI, or None if unavailable."""
    try:
        probe = subprocess.run(["gh", "--version"], capture_output=True, timeout=10)
        if probe.returncode != 0:
            return None
    except (OSError, subprocess.TimeoutExpired):
        return None
    cache: dict[str, tuple[str, str]] = {}

    def check(repo: str) -> tuple[str, str]:
        if repo in cache:
            return cache[repo]
        try:
            p = subprocess.run(
                ["gh", "repo", "view", repo, "--json", "nameWithOwner"],
                capture_output=True, text=True, timeout=30,
            )
            if p.returncode == 0:
                result = ("ok", "resolved via gh")
            elif "Could not resolve" in p.stderr or "not found" in p.stderr.lower():
                result = ("dead", p.stderr.strip().splitlines()[0] if p.stderr.strip() else "not found")
            else:
                result = ("unverified", (p.stderr.strip().splitlines() or ["gh error"])[0])
        except (OSError, subprocess.TimeoutExpired) as exc:
            result = ("unverified", f"gh check failed: {exc}")
        cache[repo] = result
        return result

    return check


def audit_skill(skill_dir: Path, repo_checker=None, home: Path | None = None,
                remote_prefixes: tuple[str, ...] = ("/mnt/",)) -> SkillReport:
    home = home or Path.home()
    report = SkillReport(name=skill_dir.name, root=str(skill_dir))
    md_files = sorted(skill_dir.rglob("*.md"))
    report.files_scanned = len(md_files)
    for md in md_files:
        try:
            text = md.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for ref in extract_references(text, str(md)):
            if ref.kind in ("path", "relative", "link"):
                # Backticked folder refs (references/…, assets/…) are written
                # relative to the skill root; markdown links are relative to
                # the file that contains them.
                base = skill_dir if ref.kind == "relative" else md.parent
                verify_path(ref, base, home, remote_prefixes=remote_prefixes)
            elif ref.kind == "repo":
                if _is_placeholder(ref.value):
                    ref.status, ref.detail = "skipped", "template/placeholder reference"
                elif repo_checker is None:
                    ref.status, ref.detail = "unverified", "repo check not enabled (use --check-repos)"
                else:
                    ref.status, ref.detail = repo_checker(ref.value)
            report.references.append(ref)
    return report


def find_skills(roots: list[Path]) -> list[Path]:
    skills: list[Path] = []
    for root in roots:
        if not root.exists():
            continue
        if (root / "SKILL.md").exists():
            skills.append(root)
            continue
        for child in sorted(root.iterdir()):
            if child.is_dir() and (child / "SKILL.md").exists():
                skills.append(child)
    return skills


# ---------------------------------------------------------------------------
# Reporting / CLI
# ---------------------------------------------------------------------------

def render_text(reports: list[SkillReport]) -> str:
    out: list[str] = []
    total_dead = 0
    for rep in reports:
        dead = rep.dead
        total_dead += len(dead)
        checked = sum(1 for r in rep.references if r.status in ("ok", "dead"))
        out.append(f"{rep.name}: {rep.files_scanned} file(s), {len(rep.references)} ref(s), "
                   f"{checked} checked, {rep.ok_count} ok, {len(dead)} dead")
        for ref in dead:
            out.append(f"  DEAD [{ref.kind}] {ref.value}  ({Path(ref.source_file).name}:{ref.line})")
    out.append("")
    out.append(f"TOTAL: {len(reports)} skill(s), {total_dead} dead reference(s)")
    return "\n".join(out)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="skill-audit", description=__doc__.splitlines()[0])
    parser.add_argument("roots", nargs="*", help="Skill root dirs (default: custom + system skill dirs)")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    parser.add_argument("--check-repos", action="store_true", help="Verify GitHub repos via the gh CLI")
    parser.add_argument("--strict", action="store_true", help="Also fail on unverified references")
    parser.add_argument("--remote-prefix", action="append", default=["/mnt/"],
                        help="Absolute-path prefix treated as another host's filesystem (repeatable; default /mnt/)")
    args = parser.parse_args(argv)

    if args.roots:
        roots = [Path(r).expanduser() for r in args.roots]
    else:
        roots = [Path.home() / "workspace" / "custom-skills", Path("/opt/muse/skills")]
    skills = find_skills(roots)
    if not skills:
        print("skill-audit: no skills found under: " + ", ".join(str(r) for r in roots), file=sys.stderr)
        return 2

    repo_checker = make_gh_checker() if args.check_repos else None
    if args.check_repos and repo_checker is None:
        print("skill-audit: --check-repos requested but `gh` is unavailable; repos unverified", file=sys.stderr)

    reports = [audit_skill(s, repo_checker=repo_checker,
                           remote_prefixes=tuple(args.remote_prefix)) for s in skills]

    if args.json:
        payload = {
            "skills": [
                {
                    "name": r.name, "root": r.root, "files_scanned": r.files_scanned,
                    "references": [asdict(x) for x in r.references],
                    "dead": len(r.dead), "ok": r.ok_count,
                }
                for r in reports
            ],
            "total_dead": sum(len(r.dead) for r in reports),
        }
        print(json.dumps(payload, indent=2))
    else:
        print(render_text(reports))

    total_dead = sum(len(r.dead) for r in reports)
    if total_dead:
        return 1
    if args.strict and any(r.status == "unverified" for rep in reports for r in rep.references):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
