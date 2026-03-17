import React from "react";
import styles from "./Story.module.scss";
import { Phases } from "../../types/phaseVariant";
import AutoFitText from "../AutoFitText/AutoFitText";
interface Story {
  title: string;
  content: string;
  phase: Phases;
  onHome: () => void;
}
const Story: React.FC<Story> = ({
  title,
  content,
  phase,
  onHome,
}) => {
  return (
    <div className={`${styles.wrapper} ${styles[phase] || ''}`}>
      <div className={styles.container}>
        <div className={`${styles.box} ${styles[phase] || ''}`}>
          <h2 className={styles.title}> {title}</h2>
          <div className={styles.part}>
            <AutoFitText
              html={content}
              maxFontSize={window.innerWidth <= 768 ? 24 : 45}
              minFontSize={14}
              className={styles.text}
            />
          </div>
          {(phase === Phases.Waiting || phase === Phases.End) && (
            <button className={styles.GoBackButton} onClick={onHome}>
              Назад
            </button>
          )}
        </div>
        <div className={`${styles.shadow} ${styles[phase] || ''}`}></div>
      </div>
      <div className={styles.home} onClick={onHome}>
        <div className={styles.homeSign}></div>
      </div>
    </div>
  );
};
export default Story;
