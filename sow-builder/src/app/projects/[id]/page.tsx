"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useProjects,
  addTeamMember,
  removeTeamMember,
  setMilestone,
  setDeliveryMilestoneHours,
  createProject,
  SALES_MILESTONES,
  DELIVERY_MILESTONES,
  type Project,
} from "@/lib/projects";
import { useClients } from "@/lib/clients";
import { MODULE_REGISTRY } from "@/lib/calculators/registry";
import { MODULE_FORM_CONFIGS } from "@/lib/calculators/moduleForms";

const PHASE_TAG_CLASS: Record<Project["phase"], string> = {
  Sales: "tag phase-sales",
  Delivery: "tag phase-delivery",
  Complete: "tag phase-complete",
};

type Tab = "summary" | "recommendations";

function Timeline({ project }: { project: Project }) {
  const isDelivery = project.phase === "Delivery";
  const milestones = project.phase === "Sales" ? SALES_MILESTONES : DELIVERY_MILESTONES;

  const totalUsed = project.deliveryMilestoneHours.reduce((a, b) => a + b, 0);
  const totalAllocated = project.sowTotalHours;
  const pct = totalAllocated && totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  return (
    <div>
      {isDelivery &&
        (totalAllocated != null ? (
          <div className="hours-summary">
            <div className="hours-summary-row">
              <span className="used">
                {totalUsed} of {totalAllocated} hours used
              </span>
              <span className="pct">{Math.round(pct)}%</span>
            </div>
            <div className="hours-bar-track">
              <div className={`hours-bar-fill ${pct > 100 ? "over" : ""}`} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        ) : (
          <p className="lede" style={{ marginTop: 0, marginBottom: 18 }}>
            No SOW hours on file yet.
          </p>
        ))}

      <div className="timeline">
        {milestones.map((label, i) => {
          const done = i <= project.milestoneIndex;
          const isLast = i === milestones.length - 1;
          return (
            <div className="timeline-row" key={label}>
              <div className="timeline-rail">
                <div className={`timeline-dot ${done ? "done" : ""}`} />
                {!isLast && <div className={`timeline-connector ${done ? "done" : ""}`} />}
              </div>
              <div className="timeline-content">
                <button className={`timeline-label ${done ? "done" : ""}`} onClick={() => setMilestone(project.id, i)}>
                  {label}
                </button>
                {isDelivery && (
                  <div className="milestone-hours-input">
                    <input
                      className="input input-num"
                      type="number"
                      min={0}
                      value={project.deliveryMilestoneHours[i] ?? 0}
                      onChange={(e) => setDeliveryMilestoneHours(project.id, i, Number(e.target.value) || 0)}
                    />
                    <span className="unit">hrs</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletedBox({ project, clientName }: { project: Project; clientName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("summary");
  const [newProjectName, setNewProjectName] = useState("");
  const readyModules = MODULE_REGISTRY.filter((m) => m.status === "ready");

  function handleCreateProject() {
    if (!newProjectName.trim()) return;
    const id = createProject({ name: newProjectName.trim(), clientId: project.clientId });
    router.push(`/projects/${id}`);
  }

  return (
    <div>
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
          <p className="lede" style={{ marginTop: 0 }}>
            This engagement with {clientName} is complete — a Statement of Work was delivered and every delivery milestone was reached.
          </p>
          <div className="add-member-row">
            <input
              className="input"
              type="text"
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <button className="btn btn-primary" disabled={!newProjectName.trim()} onClick={handleCreateProject}>
              Create project for {clientName}
            </button>
          </div>
        </div>
      )}

      {tab === "recommendations" && (
        <div>
          <p className="lede" style={{ marginTop: 0, marginBottom: 12 }}>
            Products worth proposing on the next engagement with {clientName}.
          </p>
          {readyModules.map((mod) => (
            <div className="rec-item" key={mod.id}>
              <div className="title">{mod.label}</div>
              <div className="description">{MODULE_FORM_CONFIGS[mod.id]?.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projects = useProjects();
  const clients = useClients();
  const project = projects.find((p) => p.id === params.id) ?? null;
  const client = project ? (clients.find((c) => c.id === project.clientId) ?? null) : null;
  const clientName = client?.name ?? "Unknown client";

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
    <main>
      <Link href={project ? `/clients/${project.clientId}` : "/clients"} className="back-link">
        ← {project ? clientName : "All clients"}
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
        <>
          <div className="project-detail-head" style={{ margin: "0 0 16px" }}>
            <div>
              <div className="eyebrow">Project</div>
              <h1>{project.name}</h1>
              <p className="lede">{clientName}</p>
            </div>
            <span className={PHASE_TAG_CLASS[project.phase]}>{project.phase}</span>
          </div>

          <div className="card">
            <div className="eyebrow">{project.phase === "Complete" ? "Project complete" : "Timeline"}</div>
            {project.phase === "Complete" ? <CompletedBox project={project} clientName={clientName} /> : <Timeline project={project} />}
          </div>

          <div className="card">
            <div className="tab-row" style={{ marginTop: 0 }}>
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
                  <span className="value">{clientName}</span>
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

          {project.phase !== "Complete" && (
            <div className="card">
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
          )}

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
        </>
      )}
    </main>
  );
}
