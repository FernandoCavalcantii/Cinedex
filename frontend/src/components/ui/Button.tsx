import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "type">;

export function Button({ children, className, type = "button", ...props }: ButtonProps) {
  const classes = className ? `${styles.button} ${className}` : styles.button;

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
