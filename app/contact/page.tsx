"use client"

import { MapPin, Mail, Phone, Github, Instagram, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"

export default function ContactSection() {
    return (
        <>
            <Navbar />
            <section className="min-h-screen bg-white text-black p-8 flex items-center justify-center">
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                                {"Let's discuss"}
                                <br />
                                {"on something "}
                                <span className="text-teal-600 italic">cool</span>
                                <br />
                                {"together"}
                            </h1>
                        </div>

                        <div className="space-y-6">
                            {/* Email */}
                            <div className="flex items-center gap-4">
                                <Mail className="text-teal-600 w-5 h-5" />
                                <span className="text-lg">mechaminds.team@gmail.com</span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-4">
                                <Phone className="text-teal-600 w-5 h-5" />
                                <span className="text-lg">+62 851-1745-7570</span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-4">
                                <MapPin className="text-teal-600 w-5 h-5" />
                                <span className="text-lg">Jl. Soekarno Hatta No.9, Jatimulyo, Kec. Lowokwaru, Kota Malang, Jawa Timur 65141</span>
                            </div>
                        </div>

                        {/* Social Media Icons */}
                        <div className="flex gap-4 pt-8">
                            <Link href={"https://github.com/MechaMinds"} target="_blank">
                                <div className="w-12 h-12 border border-gray-200 bg-gray-50 hover:border-0 hover:bg-teal-600 hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                                    <Github className="w-6 h-6" />
                                </div>
                            </Link>
                            <Link href={"https://www.linkedin.com/company/mechamindss"} target="_blank">
                            <div className="w-12 h-12 border border-gray-200 bg-gray-50 hover:border-0 hover:bg-teal-600 hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                                    <Linkedin className="w-6 h-6" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Image */}
                    <div className="flex items-center justify-center">
                        <img
                            src="/placeholder.svg?height=600&width=600"
                            alt="Contact illustration"
                            className="w-full max-w-md h-auto rounded-2xl object-cover"
                        />
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}
