import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Zoom Clone - Secure Web Meetings",
  description: "Host and join seamless, secure, high-fidelity web meetings instantly.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} font-sans bg-[#161618] text-white antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
