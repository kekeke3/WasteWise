import api from './api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    barangay: string;
    phoneNumber?: string;
    address?: string;
  };
}



interface SignupData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  email: string;
  barangay: string;
  role: string;

}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  async signup(userData: SignupData): Promise<LoginResponse> {
    const response = await api.post("/users/add_user_resident", userData);
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
};
