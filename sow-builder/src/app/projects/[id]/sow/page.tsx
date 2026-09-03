"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProjects, updateProject, newSowId, setSowTotalHours } from "@/lib/projects";
import { useClients } from "@/lib/clients";
import { SowBuilder } from "@/components/builder/SowBuilder";

export default function ProjectSowPage() {
  const params = useParams<{ id: string }>();
  const projects = useProjects();
  const clients = useClients();
  const project = projects.find((p) => p.id === params.id) ?? null;
  const clientName = project ? (clients.find((c) => c.id === project.clientId)?.name ?? "") : "";

  // Starting an SOW marks the project as having one from this point on.
  useEffect(() => {
    if (project && !project.sowId) {
      updateProject(project.id, { sowId: newSowId() });
    }
  }, [project]);

  // Stable across re-renders (only depends on the route param) — setSowTotalHours
  // itself is a no-op when the value hasn't changed, so this can't loop.
  const handleTotalsChange = useCallback((totalHours: number) => setSowTotalHours(params.id, totalHours), [params.id]);

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
      initialProjectInfo={{ name: project.name, client: clientName, owner: "" }}
      onTotalsChange={handleTotalsChange}
      headerSlot={
        <Link href={`/projects/${project.id}`} className="back-link">
          ← {project.name}
        </Link>
      }
    />
  );
}
