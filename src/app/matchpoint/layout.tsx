import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SFF Match-Point — Where Needs Meet Opportunities | Nexus Founders",
  description:
    "Interactive business matchmaking at SFF. Tell us what you do, tell us what you need, and let Match-Point connect you directly to the right business opportunities.",
  keywords: [
    "SFF Match-Point",
    "business matchmaking",
    "SFF networking",
    "Nexus Founders",
    "F2 Fintech",
    "Singapore FinTech Festival",
    "startup networking",
  ],
  openGraph: {
    title: "SFF Match-Point — Where Needs Meet Opportunities",
    description:
      "Interactive business matchmaking at SFF venue. Connect with clients, investors, HR agencies, and tech partners.",
  },
};

export default function MatchPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
