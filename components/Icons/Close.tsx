import React from "react";

export default function Close({
  color = "#3626A7",
  size = "87",
  onClick,
}: {
  color?: string;
  size?: string;
  onClick?: () => void;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 86 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <rect
        x="3.75562"
        y="0.719727"
        width="116"
        height="5"
        transform="rotate(45 3.75562 0.719727)"
        fill={color}
      />
      <rect
        y="82.0244"
        width="116"
        height="5"
        transform="rotate(-45 0 82.0244)"
        fill={color}
      />
    </svg>
  );
}
