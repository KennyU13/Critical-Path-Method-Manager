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
    expect(
      method.getMaxFin([
        ["a", 8, "b"],
        ["k", 72, "fin"],
        ["l", 76, "fin"],
      ])
    ).toBe(76);
  });

  it("builds a CPM schedule independent from task order", () => {
    const schedule = method.buildSchedule([
      ["d", 1, "fin"],
      ["b", 4, "d"],
      ["a", 2, ["b", "c"]],
      ["c", 4, "d"],
    ]);

    expect(schedule.projectDuration).toBe(7);
    expect(schedule.earliestStart.get("a")).toBe(0);
    expect(schedule.earliestFinish.get("d")).toBe(7);
    expect(schedule.latestStart.get("b")).toBe(2);
    expect(schedule.latestStart.get("c")).toBe(2);
    expect(schedule.criticalTasks).toEqual(["a", "b", "c", "d"]);
  });

  it("keeps compact one-letter successor input compatible with the UI", () => {
    const schedule = method.buildSchedule([
      ["a", 2, "bc"],
      ["b", 4, "d"],
      ["c", 4, "d"],
      ["d", 1, "fin"],
    ]);

    expect(schedule.successors.get("a")).toEqual(["b", "c"]);
    expect(schedule.projectDuration).toBe(7);
  });
});

describe("MermaidDataBuilder", () => {
  it("computes earliest/latest dates and critical path data", () => {
    const builder = new MermaidDataBuilder(test2);

    expect(builder.allDateTot.find(([task]) => task === "a")[1]).toBe(8);
    expect(builder.allDateTot.find(([task]) => task === "l")[1]).toBe(108);
    expect(builder.allDateTard.get("l")).toBe(72);
    expect(builder.criticalPathData).toEqual(["a", "b", "d", "g", "h", "l"]);
    expect(builder.mermaidData.length).toBeGreaterThan(0);
  });
});
