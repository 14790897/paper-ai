"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * After OAuth sign-in, Supabase sets cookies but the current RSC render
 * may have started before those cookies were available. This component
 * detects when Supabase reports a new session via onAuthStateChange and
 * triggers a router.refresh() so the server component re-reads the cookies.
 */
export default function AuthRefresher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("@/utils/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          // Refresh the RSC tree so the server reads the new session cookies
          router.refresh();
        }
      });
      return () => data.subscription.unsubscribe();
    });
  }, [router, pathname]);

  return null;
}
