import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const payloadVersion = process.argv[2] ?? "3.86.0";
const zodVersion = process.argv[3] ?? "4.4.3";
const directory = await mkdtemp(path.join(tmpdir(), "payload-schema-consumer-"));

function run(command, args) {
  execFileSync(command, args, { cwd: directory, stdio: "inherit", timeout: 120_000 });
}

try {
  execFileSync("pnpm", ["pack", "--pack-destination", directory], {
    cwd: packageDirectory,
    stdio: "inherit",
    timeout: 30_000,
  });
  const tarball = (await readdir(directory)).find((name) => name.endsWith(".tgz"));
  assert.ok(tarball, "pnpm pack must produce a tarball");

  const packageJSON = {
    name: "payload-schema-packed-consumer",
    private: true,
    type: "module",
    scripts: { check: "tsc --noEmit && node smoke.mjs" },
    dependencies: {
      "@nexload-sdk/payload-schema": `file:./${tarball}`,
      payload: payloadVersion,
      typescript: "5.9.3",
      zod: zodVersion,
    },
  };
  await writeFile(path.join(directory, "package.json"), `${JSON.stringify(packageJSON, null, 2)}\n`);
  await writeFile(path.join(directory, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      module: "NodeNext",
      moduleResolution: "NodeNext",
      noEmit: true,
      skipLibCheck: true,
      strict: true,
      target: "ES2022",
    },
    include: ["smoke.ts"],
  }, null, 2));
  const program = `
import { defineEntity, field } from "@nexload-sdk/payload-schema";
import { z } from "zod";

const entity = defineEntity({
  name: "Packed",
  fields: {
    title: field.text({ trim: true }),
    status: field.select({ values: ["draft", "live"] as const }),
  },
});

const schema = entity.schema(({ pick }) => pick(["title", "status"]));
const value: z.infer<typeof schema> = { title: "ready", status: "live" };
if (schema.parse(value).title !== "ready") throw new Error("schema parse failed");
if (entity.payload.all().length !== 2) throw new Error("Payload compilation failed");
`;
  await writeFile(path.join(directory, "smoke.ts"), program);
  await writeFile(path.join(directory, "smoke.mjs"), `${program
    .replace('import { z } from "zod";\n', "")
    .replace(/ as const/gu, "")
    .replace(/const value: z\.infer<typeof schema> =/u, "const value =")}
await import("@nexload-sdk/payload-schema/dist/entity/define-entity.js")
  .then(() => { throw new Error("deep import unexpectedly resolved"); })
  .catch((error) => {
    if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error;
  });
`);

  run("pnpm", ["install", "--ignore-workspace", "--no-frozen-lockfile"]);
  run("pnpm", ["run", "check"]);

  const packageRoot = path.join(directory, "node_modules", "@nexload-sdk", "payload-schema");
  const installedManifest = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  assert.deepEqual(Object.keys(installedManifest.exports), [".", "./package.json"]);
} finally {
  await rm(directory, { force: true, recursive: true });
}
