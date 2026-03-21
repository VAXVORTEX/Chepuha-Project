import React from "react";
import styles from "./Button.module.scss";
import { Phases } from "../../types/phaseVariant";
interface ButtonSet {
  label: string;
  variant: "primary" | "secondary";
  phase: Phases;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}
const Button: React.FC<ButtonSet> = ({ label, variant, phase, onClick, disabled, loading }) => {
  const combClasses = `${styles.button} ${styles[variant]} ${styles[phase]} ${loading ? styles.loading : ""}`;
  return (
    <button className={combClasses} onClick={onClick} disabled={disabled || loading}>
      {label}
      {loading && (
        <span className={styles.dots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      )}
    </button>
  );
};
export default Button;