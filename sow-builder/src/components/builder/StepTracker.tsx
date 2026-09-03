const STEPS = [
  { n: 1, label: "Project" },
  { n: 2, label: "Configure scope" },
  { n: 3, label: "Estimate" },
  { n: 4, label: "Plan" },
] as const;

interface StepTrackerProps {
  currentStep: number;
  unlockedSteps: Set<number>;
  onSelect: (step: number) => void;
}

export function StepTracker({ currentStep, unlockedSteps, onSelect }: StepTrackerProps) {
  return (
    <nav className="steps">
      {STEPS.map((step) => {
        const unlocked = unlockedSteps.has(step.n);
        const active = step.n === currentStep;
        return (
          <button
            key={step.n}
            className={`step ${active ? "active" : ""} ${unlocked ? "unlocked" : ""}`}
            onClick={() => unlocked && onSelect(step.n)}
          >
            <span className="num">{step.n}</span> {step.label}
          </button>
        );
      })}
    </nav>
  );
}
