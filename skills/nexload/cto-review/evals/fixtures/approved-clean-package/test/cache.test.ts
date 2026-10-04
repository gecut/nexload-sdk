import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LruCache } from "../src/index.js";

describe("LruCache", () => {
  it("evicts oldest key when capacity exceeded", () => {
    const cache = new LruCache<string, number>({ maxSize: 2 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    assert.equal(cache.get("a"), undefined);
    assert.equal(cache.get("b"), 2);
    assert.equal(cache.get("c"), 3);
  });
});
