import React from 'react';

export const getFontSize = (text: string, baseSizeArg: number = 24) => {
  if (!text) return undefined;
  const len = text.length;
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;

  const baseSize = isPC ? baseSizeArg : Math.floor(baseSizeArg * 0.85);
  const threshold = 7; // Nicknames up to 7 chars stay at full size
  if (len <= threshold) return `${baseSize}px`;

  // For a base of 34 (WaitCard mobile), we want length 25 (18 over threshold) to reach 25px
  // Reduction needed: 34 - 25 = 9px. 9 / 18 chars = 0.5px per character.
  // For PC (base 48), we want a proportional reduction -> 48 to ~35px -> 13px / 18 = ~0.72px
  const reductionPerChar = isPC ? 0.72 : 0.5;
  const reduction = (len - threshold) * reductionPerChar;
  const minSize = isPC ? Math.floor(baseSizeArg * 0.35) : Math.floor(baseSizeArg * 0.4);
  const calculatedSize = Math.max(minSize, Math.floor(baseSize - reduction));
  return `${calculatedSize}px`;
};

export const getNicknameStyle = (color: string) => {
  const isDark = color === '#000000' || color === '#000' || color === '#8b0000' || color === '#4b0082';
  const isSpecial = color?.startsWith('special:');
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;

  if (isSpecial) {
    return { textShadow: 'none' };
  }

  return {
    color: color || '#000000',
    textShadow: isDark ? 'none' : '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
    WebkitTextStroke: isDark ? 'none' : (isPC ? '0.5px black' : '0.3px black')
  } as React.CSSProperties;
};

export const getNicknameClassName = (color: string, baseClass: string = 'player-name') => {
  if (color?.startsWith('special:')) {
    return `${baseClass} ${color.replace('special:', '')}-text`;
  }
  return baseClass;
};

export const renderThemedNickname = (
  name: string, 
  color: string, 
  defaultSize: number = 36, 
  showHighlight: boolean = true,
  isInline: boolean = false,
  skipFontSize: boolean = false,
  customFontSize?: string
) => {
  const themeClass = getNicknameClassName(color);
  const theme = color.startsWith('special:') ? color.replace('special:', '') : '';
  const style = showHighlight ? getNicknameStyle(color) : { color: '#000000', textShadow: 'none' };
  
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
  const themeBoost = isPC ? 1.15 : 1.05;
  const isPremiumBg = showHighlight && (theme === 'pirate-caribbean' || theme === 'cyber-samurai-iconic');
  const effectiveSize = (isPremiumBg && !isInline) ? Math.floor(defaultSize * themeBoost) : defaultSize;
  const fontSize = customFontSize || ((isInline || skipFontSize) ? undefined : getFontSize(name, effectiveSize));

  const content = (
    <span 
      className={themeClass + (!showHighlight ? ' no-highlight' : '') + (isInline ? ' is-inline' : '') + " notranslate"} 
      translate="no" 
      style={{ ...style, fontSize }}
    >
      {name}
    </span>
  );

  if (showHighlight && (theme === 'pirate-caribbean' || theme === 'cyber-samurai-iconic')) {
    const bgClass = isInline ? `story-${theme === 'pirate-caribbean' ? 'pirate' : 'samurai'}-bg` : `${theme}-bg`;
    return (
      <span className={`${bgClass} inline-wrapper${isInline ? ' is-inline' : ''}`}>
        {content}
      </span>
    );
  }

  return content;
};
