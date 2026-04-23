/**
 * Inserts soft hyphens (&shy;) into long words to force the browser 
 * to show a hyphen (-) when it breaks the word at the end of a line.
 */
export const hyphenateLongWords = (text: string, maxLen: number = 12): string => {
  if (!text) return text;
  
  // This regex finds words (including Cyrillic, Latin, and digits) 
  // that are longer than the threshold.
  return text.replace(/[a-zA-Z\u0400-\u04ff0-9]{13,}/g, (word) => {
    let result = '';
    for (let i = 0; i < word.length; i += maxLen) {
      result += word.substring(i, i + maxLen);
      if (i + maxLen < word.length) {
        result += '\u00AD'; // Soft hyphen
      }
    }
    return result;
  });
};
