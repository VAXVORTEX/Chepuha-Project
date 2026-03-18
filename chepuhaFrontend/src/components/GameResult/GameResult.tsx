import React from "react";
import classNames from "classnames";
import styles from "./GameResult.module.scss";
import { Phases } from "../../types/phaseVariant";
import HomeIcon from "../HomeIcon/HomeIcon";
import { useLanguage } from "../../contexts/LanguageContext";
import { TEMPLATES, parseLegacyStory } from "../../config/templates";
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
  const plainText = text.replace(/<\/?[^>]+(>|$)/g, ""); // Always plain text for TXT download
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
  if (finalAnswers && finalTemplateId && !content.includes('</span>')) {
    const tmpl = TEMPLATES[finalTemplateId];
    if (tmpl) {
      content = tmpl.buildStory(finalAnswers, language);
    }
  }

  // Strip colors ONLY if showColors is explicitly disabled
  if (!showColors) {
    content = content.replace(/<\/?[^>]+(>|$)/g, "");
  }

  const pColor = current?.playerColor;
  const showNameColor = showColors && pColor;
  const nameIsSpecial = showNameColor && pColor?.startsWith('special:');
  const nameClass = nameIsSpecial ? `${pColor?.replace('special:', '')}-text` : '';
  const nameStyle = !nameIsSpecial && showNameColor
    ? { color: pColor }
    : {
      color: '#FFFFFF',
      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.3)',
      WebkitTextStroke: '1px black'
    };

  // Dynamic font-size calculation (Shrink-to-fit)
  const getFontSize = (text: string) => {
    if (!text) return undefined;
    const len = text.length;
    const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
    // Base size 90 on PC to match "YOUR NICK" label, 36 on Mobile
    const baseSize = isPC ? 90 : 36;

    if (len <= 6) return `${baseSize}px`;
    const scaleFactor = 6 / len;
    // min size 36 on PC, 18 on Mobile
    const minSize = isPC ? 36 : 18;
    const calculatedSize = Math.max(minSize, Math.floor(baseSize * Math.pow(scaleFactor, 0.6)));
    return `${calculatedSize}px`;
  };

  return (
    <div className={classNames(styles.wrapper, styles[phase])}>
      <div className={styles.container}>
        <div className={classNames(styles.box, styles[phase])}>
          <h2 className={styles.title}>
            {t('STORY_OF')} <span className={nameClass} style={{ ...nameStyle, fontSize: getFontSize(current?.playerName) }}>{current?.playerName || t('LOADING')}</span>
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
                {t('BACK_TO_MENU')}
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
