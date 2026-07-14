# Test fixtures

Use a temporary directory as `root` and set `platform: "linux"` to build deterministic cgroup trees. Do not read the developer machine's live `/sys/fs/cgroup` in unit tests.

## V2 fixtures

Cover:

- `memory.current`, finite `memory.max`, optional `memory.high`;
- literal `max` for unlimited memory/swap;
- `cpu.max` with finite fractional quota and with `max`;
- `cpuset.cpus.effective` with lists/ranges;
- source, version, confidence, and detection fields.

## V1 fixtures

Cover nested memory/cpu/cpuset controller files, the large memory unlimited sentinel, non-positive CPU quota, period division, and fallback when v2 files are absent.

## Error fixtures

Test missing files as silent fallback, malformed cpuset input, invalid numeric content, permission-denied warnings where the platform permits a deterministic seam, and non-Linux behavior.

## Policy fixtures

Build a real `containerResourceCheck` around controlled snapshot data and assert exact threshold boundaries and criticality. Test `containerMetricsCollector` separately to prove metrics/resources are exported without changing report status.

Existing package tests already demonstrate CPU-list parsing, v2 fractional quota, v1 unlimited memory, and non-Linux behavior. Extend rather than duplicate these fixtures.

Run build before tests because tests import `dist` output.
