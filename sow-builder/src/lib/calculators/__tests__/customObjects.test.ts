import { describe, expect, it } from "vitest";
import { calculateCustomObjectsLineItem, computeCustomObjects } from "../customObjects";

// Fixture from Sow Calcs 8.26.26.xlsx, "custom objects" sheet, row 43 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  objectName: "Client Lookup Object (EXAMPLE)",
  fieldCount: 30,
  relationshipFieldCount: 2,
  migrationNeeded: false,
  uiType: "Read-only sidebar" as const,
  uiScreenCount: 1,
};

describe("calculateCustomObjectsLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateCustomObjectsLineItem(EXAMPLE_INPUT);
    expect(result.designHours).toBeCloseTo(8.5);
    expect(result.buildHours).toBeCloseTo(14.5);
    expect(result.migrationHours).toBe(0);
    expect(result.uiHours).toBe(30);
    expect(result.qaHours).toBeCloseTo(7.95);
    expect(result.docsHours).toBeCloseTo(0.2);
    expect(result.totalHours).toBeCloseTo(61.15);
    expect(result.totalCost).toBeCloseTo(15776.7, 1);
  });

  it("charges migration hours only when migration is needed", () => {
    const result = calculateCustomObjectsLineItem({ ...EXAMPLE_INPUT, migrationNeeded: true });
    expect(result.migrationHours).toBe(8);
  });

  it("uses Admin CRUD UI base + per-screen hours", () => {
    const result = calculateCustomObjectsLineItem({ ...EXAMPLE_INPUT, uiType: "Admin CRUD UI", uiScreenCount: 2 });
    expect(result.uiHours).toBe(40 + 2 * 10);
  });

  it("charges nothing for UI when type is None", () => {
    const result = calculateCustomObjectsLineItem({ ...EXAMPLE_INPUT, uiType: "None", uiScreenCount: 3 });
    expect(result.uiHours).toBe(0);
  });
});

describe("computeCustomObjects", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result, effortBand } = computeCustomObjects([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBeCloseTo(61.15);
    expect(result.pmHours).toBeCloseTo(21.4025);
    expect(result.finalHours).toBeCloseTo(82.5525);
    expect(result.finalCost).toBeCloseTo(21298.545, 1);
    expect(effortBand).toBe("Mid");
  });

  it("bands as Low for a single small object with no relationship fields", () => {
    const { effortBand } = computeCustomObjects(
      [{ ...EXAMPLE_INPUT, fieldCount: 10, relationshipFieldCount: 0 }],
      "standard"
    );
    expect(effortBand).toBe("Low");
  });

  it("bands as High beyond the Mid thresholds", () => {
    const { effortBand } = computeCustomObjects(
      [
        { ...EXAMPLE_INPUT, fieldCount: 60 },
        { ...EXAMPLE_INPUT, objectName: "Second", fieldCount: 60 },
        { ...EXAMPLE_INPUT, objectName: "Third", fieldCount: 60 },
      ],
      "standard"
    );
    expect(effortBand).toBe("High");
  });

  it("returns null effort band when there are no line items", () => {
    const { effortBand } = computeCustomObjects([], "standard");
    expect(effortBand).toBeNull();
  });
});
