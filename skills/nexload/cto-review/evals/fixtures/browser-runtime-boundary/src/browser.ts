// Leaks entire package root including Node-only fs secret loader into browser bundle
export * from "./index.js";
