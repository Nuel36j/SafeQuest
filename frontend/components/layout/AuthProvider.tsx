"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { ApiError, getMe } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// When a saved token exists, fetch the current user once so every page can read it
// from the store (username, role, trust score).
export default function AuthProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userError = useAuthStore((state) => state.userError);
  const setUser = useAuthStore((state) => state.setUser);
  const setUserError = useAuthStore((state) => state.setUserError);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token || user || userError) return;
    getMe()
      .then((me) => {
        // Ignore the answer if the user logged out (or switched account) while it was loading.
        if (useAuthStore.getState().token === token) setUser(me);
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout(); // expired token, or the account was disabled
        } else {
          setUserError(true); // server down or other error. The page offers a retry.
        }
      });
  }, [token, user, userError, setUser, setUserError, logout]);

  return <>{children}</>;
}