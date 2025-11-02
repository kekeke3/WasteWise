import * as API from '../services/api_service'; // or axios if used directly

export interface createGarbageReportPayload {
  user : string;
  latitude : string;
  longitude : string;
  garbage_type : string;
  notes?: string;
}


export const createGarbageReport = async (data : createGarbageReportPayload) => {
  try {
    const res = await API.createGarbageReport(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllGarbageReport = async (user_id : string) => {
  try {
    const res = await API.getAllGarbageReport(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



