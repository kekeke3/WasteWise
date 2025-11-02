import axios from "./axios_instance";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  email: string;
  role: string;
  barangay: string;
}

export interface VerifyPayload {
  verify: boolean;
}

export interface OTPPayload {
  otp_type: string;
  email: string;
  otp: string;
}
export interface CreateOTPPayload {
  otp_type: string;
  email: string;
}

export interface changePasswordRecoveryPayload {
  password: string;
  email: string;
}

export interface changeResidentGarbageSitePayload {
  garbage_site : string;
}

export interface createGarbageReportPayload {
  user : string;
  latitude : string;
  longitude : string;
  garbage_type : string;
  notes?: string;
}


export interface updateUserProfilePayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  email: string;
}


export const updateUserProfile = (id: string, data: updateUserProfilePayload) => axios.put(`/users/update_user_profile/${id}`, data);
export const getAllScheduleSpecifcBarangay = (id: string) => axios.get(`/schedules/get_all_schedule_specific_barangay/${id}`);
export const getAllGarbageReport = (id: string) => axios.get(`/garbage_reports/get_all_garbage_report_specific_user/${id}`);
export const getAllBarangay = () => axios.get(`/barangays/get_all_barangay`);
export const getAllGarbageSiteSpecificBarangay = (id: string | undefined) => axios.get(`/garbage_sites/get_all_garbage_site_specific_barangay/${id}`);
export const loginUser = (data: LoginPayload) => axios.post("/users/login_user", data);
export const changeUserResidentGarbageSite = (id: string, data: changeResidentGarbageSitePayload) => axios.put(`/users/update_user_resident_garbage_site/${id}`, data);
export const createUser = (data: RegisterPayload) => axios.post(`/users/add_user_resident`, data);
export const verifyUser = (id: string, data: VerifyPayload) => axios.put(`/users/update_user_verified/${id}`, data);
export const verifyOTP = (data: OTPPayload) => axios.post('/otp/verify_otp', data);
export const createOTP = (data: CreateOTPPayload) => axios.post('/otp/add_otp', data);
export const changePasswordRecovery = (data: changePasswordRecoveryPayload) => axios.put('/users/update_user_password_recovery', data);
export const createGarbageReport = (data: createGarbageReportPayload) => axios.post('/garbage_reports/add_garbage_report', data);

