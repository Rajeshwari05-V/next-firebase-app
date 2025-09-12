import "./globals.css";

export const metadata = {
  title: "Hackathon Project",
  description: "Next.js + Firebase setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
