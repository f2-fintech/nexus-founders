export interface BingoChallenge {
  id: number;
  statement: string;
  iconName: string;
  isBonus?: boolean;
  hint?: string;
}

export const BINGO_CHALLENGES: BingoChallenge[] = [
  {
    id: 1,
    statement: "Travelled from another country for SFF.",
    iconName: "Plane",
    hint: "Ask which country they arrived from!",
  },
  {
    id: 2,
    statement: "Attended Singapore FinTech Festival before.",
    iconName: "Calendar",
    hint: "Ask which past edition they visited.",
  },
  {
    id: 3,
    statement: "Looking for new business opportunities.",
    iconName: "Handshake",
    hint: "Explore synergy with their vertical.",
  },
  {
    id: 4,
    statement: "Seeking investment for their business.",
    iconName: "TrendingUp",
    hint: "Learn about their current funding round.",
  },
  {
    id: 5,
    statement: "Invested in an early-stage startup.",
    iconName: "Coins",
    hint: "Ask what domains they back.",
  },
  {
    id: 6,
    statement: "Works at a loan aggregation company.",
    iconName: "Layers",
    hint: "Discuss lending tech and APIs.",
  },
  {
    id: 7,
    statement: "Experience across banking, NBFCs and fintech.",
    iconName: "Landmark",
    hint: "Connect on institutional expertise.",
  },
  {
    id: 8,
    statement: "Worked with clients in 3+ countries.",
    iconName: "Globe",
    hint: "Ask about their international footprint.",
  },
  {
    id: 9,
    statement: "Looking for a strategic business partner.",
    iconName: "Users",
    hint: "See if your offerings align.",
  },
  {
    id: 10,
    statement: "Helped a business secure funding.",
    iconName: "CircleDollarSign",
    hint: "Ask how they supported the deal.",
  },
  {
    id: 11,
    statement: "Launched a fintech product.",
    iconName: "Rocket",
    hint: "Check out their live app or solution.",
  },
  {
    id: 12,
    statement: "Exploring international business expansion.",
    iconName: "Compass",
    hint: "Ask which markets they are targeting.",
  },
  {
    id: 13,
    statement: "Experience in digital lending.",
    iconName: "Smartphone",
    hint: "Exchange notes on underwriting & credit.",
  },
  {
    id: 14,
    statement: "Worked with a financial regulator.",
    iconName: "ShieldCheck",
    hint: "Discuss compliance, MAS, or RBI guidelines.",
  },
  {
    id: 15,
    statement: "Looking to connect with banks or NBFCs.",
    iconName: "Building2",
    hint: "Introduce mutual banking partners.",
  },
  {
    id: 16,
    statement: "Facilitated an international investment deal.",
    iconName: "Briefcase",
    hint: "Discuss cross-border syndicate structures.",
  },
  {
    id: 17,
    statement: "Currently offering investment to startups.",
    iconName: "Sprout",
    hint: "Learn about their cheque sizes & ticket thesis.",
  },
  {
    id: 18,
    statement: "Looking for a technology partner.",
    iconName: "Code2",
    hint: "Share dev capabilities or tech stacks.",
  },
  {
    id: 19,
    statement: "Worked in cross-border payments.",
    iconName: "CreditCard",
    hint: "Discuss rails, forex, and payment gateways.",
  },
  {
    id: 20,
    statement: "Built a partnership through a networking event.",
    iconName: "Share2",
    isBonus: true,
    hint: "Bonus: Celebrate networking success stories!",
  },
];
