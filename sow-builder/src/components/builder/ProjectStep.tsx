export interface ProjectInfo {
  name: string;
  client: string;
  owner: string;
}

interface ProjectStepProps {
  project: ProjectInfo;
  onChange: (next: ProjectInfo) => void;
  onContinue: () => void;
}

export function ProjectStep({ project, onChange, onContinue }: ProjectStepProps) {
  return (
    <section className="view active">
      <div className="card">
        <div className="eyebrow">Project</div>
        <h1>New Statement of Work</h1>
        <p className="lede">Enter the basics, then add the modules in scope for this engagement.</p>

        <div className="field-row">
          <label>Project name</label>
          <input
            className="input"
            type="text"
            value={project.name}
            onChange={(e) => onChange({ ...project, name: e.target.value })}
            placeholder="e.g. Acme Corp — WFM Rollout"
          />
        </div>
        <div className="field-row">
          <label>Client</label>
          <input className="input" type="text" value={project.client} onChange={(e) => onChange({ ...project, client: e.target.value })} />
        </div>
        <div className="field-row">
          <label>Owner</label>
          <input className="input" type="text" value={project.owner} onChange={(e) => onChange({ ...project, owner: e.target.value })} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" disabled={!project.name.trim()} onClick={onContinue}>
            Continue to scope
          </button>
        </div>
      </div>
    </section>
  );
}
