"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProjects, addTeamMember, removeTeamMember, type Project } from "@/lib/projects";
import { MODULE_REGISTRY } from "@/lib/calculators/registry";
import { MODULE_FORM_CONFIGS } from "@/lib/calculators/moduleForms";

const PHASE_TAG_CLASS: Record<Project["phase"], string> = {
  Sales: "tag phase-sales",
  Delivery: "tag phase-delivery",
  Complete: "tag phase-complete",
};

type Tab = "summary" | "recommendations";

function nextStepsFor(project: Project): string[] {
  if (project.phase === "Sales" && !project.sowId) {
    return ["Create a Statement of Work to move this engagement forward."];
  }
  if (project.phase === "Sales" && project.sowId) {
    return ["Get the SOW signed to move this project into Delivery."];
  }
  if (project.phase === "Delivery") {
    return ["Complete the scoped delivery work to close out this project."];
  }
  return ["Project complete — no further action needed."];
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projects = useProjects();
  const project = projects.find((p) => p.id === params.id) ?? null;

  const [tab, setTab] = useState<Tab>("summary");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  function handleAddMember() {
    if (!project || !newMemberName.trim()) return;
    addTeamMember(project.id, { name: newMemberName.trim(), role: newMemberRole.trim() || "Team member" });
    setNewMemberName("");
    setNewMemberRole("");
  }

  const readyModules = MODULE_REGISTRY.filter((m) => m.status === "ready");

  return (
    <main className="main-wide">
      <Link href="/projects" className="back-link">
        ← All projects
      </Link>

      {projects.length === 0 && (
        <div className="card">
          <p className="lede">Loading…</p>
        </div>
      )}
      {projects.length > 0 && !project && (
        <div className="card">
          <p className="lede">Project not found.</p>
        </div>
      )}

      {project && (
        <div className="detail-layout">
          <div className="detail-main">
            <div className="card">
              <div className="project-detail-head">
                <div>
                  <div className="eyebrow">Project</div>
                  <h1>{project.name}</h1>
                  <p className="lede">{project.client}</p>
                </div>
                <span className={PHASE_TAG_CLASS[project.phase]}>{project.phase}</span>
              </div>

              <div className="tab-row">
                <button className={`tab-btn ${tab === "summary" ? "active" : ""}`} onClick={() => setTab("summary")}>
                  Summary
                </button>
                <button className={`tab-btn ${tab === "recommendations" ? "active" : ""}`} onClick={() => setTab("recommendations")}>
                  Recommendations
                </button>
              </div>

              {tab === "summary" && (
                <div>
                  <div className="summary-row">
                    <span className="label">Client</span>
                    <span className="value">{project.client}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Phase</span>
                    <span className="value">{project.phase}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">Statement of Work</span>
                    <span className="value">{project.sowId ? "On file" : "Not started"}</span>
                  </div>

                  <div className="btn-row">
                    {project.phase === "Sales" && !project.sowId && (
                      <button className="btn btn-primary" onClick={() => router.push(`/projects/${project.id}/sow`)}>
                        Create SOW
                      </button>
                    )}
                    {project.sowId && (
                      <button className="btn" onClick={() => router.push(`/projects/${project.id}/sow`)}>
                        Open SOW
                      </button>
                    )}
                  </div>
                </div>
              )}

              {tab === "recommendations" && (
                <div>
                  <p className="lede" style={{ marginTop: 0, marginBottom: 12 }}>
                    Zendesk products available to scope for this engagement, pulled from the current rate card.
                  </p>
                  {MODULE_REGISTRY.map((mod) => (
                    <div className="rec-item" key={mod.id}>
                      <div className="title">
                        {mod.label}
                        {mod.status === "placeholder" && <span className="tag placeholder">Not yet configured</span>}
                      </div>
                      <div className="description">
                        {mod.status === "placeholder" ? mod.placeholderNote : MODULE_FORM_CONFIGS[mod.id]?.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="eyebrow">Current team</div>
              {project.team.length === 0 && (
                <p className="lede" style={{ marginTop: 0 }}>
                  No one assigned yet.
                </p>
              )}
              {project.team.map((member) => (
                <div className="team-member-row" key={member.id}>
                  <div>
                    <span className="person-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                  <button className="remove-member" onClick={() => removeTeamMember(project.id, member.id)} title="Remove">
                    ×
                  </button>
                </div>
              ))}

              <div className="add-member-row">
                <input className="input" type="text" placeholder="Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                <input className="input" type="text" placeholder="Role" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} />
                <button className="btn" disabled={!newMemberName.trim()} onClick={handleAddMember}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="detail-side">
            <div className="side-box">
              <div className="eyebrow">Next steps</div>
              {nextStepsFor(project).map((step) => (
                <div className="next-step-item" key={step}>
                  {step}
                </div>
              ))}
            </div>

            <div className="side-box">
              <div className="eyebrow">Recommendations for future project</div>
              <p className="lede" style={{ marginTop: 0, marginBottom: 4 }}>
                Zendesk products worth proposing on this client&apos;s next engagement.
              </p>
              {readyModules.map((mod) => (
                <div className="future-rec-item" key={mod.id}>
                  {mod.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
