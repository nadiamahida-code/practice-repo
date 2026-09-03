"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useClients } from "@/lib/clients";
import { useProjects, createProject, type Project } from "@/lib/projects";

const PHASE_TAG_CLASS: Record<Project["phase"], string> = {
  Sales: "tag phase-sales",
  Delivery: "tag phase-delivery",
  Complete: "tag phase-complete",
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clients = useClients();
  const projects = useProjects();
  const client = clients.find((c) => c.id === params.id) ?? null;
  const clientProjects = projects.filter((p) => p.clientId === params.id);

  const [newProjectName, setNewProjectName] = useState("");

  function handleAddProject() {
    if (!client || !newProjectName.trim()) return;
    const id = createProject({ name: newProjectName.trim(), clientId: client.id });
    router.push(`/projects/${id}`);
  }

  return (
    <main>
      <Link href="/clients" className="back-link">
        ← All clients
      </Link>

      {clients.length === 0 && (
        <div className="card">
          <p className="lede">Loading…</p>
        </div>
      )}
      {clients.length > 0 && !client && (
        <div className="card">
          <p className="lede">Client not found.</p>
        </div>
      )}

      {client && (
        <div className="card">
          <div className="eyebrow">Client</div>
          <h1>{client.name}</h1>
          <p className="lede">
            {clientProjects.length} project{clientProjects.length === 1 ? "" : "s"}
          </p>

          <div style={{ marginTop: 8 }}>
            {clientProjects.length === 0 && <p className="lede">No projects yet.</p>}
            {clientProjects.map((project) => (
              <div key={project.id} className="project-list-item" onClick={() => router.push(`/projects/${project.id}`)}>
                <div className="pname">{project.name}</div>
                <div className="pright">
                  <span className="sow-status">{project.phase === "Complete" ? "Inactive" : "Active"}</span>
                  {project.phase !== "Complete" && <span className={PHASE_TAG_CLASS[project.phase]}>{project.phase}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="add-member-row">
            <input
              className="input"
              type="text"
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <button className="btn btn-primary" disabled={!newProjectName.trim()} onClick={handleAddProject}>
              Add project
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
