"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

function createFileId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function UploadForm({
  challenge,
  alreadySubmitted,
}: {
  challenge: { id: string; task: string };
  alreadySubmitted: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(alreadySubmitted);
  const [wasAlreadySubmitted, setWasAlreadySubmitted] = useState(alreadySubmitted);
  const [error, setError] = useState("");
  const submissionKey = `photo-challenge-submitted-${challenge.id}`;

  useEffect(() => {
    if (localStorage.getItem(submissionKey) === "true") {
      setDone(true);
    }
  }, [submissionKey]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) return setError("Please choose or take a photo.");
    if (!file.type.startsWith("image/")) return setError("Please upload an image.");
    if (file.size > 12 * 1024 * 1024) return setError("Please use an image smaller than 12 MB.");

    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `photos/${challenge.id}/${createFileId()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("wedding-photos").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("wedding-photos").getPublicUrl(path);
      const { error: dbError } = await supabase.from("photos").insert({
        challenge_id: challenge.id,
        image_url: data.publicUrl,
        guest_name: name.trim() || null,
      });
      if (dbError) {
        if (dbError.code === "23505") {
          setWasAlreadySubmitted(true);
          setDone(true);
          return;
        }
        throw dbError;
      }

      localStorage.setItem(submissionKey, "true");
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="center-page">
        <div className="card hero success">
          <div className="big-emoji">🎉</div>
          <div className="eyebrow">CHALLENGE COMPLETE</div>
          <h1>{wasAlreadySubmitted ? "A photo has already been submitted." : "Challenge complete!"}</h1>
          <p>{wasAlreadySubmitted ? "This challenge can only be completed once." : "Your photo is now part of the wedding slideshow."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="challenge-page">
      <section className="challenge-card">
        <div className="eyebrow">YOUR PHOTO CHALLENGE</div>
        <h1>{challenge.task}</h1>
        <p className="muted">Take a photo that completes the task, then send it to the couple.</p>
        <form onSubmit={submit}>
          <label className="file-button">
            📸 {file ? "Change photo" : "Take / choose photo"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && <div className="file-name">{file.name}</div>}
          <input
            className="text-input"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
          {error && <div className="error">{error}</div>}
          <button className="button primary full" disabled={busy}>
            {busy ? "Uploading…" : "Submit photo"}
          </button>
        </form>
      </section>
    </main>
  );
}