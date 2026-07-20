import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function resolveVersion(requested) {
  if (requested !== "latest") return requested;
  const versions = JSON.parse(run("pnpm", ["view", "payload@3", "version", "--json"], packageRoot));
  return Array.isArray(versions) ? versions.at(-1) : versions;
}

const requestedVersion = process.argv[2] ?? "3.68.5";
const payloadVersion = resolveVersion(requestedVersion);
const directory = await mkdtemp(join(tmpdir(), "payload-editor-consumer-"));
const sourceManifest = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));

try {
  const packOutput = run("pnpm", ["pack", "--pack-destination", directory, "--json"], packageRoot);
  const packResult = JSON.parse(packOutput);
  const tarballName = Array.isArray(packResult) ? packResult[0].filename : packResult.filename;
  const tarballPath = join(directory, basename(tarballName));

  await writeFile(join(directory, "package.json"), JSON.stringify({
    name: "payload-editor-consumer-smoke",
    private: true,
    type: "module",
    dependencies: {
      "@nexload-sdk/payload-editor": `file:${tarballPath}`,
      "@payloadcms/richtext-lexical": payloadVersion,
      payload: payloadVersion,
    },
  }, null, 2));

  await writeFile(join(directory, "smoke.mjs"), `
import { createEditor } from "@nexload-sdk/payload-editor";
import { buildConfig } from "payload";

const config = await buildConfig({
  secret: "packed-payload-editor-consumer-secret",
  editor: createEditor({ preset: "standard" }),
  collections: [{
    slug: "pages",
    fields: [{
      name: "content",
      type: "richText",
      editor: createEditor({ preset: "article" }),
    }],
  }],
});

if (!config.editor.features.some((feature) => feature.key === "paragraph")) {
  throw new Error("Root editor did not resolve the paragraph feature.");
}
`);

  run("pnpm", ["install", "--ignore-workspace", "--no-frozen-lockfile"], directory);
  run("node", ["smoke.mjs"], directory);

  const manifest = JSON.parse(await readFile(join(directory, "node_modules/@nexload-sdk/payload-editor/package.json"), "utf8"));
  assert.equal(manifest.version, sourceManifest.version);
  assert.equal(manifest.exports["."].import, "./dist/index.js");
  console.log(`Packed consumer passed with Payload ${payloadVersion}.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
