import "./globals.css";

export const metadata = {
  title: "Wedding Photo Challenge",
  description: "A wedding guest photo challenge",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}