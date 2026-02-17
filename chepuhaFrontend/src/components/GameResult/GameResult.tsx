import React from "react";
import classNames from "classnames";
import styles from "./GameResult.module.scss";
import { Phases } from "../../types/phasevariant";

interface ResultProps {
  title: string;
  content: string;
  phase: Phases;
  onHome: () => void;
  onGoBack: () => void;
  onSave: () => void;
}

const GameResult: React.FC<ResultProps> = ({
  title,
  content,
  phase,
  onHome,
  onGoBack,
  onSave,
}) => {
  return (
    <div className={classNames(styles.wrapper, styles[phase])}>
      <div className={styles.container}>
        <div className={classNames(styles.box, styles[phase])}>
          <h2 className={styles.title}> {title}</h2>
          <div className={styles.part}>
            <p className={styles.text}> {content}</p>
          </div>
          {(phase === Phases.Waiting || phase === Phases.End) && (
            <div className={styles.actions}>
              <button className={styles.GoBackButton} onClick={onGoBack}>
                На головну
              </button>
              <button className={styles.GoBackButton} onClick={onSave}>
                Зберегти
              </button>
            </div>
          )}
        </div>
        <div className={classNames(styles.shadow, styles[phase])}></div>
      </div>
    </div>
  );
};

export default GameResult;
