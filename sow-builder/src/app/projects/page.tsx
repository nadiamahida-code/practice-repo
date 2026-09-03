"use client";

import { useRouter } from "next/navigation";
import { useProjects, type Project } from "@/lib/projects";

const PHASE_TAG_CLASS: Record<Project["phase"], string> = {
  Sales: "tag phase-sales",
  Delivery: "tag phase-delivery",
  Complete: "tag phase-complete",
};

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useProjects();

  return (
    <main>
      <div className="card">
        <div className="eyebrow">Projects</div>
        <h1>All projects</h1>
        <p className="lede">Click into a project to see what phase it&apos;s in and manage its Statement of Work.</p>

        <div style={{ marginTop: 8 }}>
          {projects.length === 0 && <p className="lede">Loading…</p>}
          {projects.map((project) => (
            <div key={project.id} className="project-list-item" onClick={() => router.push(`/projects/${project.id}`)}>
              <div>
                <div className="pname">{project.name}</div>
                <div className="pclient">{project.client}</div>
              </div>
              <div className="pright">
                <span className="sow-status">{project.sowId ? "SOW on file" : "No SOW"}</span>
                <span className={PHASE_TAG_CLASS[project.phase]}>{project.phase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
