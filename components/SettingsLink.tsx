"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

import Link from "next/link";
import SettingsWrapper from "@/components/SettingsWrapper";

const SettingsLink = () => {
  const [isVisible, setIsVisible] = useState(false);
  // 提取的处理函数
  const toggleVisibility = () => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
    console.log("isVisible", isVisible);
  };

  return (
    // <>
    //   {/* 使用FontAwesomeIcon图标作为按钮 */}
    //   <FontAwesomeIcon icon={faCog} size="2x" onClick={toggleVisibility} />

    //   {/* 根据isVisible状态展示或隐藏组件 */}
    //   <div
    //     className={`component-container ${
    //       isVisible ? "animate-slide-in-right" : ""
    //     }`}
    //   >

    //     <SettingsWrapper />
    //   </div>
    // </>
    <Link href="/settings" aria-label="Settings">
      <FontAwesomeIcon icon={faCog} size="2x" className="icon-hover" />
    </Link>
  );
};

export default SettingsLink;

//  <Link href="/settings" aria-label="Settings">
//    <FontAwesomeIcon icon={faCog} size="2x" />
//  </Link>;
