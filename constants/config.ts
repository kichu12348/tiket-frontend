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

export interface ImageSrcOptions {
  width?: number;
  height?: number;
  ext?: "jpeg" | "webp";
  filter?: "tri" | "lanc" | "gauss" | "nearest";
}

export const getImageUrl = (filename: string, options?: ImageSrcOptions) => {
  if (options?.width || options?.height || options?.ext || options?.filter) {
    const params: string[] = [];
    if (options?.width) params.push(`w=${options.width}`);
    if (options?.height) params.push(`h=${options.height}`);
    if (options?.ext) params.push(`ext=${options.ext}`);
    if (options?.filter) params.push(`filter=${options.filter}`);
    return `${CDN_URL}/image/${filename}?${params.join("&")}`;
  }
  return `${CDN_URL}/image/${filename}`;
};
