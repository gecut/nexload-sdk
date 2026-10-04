# @nexload-sdk/system-probes

Runtime-neutral probe manager (`./core`) with discrete host adapters for Node (`./node`) and Bun (`./bun`).

Both adapters implement `SystemProbe`. Core never imports Node or Bun APIs.
