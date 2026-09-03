"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProjects, updateProject, newSowId } from "@/lib/projects";
import { SowBuilder } from "@/components/builder/SowBuilder";

export default function ProjectSowPage() {
  const params = useParams<{ id: string }>();
  const projects = useProjects();
  const project = projects.find((p) => p.id === params.id) ?? null;

  // Starting an SOW marks the project as having one from this point on.
  useEffect(() => {
    if (project && !project.sowId) {
      updateProject(project.id, { sowId: newSowId() });
    }
  }, [project]);

  if (projects.length === 0) {
    return (
      <main>
        <p className="lede">Loading…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main>
        <p className="lede">Project not found.</p>
      </main>
    );
  }

  return (
    <SowBuilder
      initialProjectInfo={{ name: project.name, client: project.client, owner: "" }}
      headerSlot={
        <Link href={`/projects/${project.id}`} className="back-link">
          ← {project.name}
        </Link>
      }
    />
  );
}
