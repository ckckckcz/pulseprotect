import CreativitySection from "@/components/widget/about/creativity-section"
import StrategyDesignSection from "@/components/widget/about/strategy-design-section"
import IdeaToImpactSection from "@/components/widget/about/idea-to-impact-section"
import Mechaminds from "@/components/widget/mechaminds"
// import ExperienceSection from "@/components/widgetabout/experience-section"
import TeamSection from "@/components/widget/about/team-section"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"

export default function About() {
  return (
    <>
        <Navbar/>
        <div className="min-h-screen mt-28 overflow-x-hidden bg-white">
            <CreativitySection />
            <Mechaminds />
            <StrategyDesignSection />
            <IdeaToImpactSection />
            {/* <ExperienceSection /> */}
            <TeamSection />
            <Mechaminds />
        </div>
        <Footer />
    </>
  )
}
