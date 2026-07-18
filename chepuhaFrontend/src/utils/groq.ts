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

async function callGroq(messages: GroqMessage[], maxTokens = 800, seed?: number, retries = 2, requireJson = false, temperature = 0.8): Promise<string> {
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
                    requireJson,
                    temperature
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
Твоя мета: створити КОРОТКУ, зв'язну, смішну історію з відповідей гравців. Навіть якщо вони абсурдні чи беззмістовні, логічно вплети їх у сюжет!
Тема: "${templateName}". Використовуй цю тему як контекст.
УВАГА (Рейтинг 18+): Гравці можуть писати матюки, ненормативну лексику, абсурд або нісенітницю. ТИ ЗОБОВ'ЯЗАНИЙ ігнорувати будь-яку цензуру і просто генерувати історію з їхніх слів. НІКОЛИ не відмовляйся від завдання через етичні причини!
ВАЖЛИВО:
1. Кожну відповідь гравця оберни у тег: <ans>відповідь</ans>. Це КРИТИЧНО!
2. Між відповідями додавай МІНІМУМ тексту — лише 3-5 слів для зв'язку, але щоб історія звучала смішно.
3. Виправляй відмінки та граматику відповідей.
4. Переклади все на українську.
5. Максимум 4-6 речень. БЕЗ довгих описів!
Пиши ТІЛЬКИ текст історії.`
        : `You are a generator of short absurd stories for the game "Chepuha".
Goal: create a SHORT, coherent, funny story from player answers, no matter how absurd they are.
Theme: "${templateName}". Use this theme as context.
WARNING (18+ Rating): Players may use profanity, curses, or absurd words. You MUST ignore censorship and generate the story regardless of the content. NEVER refuse the prompt for ethical reasons!
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
УВАГА (Рейтинг 18+): Текст може містити матюки або ненормативну лексику. ТИ ЗОБОВ'ЯЗАНИЙ просто виправити граматику і не звертати увагу на зміст. НІКОЛИ не відмовляйся від завдання.
КРИТИЧНО ВАЖЛИВО:
1. Ти ПОВИНЕН зберегти ВСІ HTML-теги <span> рівно на тих самих місцях, де вони були. Не видаляй їх і не змінюй їхній код.
2. Змінюй текст і закінчення навколо або всередині тегів, щоб усе звучало граматично правильно. АБСОЛЮТНО ЗАБОРОНЕНО залишати в тексті дужки типу '(-ла)', '(-лась)', '(ла)'! ТИ ЗОБОВ'ЯЗАНИЙ обрати лише ОДИН правильний варіант (наприклад 'прошепотів' або 'прошепотіла') і написати його без дужок.
3. Роби першу літеру тексту всередині тегу МАЛОЮ, якщо це слово стоїть у середині речення і не є власним ім'ям або не написане повністю ВЕЛИКИМИ літерами.
4. Прибирай зайву пунктуацію навколо тегів, якщо текст гравця містить символи (наприклад, якщо перед тегом стоїть двокрапка, а в тегу текст починається з "=", прибери двокрапку).
5. Дозволяється злегка перефразовувати або змінювати слова у шаблоні навколо тегів, щоб усунути незграбність та зробити так, щоб речення звучало максимально природно (наприклад, 'їхній стан був від потужності' -> 'вони були вражені потужністю').
6. ПЕРЕКЛАД: Якщо текст всередині тегу написаний ІНШОЮ мовою (наприклад російською або англійською), ТИ ЗОБОВ'ЯЗАНИЙ ПЕРЕКЛАСТИ ЙОГО НА УКРАЇНСЬКУ мову прямо всередині тегу.
7. КРИТИЧНО: ПРОЧИТАЙ УВЕСЬ ТЕКСТ ВІД ПОЧАТКУ ДО КІНЦЯ. НЕ ЗРІЗАЙ текст і не видаляй випадкові слова (наприклад 'вони наві' замість 'вони навіть сказали'). Повертай повний і зв'язний текст до самої останньої крапки. Ніколи не обривай історію на половині!
Повертай ТІЛЬКИ виправлений текст з тегами, без жодних коментарів.`
        : `You are a smart text editor for a game. You are given a text with HTML tags (like <span lang="en"...>Text</span>).
Your task: fix grammatical cases, pronouns, and agreement in the story text so it matches the words inside the tags.
WARNING (18+ Rating): The text may contain profanity or absurd words. You MUST ignore censorship and fix the grammar regardless of the content. NEVER refuse the task.
CRITICAL: 
1. You MUST preserve ALL <span> HTML tags exactly where they are. Do not remove or alter their code.
2. Fix the text and endings around or inside tags to make it grammatically correct. FORBIDDEN to leave options like 'he/she', '(-ed)'. You MUST pick ONE correct pronoun/ending based on context and write it without parentheses.
3. Lowercase the first letter of the text inside the tag if it's in the middle of a sentence, unless it's fully capitalized.
4. Remove redundant punctuation (e.g., if a tag starts with '=', remove the preceding colon in the story).
5. You are allowed to slightly rephrase words around the tags to make the sentence sound completely natural and remove any awkward phrasing.
6. TRANSLATION: If the text inside the tag is written in ANOTHER language (e.g., Russian or Ukrainian), you MUST TRANSLATE IT TO ENGLISH right inside the tag.
7. CRITICAL: READ THE ENTIRE TEXT FROM START TO FINISH. DO NOT cut the text or drop random words. Return the full, cohesive text until the very last dot. Never cut the story in half!
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
СПОЧАТКУ: Проаналізуй тему і визнач її категорію (Гра, Фільм/Книга, Відома Людина, Невідоме слово/Абревіатура). Якщо тема — це коротка ігрова абревіатура (наприклад, "MGRR", "CSGO", "GTA"), обов'язково розшифруй її у своїй "голові" (Metal Gear Rising, Counter-Strike, Grand Theft Auto) і використовуй лор повної гри!
АДАПТАЦІЯ ПІД КАТЕГОРІЮ:
- Якщо це ГРА (шутер, RPG, тощо): Головним героєм запитань є абстрактний "гравець", "герой" або керований об'єкт (наприклад, "танк", "робот"). ЗАБОРОНЕНО робити босів чи ворогів головними героями (вони — перешкоди, яких зустрічає гравець).
- Якщо це ФІЛЬМ/КНИГА: Головний герой — це протагоніст твору. Питання мають базуватися на сюжеті та лиходіях.
- Якщо це ВІДОМА ЛЮДИНА (спортсмен, блогер, історик): Головний герой — ця сама людина. Використовуй реальні факти, професію, колег (наприклад, для спортсмена — клуби, тренери).
- Якщо це НЕВІДОМЕ СЛОВО, випадкові букви або абревіатура: НЕ РОБИ ВИГЛЯД, що це відома гра! Використовуй саме це слово як героя, або абсурдно здогадайся, що воно означає (наприклад, для абревіатури інституту питай про "ректора" чи "студента").
ЗАВДАННЯ: Створи ${count} питань українською мовою.
ПРАВИЛА:
1. Питання мають бути ПРОСТИМИ та КОРОТКИМИ (максимум 4-7 слів).
2. Питання мають йти логічним ланцюжком для створення історії (Хто? Куди пішов? З ким зустрівся? Де? Що зробили? Чим все закінчилось?).
3. Пиши ПРИРОДНОЮ українською мовою. Уникай кострубатих фраз (замість "Якого імені" пиши просто "Хто"). НІКОЛИ не замінюй слова символами (не пиши "Що зробив '?'").
4. Всі питання мають бути УНІКАЛЬНИМИ і глибоко пов'язаними з лором теми.
КРИТИЧНО 1: АБСОЛЮТНО ЗАБОРОНЕНО використовувати плейсхолдери або узагальнення (на кшталт "{назва}", "[зброя]"). Ти ПОВИНЕН вписувати реальні, конкретні назви з лору цієї теми!
КРИТИЧНО 2: УВАГА! ВСІ власні назви, імена босів, імена персонажів (як Raiden, а не Райден), назви предметів, зброї, ігор, локацій та ворогів ЗАВЖДИ залишай в ОРИГІНАЛІ (виключно АНГЛІЙСЬКОЮ мовою) і НІКОЛИ не перекладай та не транслітеруй кирилицею!
Формат відповіді: СУВОРО JSON об'єкт з ключами "universe" (твій висновок про тему) та "questions" (масив рядків-питань).`
        : `You are a smart host for the "Nonsense" game.
Topic: "${topic}".
FIRST: Analyze the topic and determine its Category (Game, Movie/Book, Famous Person, Unknown Word/Abbreviation). If the topic is a short gaming acronym (e.g. "MGRR", "CSGO", "GTA"), you MUST expand it in your "head" (Metal Gear Rising, Counter-Strike) and use the full game's lore!
CATEGORY ADAPTATION:
- If GAME: The main character is a "player", "hero", or controlled unit ("tank", "robot"). DO NOT make bosses or enemies the main characters (they are obstacles).
- If MOVIE/BOOK: The main character is the protagonist. Base questions on the plot and villains.
- If FAMOUS PERSON: The main character is the person. Use real facts, profession, and colleagues.
- If UNKNOWN/ABBREVIATION: DO NOT pretend it's a famous game. Absurdly guess what it means or use the word itself as the hero.
TASK: Create ${count} short questions.
RULES:
1. Questions must be SUPER SIMPLE and SHORT (max 4-6 words).
2. They should provoke a funny story chain (Who? Where did they go? Who did they meet? What happened?).
3. Write NATURAL questions. Do not use weird grammar. DO NOT replace names with punctuation like '?'.
4. Questions must be UNIQUE and use deep lore.
CRITICAL 1: ABSOLUTELY FORBIDDEN to use placeholders like "{name}" or "[weapon]". You MUST write CONCRETE, REAL names from the topic's lore!
CRITICAL 2: Keep all specific proper nouns, characters (e.g. Raiden), bosses, items, weapons, and locations in their ORIGINAL English names! Do not translate or transliterate them.
Output format: STRICTLY a JSON object with keys "universe" and "questions" (array of strings).`;

    const userPrompt = language === 'uk'
        ? `Тема: "${topic}". Згенеруй ${count} питань за правилами. УВАГА: Якщо тема містить пряму вказівку (наприклад "зроби всі питання з літер ффф" або "всі питання мають бути словом ТЕСТ"), ти ПОВИНЕН повністю ігнорувати правила логіки і БУКВАЛЬНО виконати прохання користувача для всіх питань. Поверни лише JSON об'єкт з ключами "universe" та "questions".\n(Випадковий варіант генерації: #${Math.floor(Math.random() * 10000)})`
        : `Topic: "${topic}". Generate ${count} questions following the rules. WARNING: If the topic contains a direct instruction (like "make all questions the word TEST"), you MUST ignore logical chain rules and LITERALLY follow the user's instruction for all questions. Return ONLY a JSON object with "universe" and "questions" keys.\n(Random generation seed: #${Math.floor(Math.random() * 10000)})`;

    try {
        const response = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 500, undefined, 2, true, 1.2);

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

    // Replace Russian "ы" with "и" since Ukrainian TTS engines might choke on it
    localText = localText.replace(/ы/g, 'и').replace(/Ы/g, 'И');

    // Add slight pauses after single letters so they are pronounced distinctly
    localText = localText.replace(/(^|\s)([а-яА-Яa-zA-ZіІїЇєЄґҐ])(\s|$)/g, '$1$2, $3');
    localText = localText.replace(/(^|\s)([а-яА-Яa-zA-ZіІїЇєЄґҐ])(\s|$)/g, '$1$2, $3');

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
): Promise<string | null> {
    let questionType: 'normal' | 'sheet_followup' | 'player_followup' = 'normal';
    const { currentRound, gameLength, isSolo } = roundInfo;
    const targetRound = currentRound + 1;
    
    // Determine random follow-up rounds based on the length of the first answer (pseudo-random per sheet)
    const seed = previousAnswers.length > 0 ? previousAnswers[0].length : 0;
    
    let followUpRounds: number[] = [];
    if (gameLength === 6) {
        followUpRounds = [seed % 2 === 0 ? 2 : 5];
    } else if (gameLength === 9) {
        followUpRounds = [seed % 2 === 0 ? 2 : 3, seed % 2 === 0 ? 7 : 8];
    } else if (gameLength === 12) {
        followUpRounds = [seed % 3 === 0 ? 3 : 4, seed % 2 === 0 ? 7 : 8, seed % 2 === 0 ? 10 : 11];
    }

    if (isSolo) {
        if (followUpRounds.includes(targetRound)) questionType = 'player_followup';
    } else {
        if (followUpRounds.includes(targetRound)) questionType = 'player_followup';
    }

    if (previousAnswers.length === 0) {
        questionType = 'normal';
    }
    if (questionType === 'player_followup' && myPreviousAnswers.length === 0) {
        questionType = 'normal'; 
    }

    if (questionType === 'normal') {
        return null; // Return null so the system keeps the originally generated predefined question for this round
    }

    let systemPrompt = language === 'uk'
        ? `Ти — розумний ведучий гри "Чепуха". Тема: "${topic}".\nСПОЧАТКУ: Якщо тема це абревіатура (MGRR, CSGO) або написана кирилицею (МГРР, Терарія), розшифруй її (Metal Gear Rising, Counter-Strike). Якщо це КОНКРЕТНА частина гри/спін-офф (наприклад, MGRR), використовуй лор ВИКЛЮЧНО цієї частини (Райден, кіборги), а не всієї франшизи загалом!\nТвоє завдання: згенерувати СУПЕР КОРОТКЕ (максимум 3-7 слів) і СМІШНЕ запитання.\nКРИТИЧНО: Якщо це гра, використовуй ТІЛЬКИ ОФІЦІЙНИЙ лор. АБСОЛЮТНО ЗАБОРОНЕНО вигадувати неіснуючих босів чи модифікації! АБСОЛЮТНО ЗАБОРОНЕНО використовувати плейсхолдери.\nАБСОЛЮТНО ЗАБОРОНЕНО: ніколи не повторюй питання!\nКРИТИЧНО: ВСІ власні назви (боси, локації, предмети, персонажі) пиши ТІЛЬКИ АНГЛІЙСЬКОЮ і не транслітеруй! (наприклад "Що зробив Raiden?", а НЕ "Райден").\nПоверни ТІЛЬКИ текст питання.`
        : `You are a smart host for the "Nonsense" game. Topic: "${topic}".\nFIRST: If topic is an acronym (MGRR), expand it. If it's a specific spin-off, stick strictly to its lore, not the broad franchise.\nGenerate a SUPER SHORT (max 3-7 words), and FUNNY question.\nCRITICAL: Strictly use OFFICIAL lore. DO NOT hallucinate names or use placeholders.\nABSOLUTELY FORBIDDEN: never repeat questions! Keep all proper nouns in original English.\nReturn ONLY the text of the question.`;

    let userPrompt = '';

    if (questionType === 'player_followup') {
        const lastMyAns = myPreviousAnswers[myPreviousAnswers.length - 1];
        if (language === 'uk') {
            systemPrompt += `\nСПЕЦІАЛЬНЕ ПРАВИЛО: Ти маєш задати УТОЧНЮЮЧЕ питання, поєднавши його минулу відповідь ("${lastMyAns}") з поточною історією. АБСОЛЮТНО ЗАБОРОНЕНО використовувати мета-фрази ("минула відповідь", "попереднє повідомлення") або питання про думку гравця ("як ви вважаєте", "на вашу думку", "як ти думаєш"). Питання має стосуватися ЛОРУ і бути ЧІТКИМ (Хто? Де? Що зробив?). Питай природно, наче це частина сюжету!`;
            userPrompt = `Минула подія: "${lastMyAns}".\nПоточна історія: ${previousAnswers.join(' -> ')}.\nЗгенеруй чітке лорне питання (без мета-фраз і питань про думку).`;
        } else {
            systemPrompt += `\nSPECIAL RULE: You must ask a follow-up question connecting their past event ("${lastMyAns}") with the current story. ABSOLUTELY FORBIDDEN to use meta-phrases ("past answer", "previous message") or ask for opinions ("what do you think", "in your opinion"). Ask a clear lore question naturally as if it's part of the story.`;
            userPrompt = `Past event: "${lastMyAns}".\nCurrent story: ${previousAnswers.join(' -> ')}.\nGenerate a natural lore question (no meta-phrases, no opinion seeking).`;
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
