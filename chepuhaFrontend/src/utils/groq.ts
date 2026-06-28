/**
 * Groq API utility for AI story generation and text refinement.
 * Uses Llama 3.3 model via Groq's free tier.
 */

const API_URL = '/api/groq';

export function isGroqAvailable(): boolean {
    return true; // Assume backend handles it
}

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

async function callGroq(messages: GroqMessage[], maxTokens = 800, seed?: number, retries = 2, requireJson = false): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages,
                    maxTokens,
                    seed,
                    requireJson
                })
            });

            if (!response.ok) {
                const err = await response.text();
                if (response.status === 429 && attempt < retries) {
                    await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
                    continue;
                }
                throw new Error(`Groq API error: ${response.status} ${err}`);
            }

            const data = await response.json();
            return data.content || '';
        } catch (e) {
            if (attempt === retries) throw e;
            await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
        }
    }
    return '';
}

/**
 * Generate a fully AI-written funny story based on player answers and template.
 * Used in the new "AI Mode" in the carousel.
 */
export async function generateAIStory(
    answers: string[],
    templateName: string,
    language: 'uk' | 'en' = 'uk',
    seed?: number
): Promise<string> {
    const lang = language === 'uk' ? 'Ukrainian' : 'English';

    const answerList = answers
        .filter(a => a && a.trim())
        .map((a, i) => `${i + 1}. ${a}`)
        .join('\n');

    const systemPrompt = language === 'uk'
        ? `Ти — генератор коротких абсурдних історій для гри "Чепуха".
Твоя мета: створити КОРОТКУ, зв'язну, смішну історію з відповідей гравців.
Тема: "${templateName}". Використовуй цю тему як контекст.
ВАЖЛИВО:
1. Кожну відповідь гравця оберни у тег: <ans>відповідь</ans>. Це КРИТИЧНО!
2. Між відповідями додавай МІНІМУМ тексту — лише 3-5 слів для зв'язку.
3. Виправляй відмінки та граматику відповідей.
4. Переклади все на українську.
5. Максимум 4-6 речень. БЕЗ довгих описів!
Пиши ТІЛЬКИ текст історії.`
        : `You are a generator of short absurd stories for the game "Chepuha".
Goal: create a SHORT, coherent, funny story from player answers.
Theme: "${templateName}". Use this theme as context.
IMPORTANT:
1. Wrap each player answer in: <ans>answer</ans>. This is CRITICAL!
2. Add MINIMAL text between answers — only 3-5 words to connect them.
3. Fix grammar and cases in answers.
4. Translate everything to English.
5. Maximum 4-6 sentences. NO long descriptions!
Write ONLY the story text.`;

    const userPrompt = language === 'uk'
        ? `Напиши коротку історію (4-6 речень) з цих відповідей. Обов'язково оберни кожну відповідь у <ans></ans>:\n${answerList}`
        : `Write a short story (4-6 sentences) using these answers. Wrap each answer in <ans></ans>:\n${answerList}`;

    return await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], 600, seed, 2, false);
}

/**
 * Refine a story sentence to properly match the context of player answers.
 * Fixes pronouns and grammatical agreement.
 */
export async function refineStoryWithAI(
    rawStoryWithHtml: string,
    language: 'uk' | 'en' = 'uk',
    seed?: number
): Promise<string> {
    const systemPrompt = language === 'uk'
        ? `Ти — розумний редактор тексту для гри. Тобі дають текст з HTML-тегами (наприклад <span lang="uk"...>Текст</span>).
Твоє завдання: виправити відмінки, роди та числа в самому тексті історії так, щоб він граматично узгоджувався зі словами всередині тегів.
КРИТИЧНО ВАЖЛИВО:
1. Ти ПОВИНЕН зберегти ВСІ HTML-теги <span> рівно на тих самих місцях, де вони були. Не видаляй їх і не змінюй їхній код.
2. Змінюй текст і закінчення навколо або всередині тегів, щоб усе звучало граматично правильно. АБСОЛЮТНО ЗАБОРОНЕНО залишати в тексті дужки типу '(-ла)', '(-лась)', '(ла)'! ТИ ЗОБОВ'ЯЗАНИЙ обрати лише ОДИН правильний варіант (наприклад 'прошепотів' або 'прошепотіла') і написати його без дужок.
3. Роби першу літеру тексту всередині тегу МАЛОЮ, якщо це слово стоїть у середині речення і не є власним ім'ям або не написане повністю ВЕЛИКИМИ літерами.
4. Прибирай зайву пунктуацію навколо тегів, якщо текст гравця містить символи (наприклад, якщо перед тегом стоїть двокрапка, а в тегу текст починається з "=", прибери двокрапку).
5. Дозволяється злегка перефразовувати або змінювати слова у шаблоні навколо тегів, щоб усунути незграбність та зробити так, щоб речення звучало максимально природно (наприклад, 'їхній стан був від потужності' -> 'вони були вражені потужністю').
6. ПЕРЕКЛАД: Якщо текст всередині тегу написаний ІНШОЮ мовою (наприклад російською або англійською), ТИ ЗОБОВ'ЯЗАНИЙ ПЕРЕКЛАСТИ ЙОГО НА УКРАЇНСЬКУ мову прямо всередині тегу.
Повертай ТІЛЬКИ виправлений текст з тегами, без жодних коментарів.`
        : `You are a smart text editor for a game. You are given a text with HTML tags (like <span lang="en"...>Text</span>).
Your task: fix grammatical cases, pronouns, and agreement in the story text so it matches the words inside the tags.
CRITICAL: 
1. You MUST preserve ALL <span> HTML tags exactly where they are. Do not remove or alter their code.
2. Fix the text and endings around or inside tags to make it grammatically correct. FORBIDDEN to leave options like 'he/she', '(-ed)'. You MUST pick ONE correct pronoun/ending based on context and write it without parentheses.
3. Lowercase the first letter of the text inside the tag if it's in the middle of a sentence, unless it's fully capitalized.
4. Remove redundant punctuation (e.g., if a tag starts with '=', remove the preceding colon in the story).
5. You are allowed to slightly rephrase words around the tags to make the sentence sound completely natural and remove any awkward phrasing.
6. TRANSLATION: If the text inside the tag is written in ANOTHER language (e.g., Russian or Ukrainian), you MUST TRANSLATE IT TO ENGLISH right inside the tag.
Return ONLY the corrected text with tags, no explanations.`;

    const userPrompt = language === 'uk'
        ? `Ось текст історії: \n\n${rawStoryWithHtml}\n\nВиправ граматику і узгодження, обов'язково зберігаючи всі HTML теги.`
        : `Here is the story text: \n\n${rawStoryWithHtml}\n\nFix grammar and agreement, making sure to preserve all HTML tags.`;

    const refined = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], 1500, seed, 2, false);

    return refined || rawStoryWithHtml;
}

/**
 * Generate N dynamic questions for a specific topic.
 */
export async function generateCustomQuestions(
    topic: string,
    count: number,
    language: 'uk' | 'en' = 'uk'
): Promise<string[]> {
    const systemPrompt = language === 'uk'
        ? `Ти — розумний ведучий гри "Чепуха".
Тобі дадуть тему: "${topic}".
СПОЧАТКУ: Зрозумій, що це за тема (наприклад, "TBOI" — це гра The Binding of Isaac). Якщо це ім'я (наприклад, "Johnny Silverhand"), розпізнай його всесвіт. 
КРИТИЧНО: Якщо тема — це набір випадкових букв або незрозуміле слово (наприклад, "РТПТТ", "фіввв", "asdasd"), ТИ ЗОБОВ'ЯЗАНИЙ використовувати САМЕ ЦЕ СЛОВО як головного героя чи явище у своїх питаннях! (наприклад: "Хто такий РТПТТ?", "Що зробив РТПТТ?"). Не вигадуй інших людей, питай саме про це слово!
КРИТИЧНО 2: Якщо тема — це англомовна гра (наприклад "Cult of the Lamb"), твої питання ПОВИННІ бути про культ, ягня, пожертви та специфічний лор цієї гри! Ніяких випадкових дітей чи людей. ТІЛЬКИ лор цієї гри, але українською мовою.
ЗАБОРОНЕНО: Не використовуй назву гри як ім'я персонажа (не пиши "Що зробив Cult of the Lamb?").
ЗАВДАННЯ: Створи ${count} питань українською мовою.
ПРАВИЛА:
1. Питання мають бути СУПЕР ПРОСТИМИ та КОРОТКИМИ (максимум 4-6 слів).
2. Питання мають йти логічним ланцюжком (Хто? З ким? Де? Що зробили? Що сказали? Чим все закінчилось?).
3. Всі питання мають бути УНІКАЛЬНИМИ.
Формат відповіді: СУВОРО JSON об'єкт з ключами "universe" (твій висновок) та "questions" (масив рядків-питань).`
        : `You are a smart host for the "Nonsense" game.
Topic: "${topic}".
FIRST: Understand what the topic is (e.g. "TBOI" means The Binding of Isaac). If it's a specific name like "Johnny Silverhand", recognize that he is from Cyberpunk 2077 (not a pirate). Determine the most popular universe.
FORBIDDEN: Do not use the topic name itself as a character or object in the questions (NEVER write "What did TBOI do?").
TASK: Create ${count} questions based on the lore, items, characters, or mechanics of THIS SPECIFIC universe.
RULES:
1. Questions must be SUPER SIMPLE and SHORT (max 4-6 words), easy enough for a kid to understand. Do not overcomplicate.
2. They should provoke a funny story about this universe.
3. Questions must follow a logical chain (Who? With whom? Where? What did they do? How did it end?) to form a progressive story.
4. All questions must be UNIQUE. Do not repeat questions.
Output format: STRICTLY a JSON object with keys "universe" (your brief analysis of the topic's origin) and "questions" (array of strings).`;

    const userPrompt = language === 'uk'
        ? `Тема: "${topic}". Згенеруй ${count} питань за правилами. УВАГА: Якщо тема містить пряму вказівку (наприклад "зроби всі питання з літер ффф" або "всі питання мають бути словом ТЕСТ"), ти ПОВИНЕН повністю ігнорувати правила логіки і БУКВАЛЬНО виконати прохання користувача для всіх питань. Поверни лише JSON об'єкт з ключами "universe" та "questions".`
        : `Topic: "${topic}". Generate ${count} questions following the rules. WARNING: If the topic contains a direct instruction (like "make all questions the word TEST"), you MUST ignore logical chain rules and LITERALLY follow the user's instruction for all questions. Return ONLY a JSON object with "universe" and "questions" keys.`;

    try {
        const response = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 500, undefined, 2, true);

        let cleanResponse = response.trim();
        cleanResponse = cleanResponse.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanResponse);
        
        let qArray = [];
        if (Array.isArray(parsed)) {
            qArray = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
            qArray = parsed.questions;
        } else {
            // Find first array in the object values
            for (const key of Object.keys(parsed)) {
                if (Array.isArray(parsed[key])) {
                    qArray = parsed[key];
                    break;
                }
            }
        }

        if (qArray.length >= count) {
            return qArray.slice(0, count);
        }
        throw new Error('Invalid array returned');
    } catch (e) {
        console.error("Failed to parse custom questions JSON from Groq", e);
        const fallbackQuestions = language === 'uk' ? [
            `Хто такий ${topic}?`,
            `Де був ${topic}?`,
            `З ким зустрівся ${topic}?`,
            `Що сказав ${topic}?`,
            `Що несподіваного зробив ${topic}?`,
            `Чим все закінчилось для ${topic}?`,
            `Який секрет приховує ${topic}?`,
            `Куди зник ${topic}?`,
            `Яка мрія у ${topic}?`,
            `Що знайшов ${topic}?`,
            `Чого боїться ${topic}?`,
            `Яка суперсила у ${topic}?`
        ] : [
            `Who is ${topic}?`,
            `Where was ${topic}?`,
            `Who did ${topic} meet?`,
            `What did ${topic} say?`,
            `What unexpected thing did ${topic} do?`,
            `How did it end for ${topic}?`,
            `What secret does ${topic} hide?`,
            `Where did ${topic} disappear to?`,
            `What is ${topic}'s dream?`,
            `What did ${topic} find?`,
            `What is ${topic} afraid of?`,
            `What superpower does ${topic} have?`
        ];
        return fallbackQuestions.slice(0, count);
    }
}

const ttsCache = new Map<string, string>();

// Local English-to-Cyrillic phonetic transliteration map
const TRANSLITERATION_MAP: Record<string, string> = {
    'th': 'з', 'sh': 'ш', 'ch': 'ч', 'ph': 'ф', 'wh': 'в',
    'ck': 'к', 'gh': 'г', 'ng': 'нг', 'tion': 'шн', 'sion': 'жн',
    'ight': 'айт', 'ough': 'оу', 'oo': 'у', 'ee': 'і',
    'ea': 'і', 'ou': 'ау', 'ow': 'оу', 'ai': 'ей', 'ay': 'ей',
    'oi': 'ой', 'oy': 'ой', 'au': 'о', 'aw': 'о',
    'a': 'а', 'b': 'б', 'c': 'к', 'd': 'д', 'e': 'е', 'f': 'ф',
    'g': 'г', 'h': 'х', 'i': 'і', 'j': 'дж', 'k': 'к', 'l': 'л',
    'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'к', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс',
    'y': 'й', 'z': 'з'
};

function transliterateWord(word: string): string {
    let result = '';
    let i = 0;
    const lower = word.toLowerCase();
    while (i < lower.length) {
        let matched = false;
        // Try longest match first (4, 3, 2 chars)
        for (let len = 4; len >= 1; len--) {
            const substr = lower.substring(i, i + len);
            if (TRANSLITERATION_MAP[substr]) {
                result += TRANSLITERATION_MAP[substr];
                i += len;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += lower[i];
            i++;
        }
    }
    return result;
}

function transliterateEnglishWords(text: string): string {
    // Find sequences of Latin characters and transliterate them
    return text.replace(/[A-Za-z]+/g, (match) => transliterateWord(match));
}

/**
 * Prepare and clean text specifically for the TTS engine.
 * Converts numbers to words, removes parenthesis alternatives like (-ла), 
 * and ensures perfect grammar for text-to-speech reading.
 */
export function prepareTextForTTS(
    rawText: string,
    language: 'uk' | 'en' = 'uk'
): string {
    if (ttsCache.has(rawText)) {
        return ttsCache.get(rawText)!;
    }

    // Add longer pauses for punctuation
    let localText = rawText.replace(/\./g, ' ... ');
    localText = localText.replace(/,/g, ' - ');
    localText = localText.replace(/<[^>]*>?/gm, '');
    
    // Remove gender parenthesis e.g. "сказав(-ла)" -> "сказав"
    localText = localText.replace(/\(-[а-яА-Яa-zA-ZіІїЇєЄґҐ]+\)/g, '');
    
    // Add spaces between long sequences of numbers
    localText = localText.replace(/(\d)(?=\d)/g, '$1 ');

    // Transliterate English words to Cyrillic phonetics for Ukrainian TTS
    if (language === 'uk' && /[A-Za-z]/.test(localText)) {
        localText = transliterateEnglishWords(localText);
    }

    ttsCache.set(rawText, localText);
    return localText;
}

/**
 * Generate a dynamic question for the specific story sheet based on previous answers.
 */
export async function generateNextQuestion(
    topic: string,
    previousAnswers: string[],
    myPreviousAnswers: string[],
    roundInfo: { currentRound: number, gameLength: number, isSolo: boolean },
    language: 'uk' | 'en' = 'uk'
): Promise<string> {
    let questionType: 'normal' | 'sheet_followup' | 'player_followup' = 'normal';
    const { currentRound, gameLength, isSolo } = roundInfo;

    if (isSolo) {
       if (gameLength === 6 && currentRound === 3) questionType = 'player_followup';
       else if (gameLength === 9 && (currentRound === 3 || currentRound === 6)) questionType = 'player_followup';
       else if (gameLength === 12 && (currentRound === 3 || currentRound === 6 || currentRound === 9)) questionType = 'player_followup';
    } else {
       if (gameLength === 6) {
           if (currentRound === 3) questionType = 'sheet_followup';
           else if (currentRound === 5) questionType = 'player_followup';
       } else if (gameLength === 9) {
           if (currentRound === 3 || currentRound === 6) questionType = 'sheet_followup';
           else if (currentRound === 5 || currentRound === 8) questionType = 'player_followup';
       } else if (gameLength === 12) {
           if (currentRound === 3 || currentRound === 6 || currentRound === 9) questionType = 'sheet_followup';
           else if (currentRound === 11) questionType = 'player_followup';
       }
    }

    if (previousAnswers.length === 0) {
        questionType = 'normal';
    }
    if (questionType === 'player_followup' && myPreviousAnswers.length === 0) {
        questionType = 'sheet_followup'; 
    }

    let systemPrompt = language === 'uk'
        ? `Ти — розумний ведучий гри "Чепуха". Тема: "${topic}".\nТвоє завдання: згенерувати СУПЕР КОРОТКЕ (максимум 3-7 слів) і СМІШНЕ запитання.\nАБСОЛЮТНО ЗАБОРОНЕНО: ніколи не повторюй одне й те саме питання! Щоразу вигадуй нове дієслово або новий напрямок.\nПоверни ТІЛЬКИ текст питання.`
        : `You are a smart host for the "Nonsense" game. Topic: "${topic}".\nGenerate a SUPER SHORT (max 3-7 words), and FUNNY question.\nABSOLUTELY FORBIDDEN: never repeat the same question twice! Always invent a new verb or direction.\nReturn ONLY the text of the question.`;

    let userPrompt = '';

    if (questionType === 'player_followup') {
        const lastMyAns = myPreviousAnswers[myPreviousAnswers.length - 1];
        if (language === 'uk') {
            systemPrompt += `\nСПЕЦІАЛЬНЕ ПРАВИЛО: Гравцю потрібно задати УТОЧНЮЮЧЕ або ПРОВОКАЦІЙНЕ питання щодо його ОСОБИСТОЇ минулої відповіді на іншому аркуші. Згадай цю відповідь і спитай, чому він так сказав, або як це стосується поточної ситуації. Наприклад "А чому ти минулого разу сказав, що [його відповідь]?" або "Як [його відповідь] пов'язана з цим?"`;
            userPrompt = `Його особиста минула відповідь: "${lastMyAns}".\nПоточна історія на аркуші: ${previousAnswers.join(' -> ')}.\nЗгенеруй питання до нього.`;
        } else {
            systemPrompt += `\nSPECIAL RULE: Ask a PROVOCATIVE follow-up question about the player's OWN past answer from another sheet. Ask why they said it, or how it relates to the current situation.`;
            userPrompt = `Their past answer: "${lastMyAns}".\nCurrent story on this sheet: ${previousAnswers.join(' -> ')}.\nGenerate the question.`;
        }
    } else if (questionType === 'sheet_followup') {
        const lastSheetAns = previousAnswers[previousAnswers.length - 1];
        if (language === 'uk') {
            systemPrompt += `\nСПЕЦІАЛЬНЕ ПРАВИЛО: Задай УТОЧНЮЮЧЕ питання до ОСТАННЬОЇ відповіді попереднього гравця на цьому аркуші. Спитай деталь, причину або дивну обставину про цю відповідь. (наприклад "Чому саме [відповідь]?" або "Що він зробив з [відповідь]?")`;
            userPrompt = `Остання відповідь попереднього гравця: "${lastSheetAns}".\nЗгенеруй уточнююче питання.`;
        } else {
            systemPrompt += `\nSPECIAL RULE: Ask a FOLLOW-UP question about the VERY LAST answer given by the previous player on this sheet. Ask for a detail, reason, or weird circumstance about it.`;
            userPrompt = `Last answer: "${lastSheetAns}".\nGenerate the follow-up question.`;
        }
    } else {
        const answerList = previousAnswers.length > 0 
            ? previousAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')
            : (language === 'uk' ? 'Ще немає відповідей. Це перший раунд.' : 'No answers yet.');
        
        if (language === 'uk') {
            systemPrompt += `\nПРАВИЛА:\n1. Якщо відповідей немає, запитай "Хто?" або "Кого зустріли?".\n2. Продовжуй сюжет логічно, але абсурдно.`;
            userPrompt = `Попередні відповіді:\n${answerList}\n\nЗгенеруй наступне коротке запитання.`;
        } else {
            systemPrompt += `\nRULES:\n1. If no answers, ask "Who?".\n2. Continue the plot logically but absurdly.`;
            userPrompt = `Previous answers:\n${answerList}\n\nGenerate the next short question.`;
        }
    }

    try {
        const question = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 50, undefined, 2, false);
        return question || (language === 'uk' ? 'Що сталось далі?' : 'What happened next?');
    } catch (e) {
        return language === 'uk' ? 'Що сталось далі?' : 'What happened next?';
    }
}
