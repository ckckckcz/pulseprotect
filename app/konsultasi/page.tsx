"use client";

import { useState } from "react";
import { DoctorSelection } from "@/components/widget/konsultasi/doctor-selection";
import { ScheduleConsultation } from "@/components/widget/konsultasi/schedule-consultation";
import { ChatRoom } from "@/components/widget/konsultasi/chat-room";
import { ConsultationReminder } from "@/components/widget/konsultasi/consultation-reminder";
import Navbar from "@/components/widget/navbar";
import Footer from "@/components/widget/footer";

export default function KonsultasiPage() {
  const [currentStep, setCurrentStep] = useState<"select-doctor" | "schedule" | "waiting" | "chat">("select-doctor");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [scheduledTime, setScheduledTime] = useState<any>(null);
  const [showReminder, setShowReminder] = useState(false);

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setCurrentStep("schedule");
  };

  const handleScheduleConfirm = (schedule: any) => {
    setScheduledTime(schedule);
    setCurrentStep("waiting");
    setTimeout(() => {
      setShowReminder(true);
    }, 2000);
  };

  const handleStartChat = () => {
    setCurrentStep("chat");
    setShowReminder(false);
  };

  const handleBackToSelection = () => {
    setCurrentStep("select-doctor");
    setSelectedDoctor(null);
    setScheduledTime(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "select-doctor":
        return <DoctorSelection onSelectDoctor={handleDoctorSelect} />;
      case "schedule":
        return <ScheduleConsultation doctor={selectedDoctor} onConfirm={handleScheduleConfirm} onBack={handleBackToSelection} />;
      case "waiting":
        return (
          <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-w-lg mx-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Konsultasi Terjadwal</h2>
              <p className="text-gray-600 mb-4">
                Konsultasi dengan {selectedDoctor?.name} telah dijadwalkan pada {scheduledTime?.date} pukul {scheduledTime?.time}
              </p>
              <p className="text-sm text-gray-500">Anda akan menerima notifikasi saat waktu konsultasi tiba</p>
            </div>
          </div>
        );
      case "chat":
        return <ChatRoom doctor={selectedDoctor} schedule={scheduledTime} onBack={handleBackToSelection} />;
      default:
        return <DoctorSelection onSelectDoctor={handleDoctorSelect} />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {renderCurrentStep()}

        {showReminder && <ConsultationReminder doctor={selectedDoctor} schedule={scheduledTime} onStartChat={handleStartChat} onDismiss={() => setShowReminder(false)} />}
      </div>
      <Footer />
    </>
  );
}
