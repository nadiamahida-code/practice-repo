import { describe, expect, it } from "vitest";
import { calculateMigrationLineItem, computeMigration } from "../migration";

// Fixture from Sow Calcs 8.26.26.xlsx, "Migration" sheet, row 50 (the EXAMPLE row).
const EXAMPLE_INPUT = {
  scopeName: "Closed Tickets (EXAMPLE)",
  ticketCount: 120000,
  attachmentCount: 0,
  customFieldCount: 20,
  openTicketCount: 260,
  sourceSystem: "API pull" as const,
  migrationMethod: "Custom developer" as const,
};

describe("calculateMigrationLineItem", () => {
  it("matches the sheet's worked example row", () => {
    const result = calculateMigrationLineItem(EXAMPLE_INPUT);
    expect(result.mappingHours).toBe(4);
    expect(result.volumeHours).toBe(24);
    expect(result.attachmentHours).toBe(0);
    expect(result.openTicketHours).toBe(5.5);
    expect(result.qaHours).toBeCloseTo(5.025);
    expect(result.totalHours).toBeCloseTo(39.05833333, 5);
    expect(result.totalCost).toBeCloseTo(10077.05, 1);
  });

  it("uses the flat <=10-field mapping tier", () => {
    const result = calculateMigrationLineItem({ ...EXAMPLE_INPUT, customFieldCount: 10 });
    expect(result.mappingHours).toBe(2);
  });

  it("adds mapping hours per 20-field grouping beyond 30", () => {
    const result = calculateMigrationLineItem({ ...EXAMPLE_INPUT, customFieldCount: 50 });
    expect(result.mappingHours).toBe(4 + 4); // 1 grouping of 20 beyond 30
  });

  it("uses the manual open-ticket approach at or under the 200 threshold", () => {
    const result = calculateMigrationLineItem({ ...EXAMPLE_INPUT, openTicketCount: 200 });
    expect(result.openTicketHours).toBe(3);
  });

  it("applies the CSV export multiplier (0.75x)", () => {
    const result = calculateMigrationLineItem({ ...EXAMPLE_INPUT, sourceSystem: "CSV export" });
    const preQa = (4 + 24 + 0 + 5.5) * 0.75;
    expect(result.qaHours).toBeCloseTo(preQa * 0.15);
  });

  it("adds the migration-tool method overhead", () => {
    const result = calculateMigrationLineItem({ ...EXAMPLE_INPUT, migrationMethod: "Migration tool (e.g. Relokia)" });
    const withoutOverhead = calculateMigrationLineItem(EXAMPLE_INPUT);
    expect(result.totalHours).toBeCloseTo(withoutOverhead.totalHours + 10);
  });
});

describe("computeMigration", () => {
  it("matches the sheet's Section 3 result for the single example row, Standard timeline", () => {
    const { result, effortBand } = computeMigration([EXAMPLE_INPUT], "standard");
    expect(result.totalHoursPreP).toBeCloseTo(39.05833333, 5);
    expect(result.pmHours).toBeCloseTo(13.67041667, 5);
    expect(result.finalHours).toBeCloseTo(52.72875, 4);
    expect(result.finalCost).toBeCloseTo(13604.0175, 1);
    expect(effortBand).toBe("Mid");
  });

  it("bands as Low under 25,000 total tickets", () => {
    const { effortBand } = computeMigration([{ ...EXAMPLE_INPUT, ticketCount: 10000 }], "standard");
    expect(effortBand).toBe("Low");
  });

  it("bands as High above 150,000 total tickets", () => {
    const { effortBand } = computeMigration([{ ...EXAMPLE_INPUT, ticketCount: 200000 }], "standard");
    expect(effortBand).toBe("High");
  });
});
