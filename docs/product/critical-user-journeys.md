# Critical User Journeys (CUJs)

The journeys that must never break. Each CUJ has: an owner, an e2e spec in `e2e/`, and labeled screenshots captured by `pnpm e2e:shots`. CI runs all of them on every PR; `/verify-ui` re-runs the ones a change touches.

Adding or changing a CUJ is a product decision — PR must be approved by the product owner.

## Registry

| ID     | Journey                     | Steps (user's words)                                                                                           | E2E spec                | Screenshots |
| ------ | --------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------- |
| CUJ-01 | Land and start a dossier    | Open `/` → understand the offer and the price → « Démarrer mon dossier »                                       | `e2e/home.spec.ts`      | `home-*`    |
| CUJ-02 | Submit a dossier            | `/dossier` → coordonnées + lieu → pièces touchées et travaux → photos → paiement → confirmation avec référence | `e2e/funnel.spec.ts`    | `funnel-*`  |
| CUJ-03 | Admin reviews a dossier     | `/admin/connexion` → mot de passe → voir ce qui est en retard → ouvrir un dossier → photos → déconnexion       | `e2e/admin.spec.ts`     | `admin-*`   |
| CUJ-02 | Manage tasks (demo feature) | Open `/examples/tasks` → add a task → see it appear (animated) → toggle it done → remaining count updates      | `e2e/task-list.spec.ts` | `tasks-*`   |

> **Drift, needs a product decision (2026-07-16).** This table had only CUJ-01/02 while
> `specs/004-admin` and `e2e/admin.spec.ts` both already claimed a CUJ-03 — that row is added
> above. Two problems remain and are deliberately **not** fixed unilaterally, because renumbering
> a CUJ is the product owner's call:
>
> 1. **`CUJ-02` is claimed twice** — by the funnel (the real product journey) and by the
>    task-list demo inherited from the skeleton. One of them needs a new number.
> 2. **The task-list demo is not a critical journey of this product.** `/examples/tasks` is
>    skeleton scaffolding; if it is not shipping, its CUJ and spec 001 should retire with it.

## Rules

- A new feature with user-visible surface MUST either extend an existing CUJ or register a new one in this table (the `/create-spec` template asks).
- Each step in a journey asserts something the _user_ can see (text, role, state) — not implementation details.
- Screenshot names are stable (`<cuj>-<step>`), so reports and reviews can diff them release over release.
- When a CUJ changes intentionally, update the spec, this table, and the screenshots in the same PR — `/update-docs` walks you through it.
