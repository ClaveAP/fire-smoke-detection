import { HeaderNav } from "@/components/common/HeaderNav";
import { Footer } from "@/components/common/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ArchitectureSection } from "@/components/home/ArchitectureSection";
import { BenchmarkSection } from "@/components/home/BenchmarkSection";
import { WorkflowSection } from "@/components/home/WorkflowSection";

export default function AegisFlameHomePage() {
  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans selection:bg-[#ff5722] selection:text-white">
      <HeaderNav />
      <main className="flex-grow">
        <HeroSection />
        <ArchitectureSection />
        <BenchmarkSection />
        <WorkflowSection />
      </main>
      <Footer />
    </div>
  );
}
