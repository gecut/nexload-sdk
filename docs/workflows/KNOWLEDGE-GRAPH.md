# Knowledge Graph Protocol (`graphify`)

The `nexload-sdk` repository maintains an authoritative code knowledge graph in `graphify-out/`. This document outlines the mandatory rules and workflow commands for utilizing and maintaining it.

---

## 1. What is `graphify`?

`graphify` is an ultra-fast, local, AST-only static analysis engine. It extracts:
- All symbol definitions (functions, classes, interfaces, type aliases, variables).
- Inter-file import/export dependency relationships.
- High-centrality "God Nodes" (the architectural hubs of the codebase).
- Community clusters across the monorepo.

Because `graphify` runs 100% locally using Tree-sitter AST parsing, it incurs **zero API cost**, operates in seconds, and provides exact graph-based navigation.

---

## 2. Mandatory Rules for Agents

> [!IMPORTANT]
> **RULE 1: Query Before Grepping**  
> When exploring symbols, callers, dependencies, or architectural connections, you MUST query the graph first instead of running exhaustive `grep` or reading directory trees blindly.

> [!IMPORTANT]
> **RULE 2: Sync Graph After Changes**  
> After modifying, adding, or deleting any code or markdown files in this repository, you MUST run:
> ```bash
> graphify update .
> ```
> before concluding your task.

> [!IMPORTANT]
> **RULE 3: Never Revert Graph Artifacts**  
> Running `graphify update .` modifies files in `graphify-out/` (`graph.json`, `graph.html`, `GRAPH_REPORT.md`, `manifest.json`). These dirty git changes are normal, expected, and mandatory. Never revert them.

---

## 3. Essential CLI Commands

### Targeted Questions
Query the graph using natural language or symbol names to retrieve a tightly scoped subgraph:
```bash
graphify query "Where is createPayloadOperationEndpoint defined and used?"
```

### Symbol & Module Inspection
Inspect an exact symbol's incoming and outgoing connections:
```bash
graphify explain "packages/payload-operations/src/index.ts::createPayloadOperationEndpoint"
```

### Dependency & Connection Paths
Find the shortest architectural path between two files or symbols:
```bash
graphify path "@nexload-sdk/env" "@nexload-sdk/logger"
```

### Architectural Hubs (God Nodes)
Find the most heavily connected symbols and packages in the workspace:
```bash
graphify god-nodes
```

---

## 4. Graph Artifacts in `graphify-out/`

- `graph.json`: The complete serialized graph node and edge database.
- `graph.html`: Interactive, searchable 3D/2D visual graph visualization.
- `GRAPH_REPORT.md`: Comprehensive static report detailing cluster communities, god nodes, and coupling metrics.
- `manifest.json`: AST extraction metadata and cache fingerprints.
