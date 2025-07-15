"use client"

import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import Navbar from "@/components/widget/navbar"
import Footer from "@/components/widget/footer"
import { MapPin, Stethoscope } from "lucide-react"
import { useEffect } from "react"

export default function CekObat() {
    const doctors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            position: "Dokter Spesialis Jantung",
            hospital: "RS Jantung Harapan Kita",
            location: "Jakarta Barat",
            image: "https://media.istockphoto.com/id/1373258655/photo/happy-nurse-at-hospital.jpg?s=612x612&w=0&k=20&c=mt8_LDMnWZHxAVm64SjmqBqbsTnrmDI3DlCq-jv3afA=",
            height: 400,
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            position: "Dokter Spesialis Anak",
            hospital: "RS Anak Bunda",
            location: "Jakarta Selatan",
            image: "https://img.freepik.com/premium-photo/portrait-middle-aged-female-doctor_255667-25025.jpg",
            height: 500,
        },
        {
            id: 3,
            name: "Dr. Amanda Wilson",
            position: "Dokter Spesialis Mata",
            hospital: "RS Mata Cicendo",
            location: "Bandung",
            image: "https://media.istockphoto.com/id/1434687410/photo/portrait-of-happy-and-successful-african-american-doctor-man-working-inside-office-clinic.jpg?s=612x612&w=0&k=20&c=kKvUmzkotN3FrWTGgS3ar2mm4SLwlV3cbiNC-Bp12YI=",
            height: 350,
        },
        {
            id: 4,
            name: "Dr. Robert Kim",
            position: "Dokter Spesialis Bedah",
            hospital: "RS Premier Jatinegara",
            location: "Jakarta Timur",
            image: "https://media.istockphoto.com/id/1425798958/photo/photo-of-confident-female-doctor-in-hospital-looking-at-camera-with-smile.jpg?s=612x612&w=0&k=20&c=i91idG544pXuYkw5ju6iIzm1m-lEqQaygeOOrjG5GEk=",
            height: 450,
        },
        {
            id: 5,
            name: "Dr. Lisa Martinez",
            position: "Dokter Spesialis Kulit",
            hospital: "RS Kulit Klinik Utama",
            location: "Surabaya",
            image: "https://media.istockphoto.com/id/1346124900/photo/confident-successful-mature-doctor-at-hospital.jpg?s=612x612&w=0&k=20&c=S93n5iTDVG3_kJ9euNNUKVl9pgXTOdVQcI_oDGG-QlE=",
            height: 300,
        },
    ]

    // Duplikasi data untuk transisi mulus
    const infiniteDoctors = [...doctors, ...doctors, ...doctors, ...doctors, ...doctors, ...doctors]

    const controls = useAnimation()

    useEffect(() => {
        const totalWidth = infiniteDoctors.length * 400 // Total width (400px per image)
        const duration = infiniteDoctors.length * 2 // 2 seconds per image for smoother transition

        const animate = async () => {
            await controls.start({
                x: -totalWidth / 2, // Move to the middle of duplicated set
                transition: {
                    x: {
                        duration: duration,
                        ease: "linear",
                        repeat: Infinity, // Continuous loop
                    },
                },
            })
        }

        animate()

        return () => controls.stop()
    }, [controls, infiniteDoctors.length])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    }

    return (
        <>
            <Navbar />
            <section className="min-h-screen bg-white lg:mt-24 mt-16 overflow-hidden">
                <motion.div
                    className="max-w-6xl mx-auto pt-12 px-4 sm:px-6 lg:px-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="text-center mb-16 lg:mb-24">
                        <motion.div className="space-y-4 mb-8">
                            <motion.h1
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight"
                            >
                                <motion.span
                                    className="lg:block hidden"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    Obat yang <span className="text-teal-600 italic">tepat</span>
                                </motion.span>
                                <motion.span
                                    className="lg:hidden block text-start"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    Obat yang <span className="text-teal-600 italic">tepat</span> Hidup yang <span className="text-teal-600 italic">sehat</span>
                                </motion.span>
                                <motion.p
                                    className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed lg:text-center text-start lg:hidden block"
                                >
                                    Temukan dokter terpercaya dan dapatkan konsultasi medis terbaik untuk kesehatan Anda dan keluarga
                                </motion.p>
                                <motion.div
                                    className="flex lg:items-center lg:justify-center text-start lg:gap-4 lg:my-6 mt-4 "
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    <span className="lg:block hidden">Hidup yang</span>
                                    <motion.div
                                        className="relative w-16 h-16 sm:w-20 sm:h-20 lg:block hidden lg:w-52 lg:h-20 rounded-full overflow-hidden shadow-xl ring-4 ring-white"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Image
                                            src="https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2021/11/11041740/Selain-Tunda-Kehamilan-Ini-X-Manfaat-Pil-KB-bagi-Kesehatan.jpg.webp"
                                            alt="Medicine and wellness"
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                    <span className="lg:block hidden text-teal-600 italic">sehat.</span>
                                    <motion.div
                                        className="relative w-full h-16 sm:w-20 sm:h-20 lg:hidden block lg:w-52 lg:h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-white"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Image
                                            src="https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2021/11/11041740/Selain-Tunda-Kehamilan-Ini-X-Manfaat-Pil-KB-bagi-Kesehatan.jpg.webp"
                                            alt="Medicine and wellness"
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                </motion.div>
                            </motion.h1>
                        </motion.div>

                        <motion.p
                            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed lg:text-center text-start lg:block hidden"
                        >
                            Temukan dokter terpercaya dan dapatkan konsultasi medis terbaik untuk kesehatan Anda dan keluarga
                        </motion.p>
                    </div>
                </motion.div>

                <motion.div
                    className="relative w-full overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <motion.div
                        className="flex gap-2"
                        animate={controls}
                        style={{ width: `${infiniteDoctors.length * 400}px` }}
                    >
                        {infiniteDoctors.map((doctor, index) => (
                            <motion.div
                                key={`doctor-${index}`}
                                className="relative overflow-hidden group flex-shrink-0"
                                style={{ width: 400, height: doctor.height }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Image
                                    src={doctor.image || "/placeholder.svg"}
                                    alt={doctor.name}
                                    width={400}
                                    height={doctor.height}
                                    className="object-cover w-full h-full transition-transform duration-500"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 p-6 text-white"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="space-y-2">
                                        <motion.h3
                                            className="text-xl font-bold"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                        >
                                            {doctor.name}
                                        </motion.h3>
                                        <motion.div
                                            className="flex items-center gap-2 text-blue-200"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        >
                                            <Stethoscope className="w-4 h-4" />
                                            <span className="text-sm font-medium">{doctor.position}</span>
                                        </motion.div>
                                        <motion.div
                                            className="space-y-1"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                        >
                                            <p className="text-sm font-medium text-green-200">{doctor.hospital}</p>
                                            <div className="flex items-center gap-1 text-gray-300">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-xs">{doctor.location}</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>
            <Footer />
        </>
    )
}