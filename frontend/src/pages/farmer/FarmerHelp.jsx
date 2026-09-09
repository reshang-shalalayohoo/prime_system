import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import {
  HelpCircle,
  CheckCircle2,
  Sprout,
  Droplets,
  Activity,
  FileText,
  Lightbulb,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  FlaskConical
} from 'lucide-react'

export default function FarmerHelp() {
  const [activeFaq, setActiveFaq] = useState(null)

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Verify Your Account',
      badge: 'Account Setup',
      icon: ShieldCheck,
      color: 'bg-emerald-500',
      description: 'Create your farmer account with your full name, email, and password. Once logged in, your personal Farmer Dashboard is created in the PRIME database.',
      farmerAction: 'Keep your login credentials secure. Log in regularly from your phone or browser to check your rice crop status.'
    },
    {
      number: '02',
      title: 'Field & Sensor Device Assignment',
      badge: 'Hardware Linking',
      icon: Cpu,
      color: 'bg-blue-500',
      description: 'Your local agricultural administrator assigns your specific rice paddy field (variety: Palay, area in hectares, and current growth stage: Seedling, Vegetative, Reproductive, or Ripening) and registers the physical ESP32 sensor node installed in your paddy.',
      farmerAction: 'If you do not see sensor readings on your dashboard yet, inform your agricultural technician to ensure your field and ESP32 device node are linked to your account.'
    },
    {
      number: '03',
      title: 'Read Your Live Crop Dashboard',
      badge: 'Daily Monitoring',
      icon: Activity,
      color: 'bg-indigo-500',
      description: 'Your Dashboard displays real-time soil and water conditions transmitted automatically from the ESP32 sensor node:',
      gauges: [
        { label: 'Nitrogen (N)', desc: 'Promotes rapid growth, leaf greenness, and tillering capacity.' },
        { label: 'Phosphorus (P)', desc: 'Encourages root elongation and early grain formation.' },
        { label: 'Potassium (K)', desc: 'Enhances stem strength, pest resistance, and drought tolerance.' },
        { label: 'Soil Moisture (%)', desc: 'Indicates moisture retention in root zone (40%–80% optimal).' },
        { label: 'Water Level (%)', desc: 'Monitors standing water height in the rice field.' },
      ],
      farmerAction: 'Check the color status: 🟢 Green means normal/sufficient. 🟡 Yellow means moderate attention needed. 🔴 Red indicates deficiency or stress.'
    },
    {
      number: '04',
      title: 'Check Smart Fertilizer Recommendations',
      badge: 'Site-Specific Nutrient Management',
      icon: Lightbulb,
      color: 'bg-amber-500',
      description: 'PRIME compares your real-time NPK readings with research-backed SSNM (Site-Specific Nutrient Management) reference tables tailored to your crop growth stage.',
      farmerAction: 'Navigate to "Recommendations" to see exact recommended fertilizer types (e.g. Urea, Complete 14-14-14, Muriate of Potash 0-0-60) and calculated application rates (kg/ha).'
    },
    {
      number: '05',
      title: 'Log Fertilizer Application',
      badge: 'Farm Record Keeping',
      icon: FlaskConical,
      color: 'bg-purple-500',
      description: 'Whenever you apply fertilizer to your field, record it under "Fertilizer Log". Keeping an accurate log helps prevent over-fertilization, saves input costs, and tracks total investment.',
      farmerAction: 'Click "Log Fertilizer" after every application. Enter the fertilizer type, quantity (bags/kg), and application date.'
    },
    {
      number: '06',
      title: 'Respond Promptly to Alerts',
      badge: 'Actionable Warnings',
      icon: Droplets,
      color: 'bg-rose-500',
      description: 'The system triggers automated alerts whenever critical conditions arise—such as severe Nitrogen deficiency, soil drying, or high standing water levels.',
      farmerAction: 'Check the "Alerts" bell tab regularly and take the recommended corrective action (e.g., irrigate, drain field, or apply topdress).'
    }
  ]

  const faqs = [
    {
      q: 'How often does the sensor node update my readings?',
      a: 'The ESP32 sensor node periodically collects NPK, soil moisture, and water-level readings and transmits them to the PRIME backend. The data updates on your dashboard in real time through Socket.io without requiring a manual page refresh.'
    },
    {
      q: 'What do the color indicators (Green, Yellow, Red) mean?',
      a: '🟢 Green (Sufficient): Your crop nutrients and moisture levels are within optimal range for its current growth stage.\n🟡 Yellow (Moderate): Levels are approaching critical threshold; prepare for planned application or water management.\n🔴 Red (Critical): Urgent deficiency or excessive level requiring immediate corrective action.'
    },
    {
      q: 'How does PRIME calculate the fertilizer recommendation?',
      a: 'PRIME utilizes the SSNM (Site-Specific Nutrient Management) and NOPT guidelines developed by PhilRice and IRRI. It compares the measured Nitrogen, Phosphorus, and Potassium in your soil against the minimum and maximum sufficient values for your specific rice growth stage (Seedling, Vegetative, Reproductive, Ripening).'
    },
    {
      q: 'What should I do if my water level indicator shows Red?',
      a: 'A Red water level indicator means standing water is either too low (<15% - potential drought stress) or excessively high (>85% - risk of drowning seedlings or fertilizer runoff). Check your field dikes and adjust irrigation gates accordingly.'
    },
    {
      q: 'Can another farmer see my field or sensor data?',
      a: 'No. The system isolates data by user account. You can only view your own registered fields, devices, sensor readings, and recommendations. Only authorized system administrators have a regional overview of all sensors.'
    },
    {
      q: 'What if my sensor node is showing "Offline"?',
      a: 'An offline status indicates the ESP32 node has not communicated recently (e.g. low battery, solar panel obstruction, or network connectivity issue). Notify your local PRIME agricultural technician to inspect the field node.'
    }
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-prime-700 via-prime-600 to-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
            <Sprout size={14} />
            Farmer User Guide & System Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome to PRIME Farm Assistant
          </h1>
          <p className="text-sm md:text-base text-white/90 mt-2 leading-relaxed">
            Palay Resource & Irrigation Monitoring Ecosystem (PRIME) is your real-time smart agriculture assistant. 
            Monitor soil nutrients (NPK), water levels, and receive scientific fertilizer recommendations tailored to your rice paddy.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/farmer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-prime-700 hover:bg-prime-50 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Go to My Dashboard
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/farmer/recommendations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-all"
            >
              <Lightbulb size={14} />
              View Recommendations
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-800">1. Real-Time Sensing</h3>
            <p className="text-xs text-gray-500 mt-1">
              Field ESP32 node continuously reads NPK nutrients, soil moisture, and water height.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-800">2. Science-Based SSNM</h3>
            <p className="text-xs text-gray-500 mt-1">
              Calculates exact fertilizer formula (Urea, Complete, Potash) for your crop stage.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Droplets size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-800">3. Irrigation Guidance</h3>
            <p className="text-xs text-gray-500 mt-1">
              Warns you against water stress or flooding to maximize palay yield and quality.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide Section */}
      <Card title="What Should the Farmer Do First? (Step-by-Step Guide)">
        <p className="text-xs text-gray-500 mb-6">
          Follow these sequential steps to set up your field monitoring and achieve optimal rice yields with PRIME:
        </p>

        <div className="space-y-6 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Numbered Avatar */}
                <div className={`w-10 h-10 rounded-xl ${step.color} text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 z-10`}>
                  {step.number}
                </div>

                {/* Content Box */}
                <div className="flex-1 bg-gray-50/80 border border-gray-200 rounded-xl p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                      {step.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Optional sensor gauge breakdown */}
                  {step.gauges && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.gauges.map((g, gi) => (
                        <div key={gi} className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                          <span className="font-semibold text-gray-800 block">{g.label}</span>
                          <span className="text-gray-500 text-[11px]">{g.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Farmer Action Tip */}
                  <div className="mt-3 p-3 bg-prime-50/80 border border-prime-200 rounded-lg flex items-start gap-2 text-xs text-prime-800">
                    <CheckCircle2 size={16} className="text-prime-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">What you should do:</strong> {step.farmerAction}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Understanding Severity Indicators */}
      <Card title="Understanding the Color Status Indicators">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-green-200 bg-green-50/70">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3.5 h-3.5 rounded-full bg-green-500 inline-block shadow-sm" />
              <h4 className="font-bold text-sm text-green-900">🟢 Green (Sufficient / Normal)</h4>
            </div>
            <p className="text-xs text-green-800 leading-relaxed">
              Your soil nutrients and moisture are in the target sufficient range for the current growth stage. 
              <strong> Action:</strong> Continue standard maintenance. No additional fertilizer required today.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block shadow-sm" />
              <h4 className="font-bold text-sm text-amber-900">🟡 Yellow (Moderate / Needs Attention)</h4>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Levels are nearing boundary thresholds (either borderline low or slightly high). 
              <strong> Action:</strong> Prepare required fertilizer supplies and monitor upcoming irrigation cycles.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-200 bg-red-50/70">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block shadow-sm animate-pulse" />
              <h4 className="font-bold text-sm text-red-900">🔴 Red (Critical / Bad)</h4>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              Nutrient deficiency or excess detected, or extreme water level (dry/flooded). 
              <strong> Action:</strong> Check the Recommendations tab immediately and apply the suggested fertilizer dose or adjust irrigation.
            </p>
          </div>
        </div>
      </Card>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <Card title="Frequently Asked Questions (FAQ)">
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                    <HelpCircle size={16} className="text-prime-600 flex-shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Need Technical Assistance Box */}
      <div className="p-5 bg-gradient-to-r from-prime-50 to-emerald-50 border border-prime-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-prime-600 text-white flex items-center justify-center flex-shrink-0">
            <PhoneCall size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-800">Need Field Assistance or Sensor Help?</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Contact your designated Municipal Agricultural Officer (MAO) or PRIME system administrator.
            </p>
          </div>
        </div>
        <Link
          to="/farmer"
          className="px-4 py-2 bg-prime-600 hover:bg-prime-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
