"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSDK: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

export default function ChatwootWidget() {
  useEffect(() => {
    const initChatwoot = () => {
      const BASE_URL = "https://chatwoot.14790897.xyz";
      const script = document.createElement("script");
      script.src = BASE_URL + "/packs/js/sdk.js";
      script.defer = true;
      script.async = true;
      
      script.onload = function() {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: 'orWZsZ6gj6fwdq5L4UaEUey6',
            baseUrl: BASE_URL
          });
        }
      };
      
      document.head.appendChild(script);
    };

    // Initialize Chatwoot
    initChatwoot();

    // Cleanup function to remove script if component unmounts
    return () => {
      const existingScript = document.querySelector('script[src*="/packs/js/sdk.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}
