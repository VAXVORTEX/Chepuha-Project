import React from 'react';

export const getFontSize = (text: string, baseSizeArg: number = 24) => {
  if (!text) return undefined;
  const len = text.length;
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;

  const baseSize = isPC ? baseSizeArg : Math.floor(baseSizeArg * 0.85);
  const threshold = 7; // Nicknames up to 7 chars stay at full size
  if (len <= threshold) return `${baseSize}px`;

  // The user explicitly requested:
  // - Mobile: at 25 characters, font size must be exactly 25px.
  // - PC: at 25 characters, font size must be exactly 77px.
  // We use these specific drop targets at len = 25 (18 chars above threshold).
  // We calculate target sizes by assuming standard bases (40 for mobile, 90 for PC).
  // Target ratio: mobile -> 15.5 / 40 = 0.3875; PC -> 77 / 90 = ~0.855
  
  const targetRatio = isPC ? (77 / 90) : (15.5 / 40); // 15.5px allows decent gaps for 25 M's on 390px screens
  const targetSizeAt25 = baseSize * targetRatio;
  
  // Reduction needed per character to exactly hit targetSizeAt25 at len=25
  const reductionPerChar = (baseSize - targetSizeAt25) / 18;
  const reduction = (len - threshold) * reductionPerChar;
  const minSize = isPC ? Math.floor(baseSizeArg * 0.35) : 10; 
  const calculatedSize = Math.max(minSize, Math.floor(baseSize - reduction));
  return `${calculatedSize}px`;
};

export const getNicknameStyle = (color: string, text: string = '', isInline: boolean = false) => {
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
  const isBlack = color === '#000000' || color === '#000';

  if (isBlack) {
    return { 
      color: color || '#000000', 
      textShadow: 'none', 
      WebkitTextStroke: '0' 
    } as React.CSSProperties;
  }

  // Use consistent stroke for ALL non-black colors to prevent vertical drift
  // when switching between solid and animated themes. The stroke must match
  // the CSS baseline in .player-name (0.5px PC, 0.3px mobile).
  return {
    color: color || '#000000',
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
  const style = showHighlight ? getNicknameStyle(color, name, isInline) : { color: '#000000', textShadow: 'none' };
  
  const fontSize = customFontSize || ((isInline || skipFontSize) ? undefined : getFontSize(name, defaultSize));

  const content = (
    <span 
      className={themeClass + (!showHighlight ? ' no-highlight' : '') + (isInline ? ' is-inline' : '') + " notranslate"} 
      translate="no" 
      style={{ ...style, fontSize }}
    >
      {name}
    </span>
  );

  const bgClass = theme && showHighlight && (theme === 'pirate-caribbean' || theme === 'cyber-samurai-iconic')
    ? (isInline ? `story-${theme === 'pirate-caribbean' ? 'pirate' : 'samurai'}-bg` : `${theme}-bg`)
    : '';

  return (
    <span className={`${bgClass} inline-wrapper${isInline ? ' is-inline' : ''} render-wrapper`}>
      {content}
    </span>
  );
};
