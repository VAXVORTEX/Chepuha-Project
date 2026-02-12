import React from "react";
import classNames from "classnames";
import styles from "./Story.module.scss";
import { Phases } from "../../types/phaseVariant";

interface Story {
  title: string;
  content: string;
  phase: Phases;
  onHome: () => void;
  onGoBack: () => void;
}

const Story: React.FC<Story> = ({
  title,
  content,
  phase,
  onHome,
  onGoBack,
}) => {
  return (
    <div className={classNames(styles.wrapper, styles[phase])}>
      <div className={styles.container}>
        <div className={classNames(styles.box, styles[phase])}>
          <h2 className={styles.title}> {title}</h2>
          <div className={styles.part}>
            <p className={styles.text}> {content}</p>
          </div>
          {(phase === Phases.Waiting || phase === Phases.End) &&(
            <button className={styles.GoBackButton} onClick={onGoBack}>
              Назад
            </button>
          )}
        </div>
        <div className={classNames(styles.shadow, styles[phase])}></div>
      </div>
      <div className={styles.home} onClick={onHome}>
        <div className={styles.homeSign}></div>
      </div>
    </div>
  );
};

export default Story;
