import React from "react";
import classNames from "classnames";
import styles from "./GameResult.module.scss";
import { Phases } from "../../types/phaseVariant";
import { useLanguage } from "../../contexts/LanguageContext";
import { TEMPLATES, parseLegacyStory } from "../../config/templates";
interface Story {
  playerName: string;
  story: string;
  answers?: string[];
  templateId?: string;
}
interface ResultProps {
  stories: Story[];
  storyIndex: number;
  myNickname: string;
  phase: Phases;
  onHome: () => void;
  onSave?: () => void;
  onPrev: () => void;
  onNext: () => void;
}
function downloadAsTxt(text: string, playerName: string) {
  const safe = playerName.replace(/[^a-zA-Z0-9\u0400-\u04ff]/g, "_");
  const filename = `${safe}_ChepuhaGame.txt`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
const GameResult: React.FC<ResultProps> = ({
  stories,
  storyIndex,
  myNickname,
  phase,
  onHome,
  onSave,
  onPrev,
  onNext,
}) => {
  const { t, language } = useLanguage();
  const current = stories[storyIndex];
  const title = current ? `${t('STORY_OF')} ${current.playerName}` : t('LOADING');
  let content = current?.story ?? "";
  let finalAnswers = current?.answers;
  let finalTemplateId = current?.templateId;
  if (!finalAnswers || !finalTemplateId) {
    const legacyParsed = parseLegacyStory(content);
    if (legacyParsed) {
      finalAnswers = legacyParsed.answers;
      finalTemplateId = legacyParsed.templateId;
    }
  }
  if (finalAnswers && finalTemplateId) {
    const tmpl = TEMPLATES[finalTemplateId];
    if (tmpl) {
      content = tmpl.buildStory(finalAnswers, language);
    }
  }
  return (
    <div className={classNames(styles.wrapper, styles[phase])}>
      <div className={styles.container}>
        <div className={classNames(styles.box, styles[phase])}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.storyNav}>
            <button
              className={styles.arrowBtn}
              onClick={onPrev}
              disabled={storyIndex === 0}
              aria-label={t('PREVIOUS')}
            >
              ◀
            </button>
            <div className={styles.part}>
              <p className={styles.text}>{content}</p>
            </div>
            <button
              className={styles.arrowBtn}
              onClick={onNext}
              disabled={storyIndex >= stories.length - 1}
              aria-label={t('NEXT')}
            >
              ▶
            </button>
          </div>
          {(phase === Phases.End || phase === Phases.History) && (
            <div className={styles.actions}>
              <button className={styles.GoBackButton} onClick={onHome}>
                {phase === Phases.History ? t('BACK_TO_LIST') : t('GO_MAIN')}
              </button>
              {onSave && (
                <button
                  className={styles.GoBackButton}
                  onClick={() => {
                    downloadAsTxt(content, myNickname);
                    onSave();
                  }}
                >
                  {t('SAVE')}
                </button>
              )}
            </div>
          )}
        </div>
        <div className={classNames(styles.shadow, styles[phase])}></div>
      </div>
    </div>
  );
};
export default GameResult;
