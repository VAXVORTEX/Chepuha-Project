import React from 'react';

export const getFontSize = (text: string, baseSizeArg: number = 24) => {
  if (!text) return undefined;
  const len = text.length;
  const isPC = typeof window !== 'undefined' && window.innerWidth > 768;
  const vw = typeof window !== 'undefined' ? window.innerWidth / 100 : 10;

  const baseSize = isPC ? baseSizeArg : Math.floor(baseSizeArg * 0.85);
  const threshold = 7;
  if (len <= threshold) {
    const basePx = baseSize;
    const vwEquiv = basePx / vw;
    return `clamp(${Math.floor(basePx * 0.6)}px, ${vwEquiv.toFixed(2)}vw, ${basePx}px)`;
  }

  const targetRatio = isPC ? (77 / 90) : (24 / 40);
  const targetSizeAt25 = baseSize * targetRatio;
  
  const reductionPerChar = (baseSize - targetSizeAt25) / 18;
  const reduction = (len - threshold) * reductionPerChar;
  const minSize = isPC ? Math.floor(baseSizeArg * 0.35) : 11; 
  const calculatedSize = Math.max(minSize, Math.floor(baseSize - reduction));
  const vwEquiv = calculatedSize / vw;
  return `clamp(${Math.max(minSize, Math.floor(calculatedSize * 0.7))}px, ${vwEquiv.toFixed(2)}vw, ${calculatedSize}px)`;
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
