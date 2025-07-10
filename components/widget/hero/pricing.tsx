"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  const starterFeatures = [
    "1 Affiliate Network",
    "Up to 200 Affiliates/Advertisers",
    "Standard Dashboard & Analytics",
    "Email Notifications",
    "Basic Payment Management",
    "Default AFFsFlow Subdomain",
    "Email Support",
  ]

  const growthFeatures = [
    "Up to 3 Affiliate Networks",
    "Up to 1000 Affiliates/Advertisers",
    "Real-time Analytics",
    "Custom Domain",
    "Advanced Payment Settings",
    "Role-Based User Permissions",
    "Branded Email Alerts",
    "Chat + Priority Support",
  ]

  const customFeatures = [
    "Unlimited Networks & Users",
    "Full White-labeling",
    "Admin Panel Access",
    "API & Integration Support",
    "SLA & Dedicated Manager",
    "Custom Feature Requests",
    "Team Onboarding & Training",
  ]

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center lg:mb-16 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Flexible Plans <span className="text-teal-600">for Every</span>
            <br />
            <span className="text-gray-900">Stage of Growth</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Whether you're just starting or scaling your affiliate empire, choose the plan that fits your business best.
            Simple pricing, no hidden fees.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 lg:mb-12 mb-2">
            <span className={`text-sm font-medium ${!isYearly ? "text-teal-600" : "text-gray-500"}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? "bg-teal-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? "text-teal-600" : "text-gray-500"}`}>Yearly</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative">
            <div className="mb-2 bg-gray-100 px-4 py-2 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter Plan</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">${isYearly ? "24" : "29"}</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Per user, billed {isYearly ? "annually" : "monthly"}</p>
              <p className="text-sm text-gray-600 mt-4">
                For small teams or early-stage network owners getting started.
              </p>
            </div>

            <div className="mb-8 p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
              <p className="text-sm text-gray-600 mb-4">Includes:</p>
              <ul className="space-y-3">
                {starterFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-white rounded-xl text-gray-900 border border-gray-300 hover:bg-gray-50">
              Start Free Trial
            </Button>
          </div>

          {/* Growth Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative transform scale-105">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 hover:bg-teal-600 text-white px-4 py-1">
              Popular
            </Badge>

            <div className="mb-1 mt-4 bg-teal-600/15 px-4 py-2 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">${isYearly ? "82" : "99"}</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Per user, billed {isYearly ? "annually" : "monthly"}</p>
              <p className="text-sm text-gray-600 mt-4">For growing affiliate businesses ready to scale operations.</p>
            </div>

            <div className="mb-8 p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
              <p className="text-sm text-gray-600 mb-4">Includes everything in Basic, plus:</p>
              <ul className="space-y-3">
                {growthFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-teal-600 text-white hover:bg-teal-700 rounded-xl">Start Free Trial</Button>
          </div>

          {/* Custom Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 relative">
            <div className="mb-2 bg-gray-100 px-4 py-2 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Tailored pricing, billed as agreed</p>
              <p className="text-sm text-gray-600 mt-4">
                For large networks or enterprises with advanced needs.
              </p>
            </div>

            <div className="mb-8 p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
              <p className="text-sm text-gray-600 mb-4">Includes everything in Growth, plus:</p>
              <ul className="space-y-3">
                {customFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full rounded-xl bg-white text-gray-900 border border-gray-300 hover:bg-gray-50">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
