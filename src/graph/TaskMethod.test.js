import { describe, expect, it } from "vitest";
import { test2 } from "@/data";
import TaskMethod from "./TaskMethod";
import MermaidDataBuilder from "./MermaidDataBuilder";

describe("TaskMethod", () => {
  const method = new TaskMethod();

  it("finds predecessors and successors", () => {
    expect(method.getTachePredecesseur("a", test2)).toBe("deb");
    expect(method.getTacheSuccesseur("a", test2)).toBe("b");
    expect(method.getTachePredecesseur("fin", test2)).toEqual(["k", "l"]);
  });

  it("finds the maximum finish duration", () => {
    expect(method.getMaxFin([
      ["a", 8, "b"],
      ["k", 72, "fin"],
      ["l", 76, "fin"],
    ])).toBe(76);
  });
});

describe("MermaidDataBuilder", () => {
  it("computes earliest/latest dates and critical path data", () => {
    const builder = new MermaidDataBuilder(test2);

    expect(builder.allDateTot.find(([task]) => task === "a")[1]).toBe(8);
    expect(builder.allDateTot.find(([task]) => task === "l")[1]).toBe(108);
    expect(builder.allDateTard.get("l")).toBe(72);
    expect(builder.criticalPathData).toContain("l");
    expect(builder.mermaidData.length).toBeGreaterThan(0);
  });
});
