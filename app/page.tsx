import Link from "next/link";

export default function Home() {
  return (
    <main className="center-page">
      <div className="card hero">
        <div className="eyebrow">WEDDING PHOTO CHALLENGE</div>
        <h1>Capture the moments.</h1>
        <p>Scan one of the challenge QR codes around the wedding and complete the task.</p>
        <div className="button-row">
          <Link className="button primary" href="/slideshow">Open slideshow</Link>
          <Link className="button secondary" href="/admin">Admin</Link>
        </div>
      </div>
    </main>
  );
}