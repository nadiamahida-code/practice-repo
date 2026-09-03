"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClients, createClient } from "@/lib/clients";
import { useProjects } from "@/lib/projects";

export default function ClientsPage() {
  const router = useRouter();
  const clients = useClients();
  const projects = useProjects();
  const [newClientName, setNewClientName] = useState("");

  function handleAddClient() {
    if (!newClientName.trim()) return;
    const id = createClient(newClientName.trim());
    setNewClientName("");
    router.push(`/clients/${id}`);
  }

  return (
    <main>
      <div className="card">
        <div className="eyebrow">Clients</div>
        <h1>All clients</h1>
        <p className="lede">Click into a client to see their projects.</p>

        <div style={{ marginTop: 8 }}>
          {clients.length === 0 && <p className="lede">Loading…</p>}
          {clients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);
            const activeCount = clientProjects.filter((p) => p.phase !== "Complete").length;
            return (
              <div key={client.id} className="project-list-item" onClick={() => router.push(`/clients/${client.id}`)}>
                <div>
                  <div className="pname">{client.name}</div>
                  <div className="pclient">
                    {clientProjects.length} project{clientProjects.length === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="pright">
                  <span className="sow-status">{activeCount} active</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="add-member-row">
          <input className="input" type="text" placeholder="New client name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
          <button className="btn btn-primary" disabled={!newClientName.trim()} onClick={handleAddClient}>
            Add client
          </button>
        </div>
      </div>
    </main>
  );
}
