import api from "@/lib/api";
import { API_ENDPOINTS, CDN_URL } from "@/constants/config";
import { CreateEventPayload } from "../types/event";

export const getSignedUrl = async (filename: string, contentType: string) => {
  const response = await api.post(API_ENDPOINTS.EVENTS.GET_SIGNED_URL, {
    filename,
    contentType,
  });
  return response.data as { url: string; max_size: number };
};

export const uploadToCDN = async (signedUrlPath: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  // We use standard fetch here because the CDN might be on a different origin
  // and we might not want to send our auth tokens to it via the axios interceptor
  const response = await fetch(`${CDN_URL}${signedUrlPath}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to CDN");
  }

  const data = await response.json();
  return data as { filename: string };
};

export const createEvent = async (payload: CreateEventPayload) => {
  const response = await api.post(API_ENDPOINTS.EVENTS.CREATE, payload);
  return response;
};
