import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import classNames from "classnames";
import styles from "./GameResult.module.scss";
import { Phases } from "../../types/phaseVariant";
import HomeIcon from "../HomeIcon/HomeIcon";
import VoiceSelector from "../VoiceSelector/VoiceSelector";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTTS } from "../../contexts/TTSContext";
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

const ZOOM_KEY = 'chepuha_story_zoom';
const ZOOM_LEVELS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.4, 1.6, 1.8, 2.0];

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
  const current = (stories || [])[storyIndex];

  // Zoom state
  const [zoomIndex, setZoomIndex] = useState<number>(() => {
    const saved = localStorage.getItem(ZOOM_KEY);
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < ZOOM_LEVELS.length) return idx;
    }
    return 5; // default = 1.25 (increased by 2 steps)
  });

  const { playTTS, stopTTS, pauseTTS, resumeTTS, preloadTTS, checkAudioReady, isPlaying, isPaused, isLoading, currentVoice, setCurrentVoice } = useTTS();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const zoomIn = () => setZoomIndex(i => {
    const next = Math.min(i + 1, ZOOM_LEVELS.length - 1);
    localStorage.setItem(ZOOM_KEY, String(next));
    return next;
  });
  const zoomOut = () => setZoomIndex(i => {
    const next = Math.max(i - 1, 0);
    localStorage.setItem(ZOOM_KEY, String(next));
    return next;
  });
  const zoomScale = ZOOM_LEVELS[zoomIndex];

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
    // Only rebuild if the story is empty but we have answers (shouldn't happen, but just in case)
    if (!c && finalAnswers && finalTemplateId) {
      const tmpl = TEMPLATES[finalTemplateId];
      if (tmpl) {
        c = tmpl.buildStory(finalAnswers, language);
      }
    }


    if (!showColors) {
      c = c.replace(/<\/?[^>]+(>|$)/g, "");
    }

    return hyphenateLongWords(c);
  }, [current?.story, current?.answers, current?.templateId, language, showColors]);

  const fullContentText = content ? `${t('STORY_OF')} ${current?.playerName}. ${content}` : '';
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Pre-generate TTS audio in the background for ALL stories sequentially
  useEffect(() => {
    if (stories && stories.length > 0 && preloadTTS && t) {
        let isCancelled = false;
        
        const preloadAll = async () => {
            // First preload current story to prioritize it!
            if (fullContentText) {
                await preloadTTS(fullContentText, currentVoice);
            }
            // Then preload the rest sequentially
            for (let i = 0; i < stories.length; i++) {
                if (isCancelled) break;
                if (i === storyIndex) continue; // already did this
                const s = stories[i];
                if (s && s.story) {
                    const fullText = `${t('STORY_OF')} ${s.playerName}. ${s.story}`;
                    await preloadTTS(fullText, currentVoice);
                }
            }
        };
        
        preloadAll();
        return () => { isCancelled = true; };
    }
  }, [stories, currentVoice, preloadTTS, t, fullContentText, storyIndex]);

  // When story or voice changes, check if it's already preloaded
  useEffect(() => {
    setIsAudioReady(checkAudioReady(fullContentText, currentVoice));
  }, [fullContentText, currentVoice, checkAudioReady]);

  const pColor = current?.playerColor;
  const showNameColor = showColors && pColor;
  const nameIsSpecial = showNameColor && pColor?.startsWith('special:');
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && storyIndex < (stories?.length || 0) - 1) {
      onNext();
    }
    if (isRightSwipe && storyIndex > 0) {
      onPrev();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className={classNames(styles.wrapper, styles[phase], "results-view")}>
      <div className={styles.container}>
        <div 
          className={classNames(styles.box, styles[phase], nameIsSpecial && styles[pColor?.split(':')[1] + 'Theme'])}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            className={classNames(styles.arrowBtn, styles.arrowLeft)}
            onClick={onPrev}
            disabled={storyIndex === 0}
            aria-label={t('PREVIOUS')}
          >
            ◀
          </button>
          <button
            className={classNames(styles.arrowBtn, styles.arrowRight)}
            onClick={onNext}
            disabled={storyIndex >= (stories?.length || 1) - 1}
            aria-label={t('NEXT')}
          >
            ▶
          </button>

          <div className={styles.titleWrapper}>
            <h2 className={styles.title}>
              {t('STORY_OF')} {showNameColor ? (
                <span 
                  className={classNames("notranslate", nameIsSpecial && "special-name")} 
                  translate="no" 
                  style={!nameIsSpecial ? { color: pColor, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' } : undefined}
                >
                  {current?.playerName}
                </span>
              ) : current?.playerName}
            </h2>
          </div>

          <div className={styles.part}>
            <div
              className={classNames(styles.text, "notranslate")}
              translate="no"
              style={{ fontSize: `calc(100% * ${zoomScale})` }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>


          {(phase === Phases.End || phase === Phases.History) && (
            <div className={styles.actions}>
              <div className={styles.actionButtonsRow}>
                <div className={styles.orderBack}>
                  <button className={styles.GoBackButton} onClick={onHome}>
                    {phase === Phases.History ? (language === 'uk' ? 'Назад' : 'Back') : (language === 'uk' ? 'Меню' : 'Menu')}
                  </button>
                </div>

                <div className={styles.orderVoice}>
                  <VoiceSelector
                    selectedVoice={currentVoice}
                    onChange={setCurrentVoice}
                    onPlay={() => playTTS(`${t('STORY_OF')} ${current?.playerName}. ${content}`)}
                    onStop={stopTTS}
                    onPause={pauseTTS}
                    onResume={resumeTTS}
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                    isLoading={isLoading && !isAudioReady}
                    isReady={isAudioReady}
                  />
                </div>
                
                <div className={classNames(styles.zoomControls, styles.orderZoom)}>
                  <button
                    className={styles.controlBtn}
                    onClick={zoomOut}
                    disabled={zoomIndex === 0}
                    aria-label="Zoom out"
                    title="Зменшити текст"
                  >
                    A−
                  </button>
                  <span className={styles.zoomLabel}>{Math.round(zoomScale * 100)}%</span>
                  <button
                    className={styles.controlBtn}
                    onClick={zoomIn}
                    disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                    aria-label="Zoom in"
                    title="Збільшити текст"
                  >
                    A+
                  </button>
                </div>

                {onSave && (
                  <div className={styles.orderSave}>
                    <button
                      className={styles.GoBackButton}
                      onClick={() => {
                        downloadAsTxt(content, myNickname);
                        onSave();
                      }}
                    >
                      {t('SAVE' as any)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={classNames(styles.shadow, styles[phase])}></div>
      </div>
    </div>
  );
};
export default React.memo(GameResult);