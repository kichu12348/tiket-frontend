export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL!;

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
  EVENTS: {
    ME: "/api/events/me",
    CREATE: "/api/events",
    GET_SIGNED_URL: "/api/events/upload/signed-url",
  },
};

export const getImageUrl = (filename: string) => `${CDN_URL}/image/${filename}`;
