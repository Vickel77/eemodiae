import React from "react";

export default function PageLoader() {
  return (
    <div className="top-0 left-0 fixed h-[100vh] w-full overflow-hidden flex justify-center items-center z-50">
      <div className="animate-spin border-4 border-primaryAccent  rounded-full border-t-primary w-10 h-10" />
    </div>
  );
}
