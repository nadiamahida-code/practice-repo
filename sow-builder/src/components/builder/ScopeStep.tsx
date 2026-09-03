import { MODULE_REGISTRY } from "@/lib/calculators/registry";
import { MODULE_FORM_CONFIGS } from "@/lib/calculators/moduleForms";
import type { LineItem } from "@/lib/calculators/types";
import { computeLineItemTotals } from "@/lib/calculators/aggregate";
import { ModuleInputForm } from "./ModuleInputForm";

interface ScopeStepProps {
  lineItems: LineItem[];
  onToggleModule: (moduleId: string, enabled: boolean) => void;
  onUpdateInputs: (moduleId: string, inputs: Record<string, unknown>) => void;
  onContinue: () => void;
}

export function ScopeStep({ lineItems, onToggleModule, onUpdateInputs, onContinue }: ScopeStepProps) {
  const selectedCount = lineItems.length;

  return (
    <section className="view active">
      <div className="card">
        <div className="eyebrow">Scope</div>
        <h2>What&apos;s in this project?</h2>
        <p className="lede">
          Turn on every module in scope and fill in its numbers. Everything here is scoped and priced from the current rate card — there&apos;s
          no flat package underneath it.
        </p>

        <div style={{ marginTop: 18 }}>
          {MODULE_REGISTRY.map((mod) => {
            const config = MODULE_FORM_CONFIGS[mod.id];
            const lineItem = lineItems.find((li) => li.moduleId === mod.id);
            const isOn = Boolean(lineItem);
            const isPlaceholder = mod.status === "placeholder";

            let hoursPreview: string | null = null;
            if (isOn && lineItem && config) {
              try {
                hoursPreview = `~${computeLineItemTotals(lineItem).finalHours.toFixed(1)}h`;
              } catch {
                hoursPreview = null;
              }
            }

            return (
              <div key={mod.id} className={`module-item ${isPlaceholder ? "disabled" : ""}`}>
                <div className="module-row">
                  <div className="module-main">
                    <div className="title">
                      {mod.label}
                      {isPlaceholder && <span className="tag placeholder">Not yet configured</span>}
                    </div>
                    <div className="description">{isPlaceholder ? mod.placeholderNote : config?.description}</div>
                  </div>
                  <div className="module-side">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isOn}
                        disabled={isPlaceholder}
                        onChange={(e) => onToggleModule(mod.id, e.target.checked)}
                      />
                      <span className="track">
                        <span className="knob" />
                      </span>
                    </label>
                    {hoursPreview && <div className="module-hours">{hoursPreview}</div>}
                  </div>
                </div>

                {isOn && lineItem && config && (
                  <ModuleInputForm config={config} value={lineItem.inputs as Record<string, unknown>} onChange={(next) => onUpdateInputs(mod.id, next)} />
                )}
              </div>
            );
          })}
        </div>

        <div className="scope-footer">
          <span className="count">{selectedCount} module{selectedCount === 1 ? "" : "s"} selected</span>
          <button className="btn btn-primary" disabled={selectedCount === 0} onClick={onContinue}>
            Calculate estimate
          </button>
        </div>
      </div>
    </section>
  );
}
