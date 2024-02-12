import React from "react";
import { sendGAEvent } from "@next/third-parties/google";
//i18n
import { useTranslation } from "@/app/i18n/client";
// BuyVipButton 组件
function BuyVipButton({ lng }: { lng: string }) {
  //i18n
  const { t } = useTranslation(lng);
  // 这是购买VIP的目标URL
  const targetUrl = "https://store.paperai.life";
  return (
    <a href={targetUrl} target="_blank" className="no-underline">
      <button
        className="bg-gold text-white font-semibold text-lg py-2 px-4 rounded cursor-pointer border-none shadow-md transition duration-300 ease-in-out transform hover:scale-110"
        onClick={() =>
          sendGAEvent({ event: "buyVipButtonClicked", value: "buy vip" })
        }
      >
        {t(
          "Buy VIP TO UNLOCK Cloud Sync and Edit Mutiple Papers Simultaneously"
        )}
      </button>
    </a>
  );
}

export default BuyVipButton;
