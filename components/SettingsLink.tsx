"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import React from "react";

import Link from "next/link";

const SettingsLink = () => {
  return (
    <Link
      href="/settings"
      aria-label="Settings"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <FontAwesomeIcon icon={faCog} size="lg" />
    </Link>
  );
};

export default SettingsLink;

//  <Link href="/settings" aria-label="Settings">
//    <FontAwesomeIcon icon={faCog} size="2x" />
//  </Link>;
