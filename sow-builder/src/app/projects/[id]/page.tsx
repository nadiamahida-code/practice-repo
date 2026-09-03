"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProjects, type Project } from "@/lib/projects";

const PHASE_TAG_CLASS: Record<Project["phase"], string> = {
  Sales: "tag phase-sales",
  Delivery: "tag phase-delivery",
  Complete: "tag phase-complete",
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projects = useProjects();
  const project = projects.find((p) => p.id === params.id) ?? null;

  return (
    <main>
      <Link href="/projects" className="back-link">
        ← All projects
      </Link>

      <div className="card">
        {projects.length === 0 && <p className="lede">Loading…</p>}
        {projects.length > 0 && !project && <p className="lede">Project not found.</p>}
        {project && (
          <>
            <div className="project-detail-head">
              <div>
                <div className="eyebrow">Project</div>
                <h1>{project.name}</h1>
                <p className="lede">{project.client}</p>
              </div>
              <span className={PHASE_TAG_CLASS[project.phase]}>{project.phase}</span>
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
              {project.phase !== "Sales" && !project.sowId && <p className="lede">No SOW on file.</p>}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
