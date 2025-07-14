import CreativitySection from "@/components/widget/about/creativity-section"
import StrategyDesignSection from "@/components/widget/about/strategy-design-section"
import IdeaToImpactSection from "@/components/widget/about/idea-to-impact-section"
import ExperienceSection from "@/components/widget/about/experience-section"
import TeamSection from "@/components/widget/about/team-section"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"

export default function Home() {
  return (
    <>
        <Navbar/>
        <div className="min-h-screen mt-24">
            <CreativitySection />
            <StrategyDesignSection />
            <IdeaToImpactSection />
            <ExperienceSection />
            <TeamSection />
        </div>
        <Footer />
    </>
  )
}
