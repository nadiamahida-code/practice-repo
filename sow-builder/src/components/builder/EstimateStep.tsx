import { MODULE_LABELS } from "@/lib/calculators/registry";
import type { SowState } from "@/lib/calculators/types";
import { TIMELINE_LABELS, type TimelineOption } from "@/lib/calculators/globalAssumptions";
import { computeLineItemBreakdown, computeLineItemTotals, computeModuleEffortBands } from "@/lib/calculators/aggregate";

interface EstimateStepProps {
  sow: SowState;
  timeline: TimelineOption;
  onChangeTimeline: (timeline: TimelineOption) => void;
  onBackToScope: () => void;
  onConfirm: () => void;
  confirmed: boolean;
}

export function EstimateStep({ sow, timeline, onChangeTimeline, onBackToScope, onConfirm, confirmed }: EstimateStepProps) {
  const lineTotals = sow.lineItems.map((item) => ({ item, totals: computeLineItemTotals(item) }));
  const totalHours = lineTotals.reduce((sum, r) => sum + r.totals.finalHours, 0);
  const totalCost = lineTotals.reduce((sum, r) => sum + r.totals.finalCost, 0);
  const effortBands = computeModuleEffortBands(sow);

  return (
    <section className="view active">
      <div className="card">
        <div className="eyebrow">Estimate</div>
        <div className="estimate-hero">
          <div className="num">{totalHours.toFixed(1)}</div>
          <div className="unit">
            hours, across {sow.lineItems.length} module{sow.lineItems.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="estimate-cost">
          Estimated cost: <b>${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b>
        </div>

        <div className="field-row" style={{ maxWidth: 260, marginTop: 18 }}>
          <label>Delivery timeline</label>
          <select className="select" value={timeline} onChange={(e) => onChangeTimeline(e.target.value as TimelineOption)}>
            {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          {lineTotals.map(({ item, totals }) => {
            const breakdown = computeLineItemBreakdown(item);
            return (
              <div className="module-card" key={item.id}>
                <div className="module-card-head">
                  <div className="name">
                    {MODULE_LABELS[item.moduleId]} — {item.name}
                  </div>
                  <div className="hours">
                    {totals.finalHours.toFixed(1)}h · ${totals.finalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                {breakdown.map((row) => (
                  <div className="breakdown-row" key={row.label}>
                    <span>{row.label}</span>
                    <b>{row.hours.toFixed(1)}h</b>
                  </div>
                ))}
                {totals.pmHours > 0 && (
                  <div className="breakdown-row">
                    <span>PM (35%)</span>
                    <b>{totals.pmHours.toFixed(1)}h</b>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {effortBands.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {effortBands.map((b) => (
              <span className="tag band" key={b.moduleId}>
                {MODULE_LABELS[b.moduleId]}: {b.effortBand}
              </span>
            ))}
          </div>
        )}

        <div className="btn-row">
          <button className="btn" onClick={onBackToScope}>
            ← Edit scope
          </button>
        </div>

        <div className="confirm-box">
          <p>Does {totalHours.toFixed(1)} hours look right for this project?</p>
          <button className="btn btn-primary" onClick={onConfirm}>
            Yes, looks right
          </button>
        </div>
        {confirmed && <div className="confirmed-note">✓ Estimate confirmed. Ready to generate the project plan.</div>}
      </div>
    </section>
  );
}
