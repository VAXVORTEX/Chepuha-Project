import React, { useMemo } from "react";
import classNames from "classnames";
import styles from "./GameResult.module.scss";
import { Phases } from "../../types/phaseVariant";
import HomeIcon from "../HomeIcon/HomeIcon";
import { useLanguage } from "../../contexts/LanguageContext";
import { TEMPLATES, parseLegacyStory } from "../../config/templates";
import { getFontSize } from "../../utils/nickname";
import { hyphenateLongWords } from "../../utils/text";
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

    // Apply soft hyphens to long words for proper hyphenation visuals
    return hyphenateLongWords(c);
  }, [current?.story, current?.answers, current?.templateId, language, showColors]);

  const pColor = current?.playerColor;
  const showNameColor = showColors && pColor;
  const nameIsSpecial = showNameColor && pColor?.startsWith('special:');
  const nameClass = nameIsSpecial ? `${pColor?.replace('special:', '')}-text` : '';
  const nameStyle = showNameColor
    ? { color: nameIsSpecial ? 'transparent' : pColor }
    : {
      color: '#FFFFFF',
      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.3)'
    };


  const getResultFontSize = (text: string) => {
    if (!text) return undefined;
    const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
    // User requested "history nickname... not decreasing if too big".
    // We'll use a slightly smaller base (80 for PC, 32 for mobile) to give it more room to grow/shrink.
    return getFontSize(text, isPC ? 80 : 32);
  };

  const getStoryFontSize = (text: string) => {
    if (!text) return undefined;
    const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
    const len = text.length;
    const baseSize = isPC ? 55 : 18;
    
    // Scale down if story is very long
    if (len > 300) {
      const reduction = Math.min(Math.floor((len - 300) / 50) * 2, isPC ? 15 : 4);
      return `${baseSize - reduction}px`;
    }
    return `${baseSize}px`;
  };

  return (
    <div className={classNames(styles.wrapper, styles[phase], "results-view")}>
      <div className={styles.container}>
        <div className={classNames(styles.box, styles[phase])}>
          <h2 className={styles.title}>
            {t('STORY_OF')} {(() => {
              const theme = pColor?.startsWith('special:') ? pColor.replace('special:', '') : '';
              const content = (
                <span className={classNames("player-name", nameClass, "notranslate")} translate="no" style={{ ...nameStyle, fontSize: getResultFontSize(current?.playerName) }}>
                  {current?.playerName || t('LOADING')}
                </span>
              );
              if (theme === 'pirate-caribbean' || theme === 'cyber-samurai-iconic') {
                return <span className={`${theme}-bg inline-wrapper`}>{content}</span>;
              }
              return content;
            })()}
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
                style={{ fontSize: getStoryFontSize(content) }}
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