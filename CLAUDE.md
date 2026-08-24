# Fidson-CRM — prototype + planning repo

Two things live here, and only two:

1. **The demo prototype** (Vite + React + TS) of the Fidson FieldForce SFA-CRM. Demo-ware: scripted data, no backend. The production system is built separately in the **fidrep** repo (Tales-Consulting/fidrep) and depends on nothing here except the registries below.
2. **Historical planning material** (`docs/planning/`). The artifact registry and enabler registry that once lived there moved into the fidrep repo as `docs/registry.md` (2026-08-23); what remains here is archive, not a source of truth.

## Sources of truth

- **User stories & milestones: Jira, project FID** (talesconsulting.atlassian.net). Never maintained in markdown here. Drafts may be written for review, then pushed to Jira and **deleted**.
- **Build rules, architecture, runbooks: the fidrep repo's `docs/`.** This repo holds no build rules.
- **Artifact shapes:** designed in fidrep's `docs/registry.md`; once codified, the Zod contracts in fidrep's `packages/contracts` are the source of truth for shape.

## Knowledge base

Tales' cross-project methodology lives in the `Tales-Consulting/knowledge` repo (locally `Dev/knowledge/`), separate from both project repos. **To build or maintain it, read `okf-spec.md` at its root (OKF v0.2) — the authoritative format spec; never guess the format.** (A local copy of the spec sits at `docs/SPEC.md` here, untracked — `docs/*` is gitignored; the knowledge repo's copy is canonical.)

## Prototype commands

```
npm install && npm run dev
```
