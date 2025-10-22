export interface User {
  id: string;
  email: string;
  first_Name: string;
  last_Name: string;
  role: string;
  barangay: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
}

/* export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  barangay?: string;
  contact_number?: string;
  address?: string;
} */

export interface AuthState {
  user: User | null;
  token: string | null;
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
