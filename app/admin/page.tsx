"use client";

import { useEffect, useState } from "react";

type Challenge = { id: string; task: string; active: boolean; qr?: string; url?: string };

export default function Admin() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [task, setTask] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/challenges", { headers: { "x-admin-password": password } });
    if (!r.ok) return setError("Wrong admin password.");
    setChallenges(await r.json());
    setUnlocked(true);
    setError("");
  }

  async function add() {
    if (!task.trim()) return;
    const r = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ task }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error || "Could not create challenge.");
    setChallenges((c) => [...c, data]);
    setTask("");
  }

  async function toggle(c: Challenge) {
    await fetch("/api/challenges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    setChallenges((cs) => cs.map((x) => x.id === c.id ? { ...x, active: !x.active } : x));
  }

  useEffect(() => {
    // Nothing sensitive is loaded until the password is entered.
  }, []);

  if (!unlocked) {
    return (
      <main className="center-page">
        <div className="card">
          <div className="eyebrow">WEDDING ADMIN</div>
          <h1>Set up your challenges</h1>
          <p className="muted">Enter the admin password from your environment settings.</p>
          <input className="text-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="button primary full" onClick={load}>Unlock</button>
          {error && <div className="error">{error}</div>}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <div className="eyebrow">WEDDING ADMIN</div>
          <h1>Photo challenges</h1>
        </div>
        <a className="button secondary" href="/slideshow" target="_blank">Open slideshow ↗</a>
      </div>

      <div className="create-row">
        <input
          className="text-input"
          placeholder="e.g. Take a photo with someone you just met"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="button primary" onClick={add}>Add challenge</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="challenge-grid">
        {challenges.map((c) => (
          <article className="admin-card" key={c.id}>
            <div className="qr-placeholder" id={`qr-${c.id}`}>
              {c.qr ? <img src={c.qr} alt={`QR code for ${c.task}`} /> : <div className="qr-letter">QR</div>}
            </div>
            <div className="admin-card-body">
              <div className="status">{c.active ? "ACTIVE" : "PAUSED"}</div>
              <h2>{c.task}</h2>
              <p className="url">{c.url || `${window.location.origin}/challenge/${c.id}`}</p>
              <div className="button-row">
                <button className="button secondary small" onClick={() => toggle(c)}>{c.active ? "Pause" : "Activate"}</button>
                <button className="button secondary small" onClick={() => {
                  const img = document.querySelector(`#qr-${c.id} img`) as HTMLImageElement | null;
                  if (!img) return;
                  const a = document.createElement("a");
                  a.href = img.src;
                  a.download = `challenge-${c.id}.png`;
                  a.click();
                }}>Download QR</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!challenges.length && <div className="empty-admin">Create your first challenge above.</div>}
    </main>
  );
}