import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  parseCpuList,
  readContainerResourceSnapshot
} from "../dist/index.mjs";

test("parseCpuList counts ranges", () => {
  assert.equal(parseCpuList("0-3,6"), 5);
  assert.equal(parseCpuList("0"), 1);
});

test("cgroup v2 preserves fractional CPU quota", async () => {
  const root = await makeTemp();
  await writeFile(join(root, "memory.current"), "134217728");
  await writeFile(join(root, "memory.max"), "268435456");
  await writeFile(join(root, "memory.high"), "max");
  await writeFile(join(root, "cpu.max"), "50000 100000");
  await writeFile(join(root, "cpuset.cpus.effective"), "0-3");

  const snapshot = await readContainerResourceSnapshot({ root, platform: "linux" });
  assert.equal(snapshot.cgroupVersion, 2);
  assert.equal(snapshot.memory.limitBytes, 268435456);
  assert.equal(snapshot.cpu.quotaCpus, 0.5);
});

test("cgroup v1 unlimited sentinel is treated as no memory limit", async () => {
  const root = await makeTemp();
  await mkdir(join(root, "memory"), { recursive: true });
  await mkdir(join(root, "cpu"), { recursive: true });
  await mkdir(join(root, "cpuset"), { recursive: true });
  await writeFile(join(root, "memory/memory.usage_in_bytes"), "1000");
  await writeFile(join(root, "memory/memory.limit_in_bytes"), String(2 ** 62));
  await writeFile(join(root, "cpu/cpu.cfs_quota_us"), "-1");
  await writeFile(join(root, "cpu/cpu.cfs_period_us"), "100000");
  await writeFile(join(root, "cpuset/cpuset.cpus"), "0-1");

  const snapshot = await readContainerResourceSnapshot({ root, platform: "linux" });
  assert.equal(snapshot.cgroupVersion, 1);
  assert.equal(snapshot.memory.limitBytes, null);
  assert.equal(snapshot.cpu.quotaCpus, null);
  assert.equal(snapshot.cpu.cpusetCpus, 2);
});

test("non-linux falls back without detecting cgroups", async () => {
  const snapshot = await readContainerResourceSnapshot({ root: await makeTemp(), platform: "darwin" });
  assert.equal(snapshot.detected, false);
  assert.equal(snapshot.cgroupVersion, null);
});

async function makeTemp() {
  const path = join(os.tmpdir(), `healthcheck-${Date.now()}-${Math.random()}`);
  await mkdir(path, { recursive: true });
  return path;
}
