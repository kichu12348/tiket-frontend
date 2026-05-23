export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const API_ENDPOINTS = {
  BACKEND: {
    AUTH: {
      PASSWORD: `${API_URL}/api/auth/password`,
      OTP_SEND: `${API_URL}/api/auth/otp/send`,
      OTP_VERIFY: `${API_URL}/api/auth/otp/verify`,
    },
  },
  FRONTEND: {
    AUTH: {
      PASSWORD: "/api/auth/password",
      OTP_SEND: "/api/auth/otp/send",
      OTP_VERIFY: "/api/auth/otp/verify",
      LOGOUT: "/api/auth/logout",
    },
  },
};
