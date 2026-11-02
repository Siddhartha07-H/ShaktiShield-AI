export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: 'user' | 'admin';
  blood_type?: string | null;
  emergency_notes?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TrustedContact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  relationship: string;
  email?: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOSIncident {
  id: number;
  incident_code: string;
  user_id: number;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  address?: string | null;
  description?: string | null;
  trigger_type: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  integrity_hash: string;
  blockchain_tx?: string | null;
  cancelled_reason?: string | null;
  created_at: string;
  updated_at: string;
  user_full_name?: string;
  user_phone?: string;
  user_emergency_notes?: string;
  notified_contacts_count?: number;
  verification_status?: string;
}

export interface LocationSession {
  id: number;
  session_code: string;
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  google_maps_url: string;
}

export interface RiskAssessmentRequest {
  location_type: string;
  time_of_day: string;
  crowd_density: string;
  lighting_level: string;
  user_feeling?: string;
  additional_notes?: string;
}

export interface RiskAssessmentResponse {
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  primary_hazards: string[];
  actionable_recommendations: string[];
  emergency_checklist: string[];
  timestamp: string;
  disclaimer: string;
}

export interface RecommendationResponse {
  category: string;
  guidelines: string[];
  preventative_steps: string[];
  helpline_contacts: Array<{
    service: string;
    number: string;
    toll_free: boolean;
  }>;
  disclaimer: string;
}

export interface IntegrityReport {
  incident_code: string;
  stored_hash: string;
  recomputed_hash: string;
  is_valid: boolean;
  status: string;
  audit_chain_valid: boolean;
  blockchain_anchor_id?: string | null;
  verification_details: string;
}

export interface AdminMetrics {
  total_users: number;
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  cancelled_incidents: number;
  total_contacts: number;
  total_audit_records: number;
}

export interface AuditRecord {
  id: number;
  user_id?: number | null;
  action: string;
  details: string;
  ip_address?: string | null;
  created_at: string;
}
