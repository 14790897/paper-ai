import React from "react";

// 定义props的类型
interface ProgressDisplayProps {
  generatedPaperNumber: number;
  i: number;
}

// 使用接口为函数组件的props提供类型注解
const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  generatedPaperNumber,
  i,
}) => {
  // 计算完成的百分比
  const percentage = ((i / generatedPaperNumber) * 100).toFixed(2);

  return (
    <div className="relative">
      {/* 可以添加一个进度条来直观显示进度 */}
      <div className="h-4 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${
            Number(percentage) < 100 ? "bg-yellow-500" : "bg-green-500"
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {/* 文字放置在进度条内部 */}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-white pointer-events-none">
        <p>
          {i} / {generatedPaperNumber}task {percentage}% Complete
        </p>
      </div>
    </div>
  );
};

export default ProgressDisplay;
