import React from "react";

export default function PageLoader() {
  return (
    <div className="top-0 left-0 fixed h-[100vh] w-full overflow-hidden flex justify-center items-center z-50">
      <div className="animate-spin border-4 border-primaryAccent  rounded-full border-t-primary w-10 h-10" />
    </div>
  );
}

type LoaderSize = "small" | "medium" | "large";
export function Loader({ size }: { size?: LoaderSize }) {
  const getSize = (size: LoaderSize) => {
    switch (size) {
      case "large":
        return "w-10 h-10";
      case "medium":
        return "w-7 h-7";
      case "small":
        return "w-4 h-4";
      default:
        return "w-10 h-10";
    }
  };
  return (
    <div className=" w-full overflow-hidden flex justify-center items-center z-50">
      <div
        className={`animate-spin border-4 border-primaryAccent  rounded-full border-t-primary ${getSize(
          size!
        )}`}
      />
    </div>
  );
}
