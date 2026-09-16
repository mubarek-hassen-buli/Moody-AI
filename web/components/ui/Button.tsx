import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "right",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-4 py-2 gap-1.5 h-9",
    md: "text-sm px-6 py-3 gap-2 h-11",
    lg: "text-base px-8 py-4 gap-2.5 h-13",
  };

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md hover:shadow-primary/20",
    secondary:
      "bg-moody-card text-moody-text hover:bg-white/80 border border-moody-border shadow-xs hover:border-primary/40",
    outline:
      "bg-transparent text-moody-text border-2 border-primary hover:bg-primary hover:text-white",
    ghost:
      "bg-transparent text-moody-muted hover:text-moody-text hover:bg-black/5",
  };

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="inline-flex shrink-0">{icon}</span>}
    </>
  );

  const combinedClass = cn(baseStyles, sizeStyles[size], variantStyles[variant], className);

  if (href) {
    return (
      <a href={href} className={combinedClass}>
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClass} {...props}>
      {content}
    </button>
  );
};
