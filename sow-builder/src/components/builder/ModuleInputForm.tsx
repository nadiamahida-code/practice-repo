import type { ModuleFormConfig } from "@/lib/calculators/moduleForms";

interface ModuleInputFormProps {
  config: ModuleFormConfig;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

export function ModuleInputForm({ config, value, onChange }: ModuleInputFormProps) {
  function setField(key: string, fieldValue: unknown) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="module-form">
      <div className="form-field span-2">
        <div className="field-row">
          <label>{config.nameLabel}</label>
          <input
            className="input"
            type="text"
            value={String(value[config.nameField] ?? "")}
            onChange={(e) => setField(config.nameField, e.target.value)}
          />
        </div>
      </div>

      {config.fields.map((field) => (
        <div className="form-field" key={field.key}>
          <div className="field-row">
            <label>{field.label}</label>
            {field.kind === "number" && (
              <input
                className="input input-num"
                type="number"
                min={field.min}
                step={field.step ?? 1}
                value={Number(value[field.key] ?? 0)}
                onChange={(e) => setField(field.key, e.target.value === "" ? 0 : Number(e.target.value))}
              />
            )}
            {field.kind === "select" && (
              <select className="select" value={String(value[field.key] ?? "")} onChange={(e) => setField(field.key, e.target.value)}>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {field.kind === "boolean" && (
              <label className="switch" style={{ marginTop: 4 }}>
                <input type="checkbox" checked={Boolean(value[field.key])} onChange={(e) => setField(field.key, e.target.checked)} />
                <span className="track">
                  <span className="knob" />
                </span>
              </label>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
