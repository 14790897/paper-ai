import React, { useState } from "react";
import { toast } from "react-toastify";

// 自定义Toast内容组件
const ExpandableToastContent = ({ fullText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-full max-w-none p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      {/* 可以继续添加更多的Tailwind CSS类来定制外观 */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {isExpanded ? fullText : `${fullText.substring(0, 100)}...`}
      </div>
      <button
        onClick={toggleExpand}
        className="mt-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
      >
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

// 使用自定义Toast内容的函数
export const showExpandableToast = (message: string) => {
  toast(<ExpandableToastContent fullText={message} />, {
    position: "top-center",
    autoClose: 3000,
    pauseOnHover: true,
    className: "toastDetail",
  });
};
