"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Signin.module.css";
import { UserRoundKey } from "lucide-react";
import { FaEye, FaGoogle } from "react-icons/fa";
import { IoEyeOff } from "react-icons/io5";
import { BeatLoader } from "react-spinners";

export default function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials. Try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordMode = mode === "password";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Tiket<span className={styles.dot}>.</span>
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.iconWrap}>
              <UserRoundKey size={20} />
            </div>

            <h1 className={styles.title}>Your tickets, your way.</h1>
            <p className={styles.subtitle}>
              Sign in to manage and discover events near you.
            </p>

            {error && <p className={styles.error}>*{error}</p>}

            {/* OTP form — always visible */}
            <form
              onSubmit={isPasswordMode ? handlePassword : handleOtp}
              className={styles.form}
            >
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                autoComplete="email"
              />

              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => {
                  setMode(isPasswordMode ? "otp" : "password");
                  setError("");
                }}
              >
                {isPasswordMode
                  ? "Use email OTP instead"
                  : "Sign in with Password"}
              </button>
              {/* Password expansion */}
              <div
                className={`${styles.passwordSection} ${isPasswordMode ? styles.passwordVisible : ""}`}
              >
                <div>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputWrap}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isPasswordMode}
                      className={styles.input}
                      autoComplete="current-password"
                      tabIndex={isPasswordMode ? 0 : -1}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={isPasswordMode ? 0 : -1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <IoEyeOff size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <BeatLoader size={8} color="var(--color-bg-base)" />
                ) : isPasswordMode ? (
                  "Sign in with Password"
                ) : (
                  "Continue with Email"
                )}
              </button>
            </form>
          </div>
          <div className={styles.divider} />

          <div className={styles.socialGroup}>
            <button type="button" className={styles.socialBtn}>
              <FaGoogle size={16} />
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
