import React from 'react';
import { Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>Security & Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-400">
          Last Updated: November 2, 2026 &bull; Strict Zero-Surveillance Architecture
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/20 space-y-6 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            1. Foundational Commitment: Zero Covert Surveillance
          </h2>
          <p>
            SHAKTISHIELD AI does NOT monitor, record, or transmit your device location in the background without explicit real-time action. Geolocation permissions are requested exclusively when you trigger the Emergency SOS button or initiate a Live Location Sharing session.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Identity:</strong> Legal name, email address, optional contact number, and blood group.</li>
            <li><strong>Cryptographic Credentials:</strong> Argon2id-hashed passwords. We never store, transmit, or log plain-text passwords.</li>
            <li><strong>Emergency Contacts:</strong> Names, relationships, and telephone numbers of your designated safety circle.</li>
            <li><strong>Distress Telemetry:</strong> Latitude, longitude, horizontal accuracy, and timestamps logged during an intentional SOS event.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            3. Cryptographic Hashing and Non-Repudiation
          </h2>
          <p>
            To provide verifiable evidence in formal dispute or investigation, incident data (time, location, user identity) is stamped with a SHA-256 cryptographic digest upon creation. Any post-facto modification in the database creates an immediate hash mismatch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            4. Third-Party Disclosures & Demo Mode Notice
          </h2>
          <p>
            In current demonstration and hackathon mode, external telecom SMS and police alerts are simulated. In production, coordinates are only dispatched to external telecom providers (e.g. Twilio) if explicitly configured by the system administrator.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            5. User Rights & Account Deletion
          </h2>
          <p>
            Under the Digital Personal Data Protection Act (DPDPA), users retain the complete right to request data export, modify profile details, or request permanent deletion of their account records.
          </p>
        </section>
      </div>
    </div>
  );
};
