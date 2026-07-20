# Release validation

Build before tests because tests import `dist`. Confirm one ESM root, declarations, external Payload imports, no CJS, and no React/UI/CSS/browser/provider leakage. The uncompressed root budget is 50 KiB.

Pack and install outside the workspace. Validate docs catalog, generated LLM indexes, package skills, frozen lockfile, and Changeset. Publishing remains separately authorized.
