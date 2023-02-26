import React from "react";
import { useTheme } from "styled-components";

export default function Hamburger({
  color,
  size = "44",
  onClick,
}: {
  color?: string;
  size?: string;
  onClick?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <svg
      width={`${+size * 2.6}`}
      height={size}
      viewBox="0 0 116 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
    >
      <path d="M0 0H116V5H0V0Z" fill={color ?? colors.primary} />
      <path d="M0 19H93V24H0V19Z" fill={color ?? colors.primary} />
      <path d="M0 39H54V44H0V39Z" fill={color ?? colors.primary} />
    </svg>
  );
}
