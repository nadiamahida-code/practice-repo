import { describe, expect, it } from "vitest";
import { computeLineItemTotals, computeModuleEffortBands, computeSowTotals } from "../aggregate";
import type { LineItem, SowState } from "../types";
import type { SupportLineItemInput } from "../support";
import type { MultiBrandLineItemInput } from "../multiBrand";
import type { CustomObjectLineItemInput } from "../customObjects";

const supportItem: LineItem<SupportLineItemInput> = {
  id: "li-1",
  moduleId: "support",
  name: "Support Implementation",
  timeline: "standard",
  inputs: {
    scopeName: "Support Implementation",
    discoveryTier: "Standard",
    groupCount: 3,
    businessRuleCount: 40,
    includeGuideOob: true,
    additionalActionFlows: 1,
  },
};

const multiBrandItem: LineItem<MultiBrandLineItemInput> = {
  id: "li-2",
  moduleId: "multiBrand",
  name: "Multi-Brand Setup",
  timeline: "standard",
  inputs: { scopeName: "Multi-Brand Setup", totalBrands: 5 },
};

describe("computeLineItemTotals", () => {
  it("matches the module's own Section 3 result for a single-row line item", () => {
    const totals = computeLineItemTotals(supportItem);
    expect(totals.hoursPreP).toBe(37);
    expect(totals.pmHours).toBeCloseTo(12.95);
    expect(totals.finalHours).toBeCloseTo(49.95);
    expect(totals.finalCost).toBeCloseTo(12887.1, 1);
  });

  it("throws for the customHC placeholder module", () => {
    const item: LineItem = { id: "x", moduleId: "customHC", name: "x", timeline: "standard", inputs: {} };
    expect(() => computeLineItemTotals(item)).toThrow();
  });
});

describe("computeSowTotals", () => {
  it("sums finalHours/finalCost across line items from different modules", () => {
    const sow: SowState = { lineItems: [supportItem, multiBrandItem] };
    const totals = computeSowTotals(sow);

    expect(totals.totalHours).toBeCloseTo(49.95 + 20.25);
    expect(totals.totalCost).toBeCloseTo(12887.1 + 5224.5, 1);
    expect(totals.lineItemTotals["li-1"].finalHours).toBeCloseTo(49.95);
    expect(totals.lineItemTotals["li-2"].finalHours).toBeCloseTo(20.25);
  });

  it("sums correctly even when line items use different timelines", () => {
    const rushed: LineItem<SupportLineItemInput> = { ...supportItem, id: "li-3", timeline: "under-3-weeks" };
    const sow: SowState = { lineItems: [supportItem, rushed] };
    const totals = computeSowTotals(sow);

    const standardOnly = computeLineItemTotals(supportItem).finalCost;
    const rushedOnly = computeLineItemTotals(rushed).finalCost;
    expect(totals.totalCost).toBeCloseTo(standardOnly + rushedOnly, 1);
    expect(rushedOnly).toBeGreaterThan(standardOnly); // 1.4x multiplier vs 1.0x
  });

  it("skips customHC line items instead of throwing", () => {
    const placeholder: LineItem = { id: "li-placeholder", moduleId: "customHC", name: "Custom HC", timeline: "standard", inputs: {} };
    const sow: SowState = { lineItems: [supportItem, placeholder] };
    const totals = computeSowTotals(sow);

    expect(totals.lineItemTotals["li-placeholder"]).toBeUndefined();
    expect(totals.totalHours).toBeCloseTo(49.95);
  });

  it("groups effort bands per module across the whole SOW, not per row", () => {
    const smallObject: LineItem<CustomObjectLineItemInput> = {
      id: "co-1",
      moduleId: "customObjects",
      name: "Small Object",
      timeline: "standard",
      inputs: { objectName: "Small Object", fieldCount: 10, relationshipFieldCount: 0, migrationNeeded: false, uiType: "None", uiScreenCount: 0 },
    };
    // Alone this object would band "Low" (<=1 object, <25 fields, no relationships).
    const aloneBand = computeModuleEffortBands({ lineItems: [smallObject] });
    expect(aloneBand).toEqual([{ moduleId: "customObjects", effortBand: "Low" }]);

    // A second object in the same SOW pushes the module-level count past the Low threshold.
    const secondObject: LineItem<CustomObjectLineItemInput> = {
      ...smallObject,
      id: "co-2",
      inputs: { ...smallObject.inputs, objectName: "Second Object" },
    };
    const combinedBand = computeModuleEffortBands({ lineItems: [smallObject, secondObject] });
    expect(combinedBand).toEqual([{ moduleId: "customObjects", effortBand: "Mid" }]);
  });

  it("returns no effort bands when no scored modules are present", () => {
    const sow: SowState = { lineItems: [supportItem, multiBrandItem] };
    expect(computeSowTotals(sow).moduleEffortBands).toEqual([]);
  });
});
