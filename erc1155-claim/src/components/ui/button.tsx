import type { ReactNode } from "react";

export default function Button({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={`border border-black bg-black text-white cursor-pointer font-thin transition-all duration-300 ${
        disabled
          ? "opacity-50 cursor-not-allowed hover:bg-black hover:text-white"
          : "hover:bg-white hover:text-black"
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
