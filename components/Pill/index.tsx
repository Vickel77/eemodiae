import React from "react";

function Pill({ label }: { label: string }) {
  return (
    <div className=" py-1 px-3 rounded-full bg-[#657ed422] inline-flex text-primary text-sm ">
      {label}
    </div>
  );
}

export default Pill;
