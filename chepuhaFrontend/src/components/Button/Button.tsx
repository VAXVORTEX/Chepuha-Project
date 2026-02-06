import React from "react";
import styles from "./Button.module.scss";
import { Phases } from "../../types/phaseVariant";

interface ButtonSet {
  label: string;
  variant: "primary" | "secondary";
  phase: Phases;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonSet> = ({ label, variant, phase, onClick, disabled }) => {
  const combClasses = `${styles.button} ${styles[variant]} ${styles[phase]}`;
  return (
    <button className={combClasses} onClick={onClick}  disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
