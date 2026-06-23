"use client";
import { TOKEN_KEY } from "@/constants/config";
import { removeTokenServer } from "@/actions/removeToken";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export async function removeToken() {
  try {
    await removeTokenServer();
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
    throw new Error("Failed to remove token");
  }
}

export function useToken() {
  const router = useRouter();
  async function logout() {
    try {
      await removeToken();
      router.push("/signin");
    } catch (error) {
      console.error("Error removing token:", error);
      toast.error("Error removing token");
    }
  }

  return { logout };
}
