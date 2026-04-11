"use client";
import React from "react";
import { useAppDispatch } from "@/app/store";
import { setShowPaperManagement } from "@/app/store/slices/stateSlice";

export default function PaperListButton() {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(setShowPaperManagement());
  };
  return (
    <button
      type="button"
      aria-label="VIP"
      title="VIP"
      className="inline-flex h-9 items-center justify-center rounded-full border border-amber-400/80 bg-gradient-to-r from-amber-300 to-yellow-200 px-3 text-xs font-bold tracking-wide text-amber-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      onClick={handleClick}
    >
      VIP
    </button>
  );
}

// "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This%20starter%20configures%20Supabase%20Auth%20to%20use%20cookies%2C%20making%20the%20user's%20session%20available%20throughout%20the%20entire%20Next.js%20app%20-%20Client%20Components%2C%20Server%20Components%2C%20Route%20Handlers%2C%20Server%20Actions%20and%20Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png&integration-ids=oac_VqOgBHqhEoFTPzGkPd7L0iH6";
