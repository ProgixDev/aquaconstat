# Critical User Journeys (CUJs)

The journeys that must never break. Each CUJ has: an owner, an e2e spec in `e2e/`, and labeled screenshots captured by `pnpm e2e:shots`. CI runs all of them on every PR; `/verify-ui` re-runs the ones a change touches.

Adding or changing a CUJ is a product decision — PR must be approved by the product owner.

## Registry

| ID     | Journey                  | Steps (user's words)                                                                                           | E2E spec             | Screenshots |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| CUJ-01 | Land and start a dossier | Open `/` → understand the offer and the price → « Démarrer mon dossier »                                       | `e2e/home.spec.ts`   | `home-*`    |
| CUJ-02 | Submit a dossier         | `/dossier` → coordonnées + lieu → pièces touchées et travaux → photos → paiement → confirmation avec référence | `e2e/funnel.spec.ts` | `funnel-*`  |
| CUJ-03 | Admin reviews a dossier  | `/admin/connexion` → mot de passe → voir ce qui est en retard → ouvrir un dossier → photos → déconnexion       | `e2e/admin.spec.ts`  | `admin-*`   |

> **Drift resolved (2026-07-23).** The duplicate `CUJ-02` is gone: the task-list demo row was
> retired with the route it described. `/examples/tasks`, `/sign-in` and `/account` were skeleton
> scaffolding shipping on a client site, and were removed with spec 006 (AC-10), so their journey
> is no longer critical — or reachable. `src/features/task-list/` itself is **kept, unrouted**, as
> the canonical slice the conventions tell agents to mirror.

## Rules

- A new feature with user-visible surface MUST either extend an existing CUJ or register a new one in this table (the `/create-spec` template asks).
- Each step in a journey asserts something the _user_ can see (text, role, state) — not implementation details.
- Screenshot names are stable (`<cuj>-<step>`), so reports and reviews can diff them release over release.
- When a CUJ changes intentionally, update the spec, this table, and the screenshots in the same PR — `/update-docs` walks you through it.
