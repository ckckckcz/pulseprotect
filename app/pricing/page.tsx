import Pricing from "@/components/widget/hero/pricing"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
export default function PricingPage() {
    return (
        <>
            <Navbar />
            <div className="bg-white min-h-screen">
                <Pricing />
            </div>
            <Footer />
        </>
    )
}