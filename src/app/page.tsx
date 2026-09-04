import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import NoidaEcosystem from "@/components/home/NoidaEcosystem";
import {
  FosteringGrowth,
  MentorshipSection,
  KnowledgeSection,
  InvestmentSection,
  CommunitySection,
} from "@/components/home/SplitSections";
import SustainableEcosystem from "@/components/home/SustainableEcosystem";
import ValuePillars from "@/components/home/ValuePillars";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import CoordinationTeam from "@/components/home/CoordinationTeam";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ position: "relative", zIndex: 2, overflowX: "hidden", maxWidth: "100%", width: "100%" }}>
        <HeroSection />
        <NoidaEcosystem />
        <FosteringGrowth />
        <MentorshipSection />
        <KnowledgeSection />
        <InvestmentSection />
        <CommunitySection />
        <SustainableEcosystem />
        <ValuePillars />
        <UpcomingEvents />
        <CoordinationTeam />
      </main>
      <Footer />
    </>
  );
}