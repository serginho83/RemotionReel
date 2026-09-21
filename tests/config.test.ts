import assert from "node:assert/strict";
import test from "node:test";
import {durationInFrames, parseReelConfig} from "../src/config.ts";

const valid = {
  brand: "Test",
  handle: "@test",
  fps: 30,
  callToAction: "Vai",
  scenes: [{title: "Ciao", durationInSeconds: 2}],
};

test("valida e calcola la durata del reel", () => {
  const config = parseReelConfig(valid);
  assert.equal(durationInFrames(config), 60);
});

test("rifiuta una scena senza titolo", () => {
  assert.throws(
    () => parseReelConfig({...valid, scenes: [{durationInSeconds: 2}]}),
    /deve avere un titolo/,
  );
});

test("rifiuta un frame rate fuori intervallo", () => {
  assert.throws(() => parseReelConfig({...valid, fps: 12}), /tra 24 e 60/);
});
