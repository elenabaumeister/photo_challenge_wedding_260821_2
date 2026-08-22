import { supabase } from "../../../lib/supabase";
import UploadForm from "./upload-form";

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!challenge) {
    return (
      <main className="center-page">
        <div className="card">
          <div className="eyebrow">WHOOPS</div>
          <h1>Challenge not found</h1>
          <p>This QR code is no longer active.</p>
        </div>
      </main>
    );
  }

  const { data: submittedPhoto } = await supabase
    .from("photos")
    .select("id")
    .eq("challenge_id", id)
    .maybeSingle();

  return <UploadForm challenge={challenge} alreadySubmitted={Boolean(submittedPhoto)} />;
}