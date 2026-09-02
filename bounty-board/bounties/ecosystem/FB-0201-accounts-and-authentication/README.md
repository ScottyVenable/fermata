# FB-0201: Accounts, authentication, and roles for the website

> **Track** `ecosystem` · **Size** `l` · **Difficulty** `advanced` · **Reward** `380 REP` (+80 bonus)
> **Status** `open` · **Claim TTL** 60 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

Build login for fermata.dev. GitHub OAuth as the primary path — because a contributor's GitHub
identity is what the repo already records, and linking the two is what makes reputation
meaningful — plus sessions, roles derived from REP tier, and the authorisation layer every other
surface depends on.

---

## Context

- **Why GitHub OAuth first:** every `fermata.json` author, every ledger subject, and every claim
  is keyed by a GitHub handle. Authenticating through GitHub means identity is verified rather
  than claimed, and REP maps to a real person on day one with no manual linking.
- **Why roles are derived, not assigned:** [REPUTATION.md § Tiers](../../../REPUTATION.md#tiers)
  already defines what each tier can do. The site must read those permissions from REP rather
  than maintaining a second, divergent permission system.
- **Depends on [FB-0200](../FB-0200-fermata-website-and-ecosystem/):** the shell, the database,
  and the user table have to exist first.

---

## Scope

| What | Detail |
| --- | --- |
| GitHub OAuth | Full authorization-code flow with PKCE and state validation |
| Sessions | HTTP-only, secure, SameSite cookies; server-side session records; rotation on privilege change |
| User records | Handle, GitHub id, avatar, email (private by default), created, last seen |
| Role derivation | Tier from lifetime REP, recomputed on ledger change; maintainer flag from repo write access |
| Authorisation | A single server-side policy layer every mutation goes through |
| Bot accounts | Machine identities with an operator link and the bot restrictions from GOVERNANCE.md |
| Account management | Sign out everywhere, revoke sessions, delete account with a documented data path |

---

## Out of scope

- Password authentication. OAuth and, optionally, magic links. No password storage, ever.
- Email verification flows beyond what GitHub already guarantees.
- Organisations, teams, or shared accounts.
- Two-factor authentication — inherited from GitHub.
- Building the profile *page*. That's [FB-0204](../FB-0204-profiles-and-customization/); this
  bounty owns the record behind it.

---

## Acceptance criteria

- [ ] "Sign in with GitHub" completes the OAuth authorization-code flow with PKCE and a verified
      `state` parameter, and creates or updates a user record keyed by the immutable GitHub user
      id (not the handle, which can change).
- [ ] Sessions are HTTP-only, `Secure`, `SameSite=Lax` cookies backed by server-side records,
      expire on a documented schedule, and are rotated whenever privileges change.
- [ ] A user's tier and permissions are derived from their REP at request time (or from a cache
      invalidated on ledger change), and match [REPUTATION.md § Tiers](../../../REPUTATION.md#tiers)
      exactly — verified with a test per tier.
- [ ] Every mutating endpoint passes through one shared server-side authorisation policy;
      a test proves that a signed-out and an under-tiered request are both rejected for each
      protected action.
- [ ] Bot accounts can be registered with a required operator link, and are blocked from
      reviewing, approving, and promoting, per [GOVERNANCE.md § Bot contributors](../../../GOVERNANCE.md#bot-contributors).
- [ ] Users can view active sessions, revoke them individually or all at once, and delete their
      account — with the documented consequence that ledger events remain (they're history) while
      profile data is removed.
- [ ] Security tests cover: CSRF on all state-changing requests, open-redirect on the OAuth
      callback, session fixation, and privilege escalation by tier tampering.
- [ ] Handle changes on GitHub are handled: the user keeps their identity and REP, and the old
      handle redirects.

### Bonus

- [ ] Fine-grained personal access tokens for the public API, scoped, revocable, and displayed
      once at creation — so the desktop app and bots can authenticate without a browser session.

---

## Deliverables

1. Auth routes, session middleware, and the policy layer in `projects/web/fermata-web/`.
2. Database migrations for users, sessions, and tokens.
3. A test suite covering the security cases above.
4. An "Authentication" section in `docs/WEB.md`, including the threat model.

---

## Definition of done

- All acceptance criteria checked, with the security test suite passing in CI.
- No secrets in the repository; every credential documented as an environment variable.
- Threat model written and reviewed by a maintainer.
- Reviewed and approved by a maintainer.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 380 |
| Bonus (API tokens) | 80 |
| Applicable multipliers | ×1.0 |

---

## Getting started

Read [`GOVERNANCE.md § Roles`](../../../GOVERNANCE.md#roles) and
[`REPUTATION.md § Tiers`](../../../REPUTATION.md#tiers) before you write a line — the permission
model is fully specified there, and the job is implementing it faithfully rather than designing it.

Coordinate with whoever holds [FB-0200](../FB-0200-fermata-website-and-ecosystem/): the user
table is theirs, the auth flow is yours, and the seam between them should be agreed in writing
on both claim PRs.

---

## Notes

- Use a well-audited library for the OAuth and session mechanics. Hand-rolled auth is the one
  place in this repo where "no dependencies" is the wrong instinct.
- Deleting an account must not delete ledger events. They're an append-only historical record
  and other people's awards reference them. Document this clearly at the point of deletion.
