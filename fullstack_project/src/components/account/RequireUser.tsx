import type { ReactNode } from "react";
import {  useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/**
 * Wrap account routes with this guard:
 * <Route path="/account" element={<RequireUser><AccountHub/></RequireUser>} />
 */
export default function RequireUser({ children }: { children: ReactNode }) {
  const { user } = useAuth() as ReturnType<typeof useAuth>;
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Redirect to AuthPage and preserve return destination
      const to = `/auth?redirect=${encodeURIComponent(loc.pathname + loc.search)}`;
      navigate(to, { replace: true });
    }
  }, [user, loc.pathname, loc.search, navigate]);

  if (!user) return null;
  return <>{children}</>;
}
