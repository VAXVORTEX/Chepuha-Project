import { TEMPLATES, StoryTemplate } from '../config/templates';

/**
 * Extracts a UUID or numeric ID from an object safely.
 */
export const extractEntityId = (entity: any): string | undefined => {
  if (!entity) return undefined;
  if (typeof entity === 'string') return entity;
  if (typeof entity === 'object' && entity !== null) {
    if (entity.id) return String(entity.id);
  }
  return undefined;
};

/**
 * Packs template configuration into a single string for Supabase sync.
 */
export const packTemplate = (
  templateId: string,
  gameLength: number,
  storyMode: boolean,
  hintsEnabled: boolean,
  colorHighlight: boolean,
  customName?: string,
  customQuestions?: string[]
): string => {
  const parts = [
    templateId,
    gameLength.toString(),
    storyMode ? '1' : '0',
    hintsEnabled ? '1' : '0',
    colorHighlight ? '1' : '0'
  ];
  
  if (templateId === 'custom_ai' && customName && customQuestions) {
    parts.push(customName);
    parts.push(...customQuestions);
  }
  
  return parts.join('|');
};

/**
 * Unpacks a template configuration string into strongly typed settings.
 */
export const unpackTemplate = (rawString: string | null | undefined, defaults: any) => {
  const configString = rawString || defaults.selectedTemplate || 'classic';
  const parts = configString.split('|');
  
  const templateKey = parts[0] || 'classic';
  const gameLength = parts[1] ? (parseInt(parts[1], 10) as 6 | 9 | 12) : defaults.gameLength;
  const storyMode = parts[2] ? parts[2] === '1' : defaults.storyMode;
  const hintsEnabled = parts[3] ? parts[3] === '1' : defaults.hintsEnabled;
  const colorHighlight = parts[4] ? parts[4] === '1' : defaults.colorHighlight;
  
  let activeTemplate: StoryTemplate = (TEMPLATES as any)[templateKey] || TEMPLATES.classic;
  
  if (templateKey === 'custom_ai' && parts.length > 5) {
    const questions = parts.slice(6);
    activeTemplate = {
      id: 'custom_ai',
      name: parts[5] || 'custom_ai',
      questionTypes: questions,
      questions: questions,
      fallbacks: Array(12).fill(['...']),
      buildStory: (answers: string[]) => {
        const filtered = answers.filter(a => a && a !== '__REMOVE_ME__' && a.trim());
        if (filtered.length === 0) return 'Історія не була згенерована.';
        return filtered.join('. ') + '.';
      }
    } as unknown as StoryTemplate;
  }
  
  return {
    templateKey,
    gameLength,
    storyMode,
    hintsEnabled,
    colorHighlight,
    activeTemplate,
    customName: templateKey === 'custom_ai' ? parts[5] : undefined,
    customQuestions: templateKey === 'custom_ai' ? parts.slice(6) : undefined
  };
};
