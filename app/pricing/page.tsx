import Pricing from "@/components/widget/hero/pricing"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
export default function PricingPage() {
    return (
        <div className="bg-white">
            <Navbar />
            <div className="bg-white min-h-screen mb-10">
                <Pricing />
            </div>
            <Footer />
        </div>
    )
}