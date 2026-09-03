"use client";

import { useEffect, useState, type ReactNode } from "react";
import { StepTracker } from "./StepTracker";
import { ProjectStep, type ProjectInfo } from "./ProjectStep";
import { ScopeStep } from "./ScopeStep";
import { EstimateStep } from "./EstimateStep";
import { PlanStep } from "./PlanStep";
import { MODULE_FORM_CONFIGS } from "@/lib/calculators/moduleForms";
import type { LineItem, ModuleId, SowState } from "@/lib/calculators/types";
import type { TimelineOption } from "@/lib/calculators/globalAssumptions";
import { computeSowTotals } from "@/lib/calculators/aggregate";

function newLineItemId(): string {
  return `li-${Math.random().toString(36).slice(2, 10)}`;
}

interface SowBuilderProps {
  initialProjectInfo?: ProjectInfo;
  headerSlot?: ReactNode;
  /** Called with the current estimate's total hours whenever the scope changes. */
  onTotalsChange?: (totalHours: number) => void;
}

export function SowBuilder({ initialProjectInfo, headerSlot, onTotalsChange }: SowBuilderProps) {
  const [step, setStep] = useState(1);
  const [unlockedSteps, setUnlockedSteps] = useState<Set<number>>(new Set([1]));

  const [project, setProject] = useState<ProjectInfo>(initialProjectInfo ?? { name: "", client: "", owner: "" });
  const [sow, setSow] = useState<SowState>({ lineItems: [] });
  const [timeline, setTimeline] = useState<TimelineOption>("standard");
  const [confirmed, setConfirmed] = useState(false);

  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pmName, setPmName] = useState("PM");
  const [owners, setOwners] = useState<Record<string, string>>({});

  useEffect(() => {
    onTotalsChange?.(computeSowTotals(sow).totalHours);
  }, [sow, onTotalsChange]);

  function unlock(n: number) {
    setUnlockedSteps((prev) => new Set(prev).add(n));
  }

  function goToStep(n: number) {
    if (unlockedSteps.has(n)) setStep(n);
  }

  function handleToggleModule(moduleId: string, enabled: boolean) {
    const id = moduleId as ModuleId;
    if (enabled) {
      const config = MODULE_FORM_CONFIGS[id];
      if (!config) return;
      const defaultName = `${config.nameLabel === "Scope name" ? "Scope" : config.nameLabel}`;
      const newItem: LineItem = {
        id: newLineItemId(),
        moduleId: id,
        name: defaultName,
        timeline,
        inputs: config.defaultInputs(defaultName),
      };
      setSow((prev) => ({ lineItems: [...prev.lineItems, newItem] }));
    } else {
      setSow((prev) => ({ lineItems: prev.lineItems.filter((li) => li.moduleId !== id) }));
    }
  }

  function handleUpdateInputs(moduleId: string, inputs: Record<string, unknown>) {
    const config = MODULE_FORM_CONFIGS[moduleId as ModuleId];
    const name = config ? String(inputs[config.nameField] ?? "") : "";
    setSow((prev) => ({
      lineItems: prev.lineItems.map((li) => (li.moduleId === moduleId ? { ...li, inputs, name: name || li.name } : li)),
    }));
  }

  function handleChangeTimeline(next: TimelineOption) {
    setTimeline(next);
    setSow((prev) => ({ lineItems: prev.lineItems.map((li) => ({ ...li, timeline: next })) }));
  }

  return (
    <>
      <StepTracker currentStep={step} unlockedSteps={unlockedSteps} onSelect={goToStep} />

      <main>
        {headerSlot}
        {step === 1 && (
          <ProjectStep
            project={project}
            onChange={setProject}
            onContinue={() => {
              unlock(2);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <ScopeStep
            lineItems={sow.lineItems}
            onToggleModule={handleToggleModule}
            onUpdateInputs={handleUpdateInputs}
            onContinue={() => {
              unlock(3);
              setConfirmed(false);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <EstimateStep
            sow={sow}
            timeline={timeline}
            onChangeTimeline={handleChangeTimeline}
            onBackToScope={() => setStep(2)}
            confirmed={confirmed}
            onConfirm={() => {
              setConfirmed(true);
              unlock(4);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <PlanStep
            sow={sow}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            pmName={pmName}
            onChangePmName={setPmName}
            owners={owners}
            onChangeOwner={(id, owner) => setOwners((prev) => ({ ...prev, [id]: owner }))}
          />
        )}
      </main>
    </>
  );
}
