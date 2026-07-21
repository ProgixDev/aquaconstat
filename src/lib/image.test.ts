import { describe, expect, it } from "vitest";
import { computeTargetSize, MAX_EDGE } from "./image";

describe("computeTargetSize", () => {
  it("leaves an image already within the limit untouched", () => {
    expect(computeTargetSize(1200, 800)).toEqual({ width: 1200, height: 800 });
    expect(computeTargetSize(MAX_EDGE, MAX_EDGE)).toEqual({ width: MAX_EDGE, height: MAX_EDGE });
  });

  it("scales a landscape photo to the long edge, keeping the ratio", () => {
    // 4000×3000 (4:3) → long edge 1600, short edge 1200.
    expect(computeTargetSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales a portrait photo by its height", () => {
    expect(computeTargetSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it("never upscales a small image", () => {
    expect(computeTargetSize(400, 300)).toEqual({ width: 400, height: 300 });
  });

  it("honors a custom max edge", () => {
    expect(computeTargetSize(2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
  });

  it("handles a zero dimension without dividing by zero", () => {
    expect(computeTargetSize(0, 0)).toEqual({ width: 0, height: 0 });
  });
});
