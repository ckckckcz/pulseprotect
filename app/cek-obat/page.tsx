import Image from "next/image"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
export default function cekObat() {
    return (
        <>
            <Navbar />
            <section className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 mt-20">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Content */}
                    <div className="text-center mb-16 lg:mb-24">
                        {/* Main Headline with Embedded Image */}
                        <div className="space-y-4 mb-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight">
                                <span className="block">Obat yang tepat.</span>
                                <div className="flex items-center justify-center gap-4 my-6">
                                    <span>Hidup yang</span>
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden shadow-lg">
                                        <Image
                                            src="/placeholder.svg?height=96&width=96"
                                            alt="Medicine and wellness"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span>sehat.</span>
                                </div>
                            </h1>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {/* Image 1 - Medicine bottles */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <Image
                                src="/placeholder.svg?height=300&width=300"
                                alt="Medicine bottles and healthcare products"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Image 2 - Person sleeping peacefully */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <Image
                                src="/placeholder.svg?height=300&width=300"
                                alt="Person sleeping peacefully"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Image 3 - Natural remedies */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <Image
                                src="/placeholder.svg?height=300&width=300"
                                alt="Natural remedies and herbs"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Image 4 - Healthy lifestyle */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <Image
                                src="/placeholder.svg?height=300&width=300"
                                alt="Healthy lifestyle and wellness"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Image 5 - Medical consultation */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-2 sm:col-span-1">
                            <Image
                                src="/placeholder.svg?height=300&width=300"
                                alt="Medical consultation and care"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-16 lg:mt-24">
                        <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                            Mulai Konsultasi
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}
