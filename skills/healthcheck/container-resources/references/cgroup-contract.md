# Cgroup contract

## Detection order

On Linux, `readContainerResourceSnapshot` checks cgroup v2 root files first: memory current/max/high, swap current/max, `cpu.max`, and `cpuset.cpus.effective`. It then falls back to v1 memory/cpu/cpuset controller paths. Non-Linux returns without cgroup detection.

`root` and `platform` options are public testing seams. Keep real runtime paths as defaults.

## Unlimited values

- v2 literal `max` means unlimited and maps to null.
- v1 memory limits at or above `2 ** 60` are treated as unlimited/null.
- v1 CPU quota at or below zero means unlimited/null.

Do not convert unlimited to zero or unhealthy. Current positive-number parsing maps numeric zero to null; do not document null as measured zero.

## CPU

CPU quota equals quota divided by period. Preserve fractional results such as `50000 / 100000 = 0.5`.

`parseCpuList` handles comma-separated CPUs and ranges. Cpuset count, quota CPUs, runtime available parallelism, and host logical CPU count are candidates. Effective CPU is the minimum positive finite candidate.

## Evidence

Snapshot fields include cgroup version, detected/likely hints, source, confidence, and warnings. `detected` or `isContainerLikely` indicates evidence, not certainty that the workload runs inside Docker/Kubernetes.

Permission errors add `permission-denied:<path>` warnings. Missing files are silent and permit fallback. Preserve these distinctions for diagnosis.

`nodeRuntimeAdapter` may combine cgroup memory with constrained/process/OS fallbacks. Do not claim the raw cgroup snapshot itself includes all Node process fallbacks.
