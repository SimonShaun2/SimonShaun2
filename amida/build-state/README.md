# /build-state/

Per-agent JSON contracts used by the v3 multi-agent orchestrator protocol.

Each `A{N}.status.json` file contains:

- `agent` / `name` / `status` — agent id and completion state
- `artifacts` — absolute (relative to /amida/) list of files owned by this
  agent
- `contracts_published` — boolean / value contracts downstream agents depend
  on

Downstream agents block until the upstream agent(s) they depend on publish
`status: "complete"`. If running as a single agent, these files also serve
as a build ledger — useful for diffing against prior builds.
