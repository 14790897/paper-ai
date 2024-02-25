// @/components/LoadingIndicator.tsx
import React from "react";

function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center p-5">
      <div className="spinner animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p className="text-lg">Loading editor...</p>
    </div>
  );
}

export default LoadingIndicator;
