import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminProvider } from "@/context/AdminContext";
import Providers from "@/components/Providers";
import SpotlightGlow from "@/components/ui/SpotlightGlow";
import { GlowingOrbs } from "@/components/ui/NeonElements";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Nexus Founders — Elite Entrepreneur Community",
  description: "Nexus Founders 16th Edition – Building Business Legacies with Founders. A vibrant ecosystem where innovators and visionary leaders thrive.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexus",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SpotlightGlow />
        <GlowingOrbs />
        <Providers session={session}>
          <AdminProvider>
            {children}
          </AdminProvider>
        </Providers>
      </body>
    </html>
  );
}