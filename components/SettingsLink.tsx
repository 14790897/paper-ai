"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const SettingsLink = () => {
  return (
    <Link href="/settings" aria-label="Settings">
      <FontAwesomeIcon icon={faCog} size="2x" />
    </Link>
  );
};

export default SettingsLink;
