export const hyphenateLongWords = (text: string, maxLen: number = 12): string => {
  if (!text) return text;
  return text.replace(/[a-zA-Z\u0400-\u04ff0-9]{13,}/g, (word) => {
    let result = '';
    for (let i = 0; i < word.length; i += maxLen) {
      result += word.substring(i, i + maxLen);
      if (i + maxLen < word.length) {
        result += '\u00AD';
      }
    }
    return result;
  });
};
