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
        ? `Ти — генератор ідеальних абсурдних історій для гри "Чепуха".
Твоя мета: створити зв'язний, дуже смішний текст, який об'єднує всі надані відповіді гравців.
УВАГА: Головна тематика історії — "${templateName}". Ти ПОВИНЕН використати цю тему як головний всесвіт або контекст історії (згадуй терміни, імена та події з цієї теми).
КРИТИЧНА ВИМОГА: Ти ЗОБОВ'ЯЗАНИЙ виправляти граматику, відмінки, роди та числа у відповідях гравців! Слова гравців не повинні стирчати криво. Змінюй закінчення слів так, щоб історія читалася як ідеальний літературний твір.
ПЕРЕКЛАД: Якщо будь-які відповіді гравців написані іншими мовами (наприклад, російською чи англійською), ти ПОВИНЕН автоматично перекласти їх на УКРАЇНСЬКУ мову під час формування історії. Вся історія повинна бути виключно українською.
Пиши лише текст оповідання, без жодних вступів чи форматування. Лише суцільний текст українською мовою.`
        : `You are the ultimate generator of absurd stories for the game "Chepuha".
Your goal: create a coherent, very funny text that unites all provided player answers.
ATTENTION: The main theme of the story is "${templateName}". You MUST use this theme as the core universe or context of the story (mention terms, names, and events from this theme).
CRITICAL REQUIREMENT: You MUST fix the grammar, cases, and plurals in the players' answers! Change the word endings so they fit organically and grammatically perfect into the sentences.
TRANSLATION: If any player answers are written in other languages (for example, Russian or Ukrainian), you MUST automatically translate them to ENGLISH while writing the story. The entire story must be exclusively in English.
Write ONLY the story text, with no introductions or formatting. Just plain text in English.`;

    const userPrompt = language === 'uk'
        ? `Напиши коротку, динамічну історію (5-8 речень) з цих відповідей:\n${answerList}\n\nІсторія має бути веселою, абсурдною, з несподіваною кінцівкою. Не забувай виправляти відмінки у відповідях!`
        : `Write a short, dynamic story (5-8 sentences) using these answers:\n${answerList}\n\nThe story must be funny, absurd, with an unexpected ending. Do not forget to fix grammatical cases in the answers!`;

    return await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], 1500, seed, 2, false);
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
    ], 3500, seed, 2, false);

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
СПОЧАТКУ: Зрозумій, що це за тема (наприклад, "TBOI" — це гра The Binding of Isaac, "Mewgenics" — гра про котів-мутантів). Якщо це ім'я (наприклад, "Johnny Silverhand"), обов'язково розпізнай, з якого він всесвіту (Cyberpunk 2077, а не пірати чи інше). Визнач найбільш логічний та популярний всесвіт.
ЗАБОРОНЕНО: Не використовуй саму назву теми як об'єкт чи ім'я персонажа у питаннях (НІКОЛИ не пиши "Що зробив TBOI?" або "Який торт купив TBOI?").
ЗАВДАННЯ: Створи ${count} питань українською мовою, які базуються на лорі, предметах, персонажах чи механіках САМЕ ЦЬОГО розпізнаного всесвіту.
ПРАВИЛА:
1. Питання мають бути СУПЕР ПРОСТИМИ та КОРОТКИМИ (максимум 4-6 слів), зрозумілими навіть дитині. Не ускладнюй.
2. Вони мають провокувати смішну історію про цей всесвіт.
3. Питання мають йти логічним ланцюжком (Хто? З ким? Де? Що зробили? Що сказали? Чим все закінчилось?), щоб історія плавно розвивалась.
4. Всі питання мають бути УНІКАЛЬНИМИ. Не повторюйся.
Формат відповіді: СУВОРО JSON об'єкт з ключами "universe" (твій короткий висновок, звідки ця тема) та "questions" (масив рядків-питань).`
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
        // Fallbacks
        return Array(count).fill(language === 'uk' ? `Що сталось у світі ${topic}?` : `What happened in ${topic}?`);
    }
}

const ttsCache = new Map<string, Promise<string>>();

/**
 * Prepare and clean text specifically for the TTS engine.
 * Converts numbers to words, removes parenthesis alternatives like (-ла), 
 * and ensures perfect grammar for text-to-speech reading.
 */
export function prepareTextForTTS(
    rawText: string,
    language: 'uk' | 'en' = 'uk'
): Promise<string> {
    // Add longer pauses for punctuation
    let localText = rawText.replace(/\./g, ' ... ');
    localText = localText.replace(/,/g, ' - ');
    localText = localText.replace(/<[^>]*>?/gm, ''); // remove HTML tags
    
    // Remove gender parenthesis e.g. "сказав(-ла)" -> "сказав"
    localText = localText.replace(/\(-[а-яА-Яa-zA-ZіІїЇєЄґҐ]+\)/g, '');
    
    // Add spaces between long sequences of numbers so the TTS doesn't read it as billions
    // For example "1111111" -> "1 1 1 1 1 1 1"
    localText = localText.replace(/(\d)(?=\d)/g, '$1 ');

    return Promise.resolve(localText);
}

/**
 * Generate a dynamic question for the specific story sheet based on previous answers.
 */
export async function generateNextQuestion(
    topic: string,
    previousAnswers: string[],
    language: 'uk' | 'en' = 'uk'
): Promise<string> {
    const systemPrompt = language === 'uk'
        ? `Ти — розумний ведучий гри "Чепуха". Тема: "${topic}".
Тобі дадуть список попередніх відповідей для конкретної історії.
Твоє завдання: згенерувати ЛОГІЧНЕ, СУПЕР КОРОТКЕ (максимум 3-5 слів) і СМІШНЕ наступне запитання, яке буде продовжувати сюжет.
ПРАВИЛА:
1. Якщо відповідей немає, запитай "Хто?" або "Кого зустріли?".
2. Якщо є "Хто" і "З ким", запитай "Де вони були?".
3. Орієнтуйся на контекст!
Поверни ТІЛЬКИ текст питання.`
        : `You are a smart host for the "Nonsense" game. Topic: "${topic}".
Generate a LOGICAL, SUPER SHORT (max 3-5 words), and FUNNY next question that continues the plot of these specific answers.
Return ONLY the text of the question.`;

    const answerList = previousAnswers.length > 0 
        ? previousAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n')
        : (language === 'uk' ? 'Ще немає відповідей. Це перший раунд.' : 'No answers yet.');

    const userPrompt = language === 'uk'
        ? `Попередні відповіді:\n${answerList}\n\nЗгенеруй наступне коротке запитання.`
        : `Previous answers:\n${answerList}\n\nGenerate the next short question.`;

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
