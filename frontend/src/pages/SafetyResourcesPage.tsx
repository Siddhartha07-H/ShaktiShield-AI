import React, { useState } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Scale, 
  ExternalLink, 
  BookOpen, 
  HelpCircle, 
  Car, 
  Eye, 
  Globe, 
  Home,
  CheckCircle2
} from 'lucide-react';

export const SafetyResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'helplines' | 'legal' | 'blueprints'>('helplines');

  const nationalHelplines = [
    {
      title: "National Emergency Response Support System (ERSS)",
      number: "112",
      badge: "POLICE / FIRE / AMBULANCE",
      badgeColor: "bg-red-600 text-white",
      description: "India's unified emergency number for police, medical, and fire rescue.",
      tollFree: true
    },
    {
      title: "Women Helpline (All India)",
      number: "1091",
      badge: "24/7 TOLL-FREE",
      badgeColor: "bg-purple-600 text-white",
      description: "Dedicated helpline for women facing harassment, violence, or stalking.",
      tollFree: true
    },
    {
      title: "Women in Distress Helpline",
      number: "181",
      badge: "DOMESTIC VIOLENCE & ABUSE",
      badgeColor: "bg-indigo-600 text-white",
      description: "Assistance, safe shelter coordination, and legal counseling for domestic distress.",
      tollFree: true
    },
    {
      title: "National Cyber Crime Reporting Portal",
      number: "1930",
      badge: "CYBER HARASSMENT & FRAUD",
      badgeColor: "bg-cyan-600 text-white",
      description: "Immediate reporting for online stalking, non-consensual image sharing, and cyber extortion.",
      tollFree: true
    },
    {
      title: "Childline Emergency Support",
      number: "1098",
      badge: "CHILD SAFETY",
      badgeColor: "bg-amber-600 text-white",
      description: "Nationwide 24-hour service for children in need of care and protection.",
      tollFree: true
    }
  ];

  const stateHelplines = [
    { state: "Delhi", contact: "1091 / 011-23317004", agency: "Delhi Police Special Women Cell" },
    { state: "Maharashtra (Mumbai)", contact: "103 / 022-22633333", agency: "Mumbai Police Women Helpline" },
    { state: "Karnataka (Bengaluru)", contact: "1091 / 080-22943225", agency: "Vanitha Sahayavani (Parihar)" },
    { state: "Tamil Nadu (Chennai)", contact: "1091 / 044-23452365", agency: "Chennai Police Women Helpline" },
    { state: "Uttar Pradesh", contact: "1090 (Women Power Line)", agency: "UP Police 1090 WPL" },
    { state: "West Bengal (Kolkata)", contact: "1091 / 033-22143000", agency: "Kolkata Police Women Help Desk" },
    { state: "Telangana (Hyderabad)", contact: "100 / 040-27852333", agency: "SHE Teams Cyberabad & Hyderabad" },
    { state: "Kerala", contact: "1091 / 0471-2338100", agency: "Mitra 181 Women Helpline" }
  ];

  const legalRights = [
    {
      title: "Right to Zero FIR",
      description:
        "A woman can file an FIR at ANY police station in India regardless of jurisdiction where the incident occurred. The police station is legally required to register it and transfer it to the relevant jurisdictional station."
    },
    {
      title: "Right Against Arrest After Sunset and Before Sunrise",
      description:
        "Under Section 46(4) of the Code of Criminal Procedure (and Bharatiya Nagarik Suraksha Sanhita), a woman cannot be arrested after sunset and before sunrise except in extraordinary circumstances with prior judicial magistrate permission."
    },
    {
      title: "Right to Privacy During Statement Recording",
      description:
        "Statements of a woman who has been subjected to sexual offenses must be recorded by a woman police officer or in the presence of a woman constable, at the residence of the victim or a place of her convenience."
    },
    {
      title: "Right to Free Legal Aid",
      description:
        "Under the Legal Services Authorities Act, women in India are entitled to free legal aid, legal representation, and legal advice irrespective of their financial capacity."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-semibold">
          <PhoneCall className="w-3.5 h-3.5 text-red-400" />
          <span>India Emergency Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Emergency Resources & Legal Rights
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Direct telephone helplines, state women safety cells, and essential constitutional and statutory legal rights for women in India.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="glass-panel p-1.5 rounded-2xl border border-purple-500/30 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('helplines')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'helplines' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            National & State Helplines
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'legal' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Essential Legal Rights
          </button>
          <button
            onClick={() => setActiveTab('blueprints')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'blueprints' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Blueprints
          </button>
        </div>
      </div>

      {/* Tab 1: Helplines */}
      {activeTab === 'helplines' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* National Helplines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nationalHelplines.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-purple-500/20 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
              >
                <div className="space-y-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-white pt-1">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-purple-500/10">
                  <a
                    href={`tel:${item.number}`}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Dial {item.number} Now</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* State Wise Directory Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>State & Metropolis Women Safety Cells</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">State / Union Territory</th>
                    <th className="py-3 px-4">Agency / Initiative</th>
                    <th className="py-3 px-4">Direct Contact</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {stateHelplines.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{row.state}</td>
                      <td className="py-3 px-4 text-slate-300">{row.agency}</td>
                      <td className="py-3 px-4 font-mono text-purple-300">{row.contact}</td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`tel:${row.contact.split('/')[0].trim()}`}
                          className="px-3 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" /> Dial
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Legal Rights */}
      {activeTab === 'legal' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalRights.map((right, rIdx) => (
              <div
                key={rIdx}
                className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-2 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-2 text-purple-400">
                  <Scale className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">{right.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{right.description}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            <strong>Legal Information Note:</strong> The information provided above is for educational and civic awareness purposes under Indian statutes (Bharatiya Nagarik Suraksha Sanhita, Bharatiya Nyaya Sanhita, and Protection of Women from Domestic Violence Act). For formal proceedings, always seek licensed legal counsel.
          </div>
        </div>
      )}

      {/* Tab 3: Safety Blueprints */}
      {activeTab === 'blueprints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Car className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Transit & Cab Commute Protocol</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
              <li>Match vehicle license plate, driver face, and child-lock settings before boarding.</li>
              <li>Always sit in the rear seat directly behind the driver.</li>
              <li>Activate ShaktiShield Live Location tracking link and message your primary guardian.</li>
              <li>Keep phone charged above 20% and avoid using both earbuds during rides.</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <Eye className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Stalking & Pursuit Protocol</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
              <li>Never head directly to your residential address if you suspect someone is following you.</li>
              <li>Divert into a 24/7 store, petrol pump, metro station, or hospital casualty entrance.</li>
              <li>Dial 112 on speakerphone immediately and trigger ShaktiShield SOS.</li>
              <li>Document physical descriptions, vehicle models, and dates in your safety notes.</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Globe className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Cyber Harassment & Doxxing Defense</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
              <li>Take clear timestamped screenshots of offensive messages, URLs, and caller profiles before blocking.</li>
              <li>Call 1930 immediately or file a report at cybercrime.gov.in (National Cyber Crime Portal).</li>
              <li>Enable hardware-backed or app-based Two-Factor Authentication on all email and social handles.</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2 text-pink-400">
              <Home className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Domestic Crisis Preparedness</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
              <li>Keep an emergency bag with essential medication, cash, and identification ready with a trusted friend.</li>
              <li>Establish a code word with your primary guardian that signals immediate police assistance.</li>
              <li>Contact the Women in Distress helpline 181 for emergency protection officer coordination.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
