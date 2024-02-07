"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const signOut = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
};
