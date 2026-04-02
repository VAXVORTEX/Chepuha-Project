import React, { useMemo } from "react";
import classNames from "classnames";
import styles from "./GameResult.module.scss";
import { Phases } from "../../types/phaseVariant";
import HomeIcon from "../HomeIcon/HomeIcon";
import { useLanguage } from "../../contexts/LanguageContext";
import { TEMPLATES, parseLegacyStory } from "../../config/templates";
import { renderThemedNickname } from "../../utils/nickname";
interface Story {
  playerName: string;
  story: string;
  answers?: string[];
  templateId?: string;
  playerColor?: string;
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
  showColors?: boolean;
}
const downloadAsTxt = (text: string, playerName: string) => {
  const safe = playerName.replace(/[^a-zA-Z0-9\u0400-\u04ff]/g, "_");
  const filename = `${safe}_ChepuhaGame.txt`;
  const plainText = text.replace(/<\/?[^>]+(>|$)/g, "");
  const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
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
  showColors = true
}) => {
  const { t, language } = useLanguage();
  const current = stories[storyIndex];


  const content = useMemo(() => {
    let c = current?.story ?? "";
    let finalAnswers = current?.answers;
    let finalTemplateId = current?.templateId;
    if (!finalAnswers || !finalTemplateId) {
      const legacyParsed = parseLegacyStory(c);
      if (legacyParsed) {
        finalAnswers = legacyParsed.answers;
        finalTemplateId = legacyParsed.templateId;
      }
    }
    if (finalAnswers && finalTemplateId && !c.includes('</span>')) {
      const tmpl = TEMPLATES[finalTemplateId];
      if (tmpl) {
        c = tmpl.buildStory(finalAnswers, language);
      }
    }


    if (!showColors) {
      c = c.replace(/<\/?[^>]+(>|$)/g, "");
    }
    return c;
  }, [current?.story, current?.answers, current?.templateId, language, showColors]);

  const pColor = current?.playerColor;
  const showNameColor = showColors && pColor;
  const nameIsSpecial = showNameColor && pColor?.startsWith('special:');
  const nameClass = nameIsSpecial ? `${pColor?.replace('special:', '')}-text` : '';  return (
    <div className={classNames(styles.wrapper, styles[phase], "results-view")}>
      <div className={styles.container}>
        <div className={classNames(styles.box, styles[phase])}>
          <h2 className={styles.title}>
            {t('STORY_OF')} {renderThemedNickname(current?.playerName || t('LOADING'), pColor || '', 42, showColors)}
          </h2>
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
              <p
                className={styles.text}
                dangerouslySetInnerHTML={{ __html: content }}
              />
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
                {phase === Phases.History ? (language === 'uk' ? 'Назад' : 'Back') : t('BACK_TO_MENU')}
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