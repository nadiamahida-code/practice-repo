import { MODULE_LABELS } from "@/lib/calculators/registry";
import type { SowState } from "@/lib/calculators/types";
import { computeLineItemTotals } from "@/lib/calculators/aggregate";

interface PersonTotal {
  name: string;
  role: "Consultant" | "PM";
  hours: number;
}

interface PlanStepProps {
  sow: SowState;
  startDate: string;
  onChangeStartDate: (date: string) => void;
  pmName: string;
  onChangePmName: (name: string) => void;
  owners: Record<string, string>;
  onChangeOwner: (lineItemId: string, owner: string) => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PlanStep({ sow, startDate, onChangeStartDate, pmName, onChangePmName, owners, onChangeOwner }: PlanStepProps) {
  const cursor = new Date(startDate);
  const personTotals = new Map<string, PersonTotal>();

  function addToPerson(name: string, role: "Consultant" | "PM", hours: number) {
    const key = `${name}|${role}`;
    const existing = personTotals.get(key);
    if (existing) {
      existing.hours += hours;
    } else {
      personTotals.set(key, { name, role, hours });
    }
  }

  const rows = sow.lineItems.map((item) => {
    const totals = computeLineItemTotals(item);
    const pmHours = Math.round(totals.pmHours * 10) / 10;
    const consultantHours = Math.round((totals.finalHours - totals.pmHours) * 10) / 10;

    const days = Math.max(1, Math.ceil(totals.finalHours / 6));
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setDate(end.getDate() + days - 1);
    cursor.setDate(cursor.getDate() + days);

    const owner = owners[item.id] || "Unassigned";
    addToPerson(owner, "Consultant", consultantHours);
    if (pmHours > 0) addToPerson(pmName || "PM", "PM", pmHours);

    return { item, consultantHours, pmHours, start, end, owner };
  });

  const people = Array.from(personTotals.values()).sort((a, b) => {
    if (a.role === b.role) return b.hours - a.hours;
    return a.role === "PM" ? 1 : -1;
  });

  return (
    <section className="view active">
      <div className="card">
        <div className="eyebrow">Project plan</div>
        <h2>Generated from the confirmed estimate</h2>
        <p className="lede">Each row links back to a module&apos;s hours, split between the delivery consultant and PM oversight.</p>

        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          <div className="field-row" style={{ maxWidth: 180 }}>
            <label>Start date</label>
            <input className="input" type="date" value={startDate} onChange={(e) => onChangeStartDate(e.target.value)} />
          </div>
          <div className="field-row" style={{ maxWidth: 180 }}>
            <label>Project manager</label>
            <input className="input" type="text" value={pmName} onChange={(e) => onChangePmName(e.target.value)} />
          </div>
        </div>

        <div className="plan-row head" style={{ marginTop: 20 }}>
          <span></span>
          <span>Module</span>
          <span>Owner</span>
          <span>Consultant hrs</span>
          <span>PM hrs</span>
          <span>Dates</span>
        </div>
        {rows.map(({ item, consultantHours, pmHours, start, end, owner }) => (
          <div className="plan-row" key={item.id}>
            <div className="plan-dot" />
            <div>
              {MODULE_LABELS[item.moduleId]} — {item.name}
            </div>
            <input className="plan-owner-input" type="text" value={owner} onChange={(e) => onChangeOwner(item.id, e.target.value)} />
            <div className="plan-hours">{consultantHours}h</div>
            <div className="plan-hours">{pmHours}h</div>
            <div className="plan-dates">
              {formatDate(start)} – {formatDate(end)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="eyebrow">Hours by person</div>
        <p className="lede" style={{ marginTop: 0 }}>
          Consultant hours roll up per assigned owner. PM hours roll up to the project manager.
        </p>
        {people.map((person) => (
          <div className="person-row" key={`${person.name}|${person.role}`}>
            <div>
              <span className="person-name">{person.name}</span> <span className="tag band">{person.role}</span>
            </div>
            <div className="person-hours">{person.hours}h</div>
          </div>
        ))}
      </div>
    </section>
  );
}
