export interface User {
  _id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: "male" | "female";
  contact_number: string;
  email: string;
  role:
    | "admin"
    | "resident"
    | "enro_staff_monitoring"
    | "enro_staff_head"
    | "enro_staff_scheduler"
    | "enro_staff_eswm_section_head"
    | "barangay_official"
    | "garbage_collector";
  route?: string;
  role_action?: string;
  is_disabled: boolean;
  is_verified: boolean;
  verified_at?: string | null;
  disabled_at?: string | null;
  created_at?: string | null;
}

export interface AuthState {
  user: any;
  token?: string | null; // optional
  isAuthenticated: boolean;
  loading: boolean;
}

export interface Report {
  id: string;
  type: "uncollected" | "missed_area" | "overflowing" | "other";
  description: string;
  location: string;
  barangay: string;
  status: "pending" | "in-progress" | "resolved";
  submittedBy: string;
  createdAt: string;
  urgency: "low" | "medium" | "high";
  response?: string;
}

export interface Barangay {
  _id: string;
  barangay_name: string;
  created_at?: string;
}

export interface CollectionSchedule {
  id: string;
  barangay: string;
  scheduleDate: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  type: "regular" | "special";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "system" | "alert" | "update";
}

export interface PendingAction {
  id: string;
  type: "SUBMIT_REPORT" | "UPDATE_PROFILE";
  data: any;
  timestamp: string;
  status: "pending" | "syncing" | "failed";
}
