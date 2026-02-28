import { QuestionType } from "../api";
export interface StoryTemplate {
    id: string;
    name: string;
    description: string;
    questions: string[];
    questionTypes: QuestionType[];
    fallbacks: string[][];
    buildStory: (answers: string[], lang?: string, globalSeed?: string, localSeed?: string) => string;
}
export const TEMPLATES: Record<string, StoryTemplate> = {
    classic: {
        id: "classic",
        name: "classic",
        description: "classic theme",
        questions: [
            "Q_CLASSIC_0",
            "Q_CLASSIC_1",
            "Q_CLASSIC_2",
            "Q_CLASSIC_3",
            "Q_CLASSIC_4",
            "Q_CLASSIC_5",
            "Q_CLASSIC_6",
            "Q_CLASSIC_7",
            "Q_CLASSIC_8",
            "Q_CLASSIC_9",
            "Q_CLASSIC_10",
            "Q_CLASSIC_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Баба Яга', 'Олег', 'Шрек', 'Дедпул'], ['з пінгвіном', 'зі своїм двійником', 'з зомбі'], ['на Місяці', 'в АТБ', 'в кратері вулкана'], ['о 3 ночі', 'у 2077 році', 'на Хелловін'], ['вирішували інтеграли', 'пекли піцу', 'літали'], ['дуже розгублено', 'мов два детективи', 'геть без слів'], ['Це нормально!', 'Ніхто не очікував!', 'Просто бізнес'], ['Прийнято!', 'Давай ще раз?', 'Ок, ок...'], ['що це норма', 'що треба викликати поліцію'], ['усі розійшлися по домівках', 'хтось замовив піцу'], ['машину часу з GPS', 'рецепт від нудьги'], ['дружба вирішує все', 'добро повертається']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `Once upon a time ${a(0)} met ${a(1)} ${a(2)}. It happened ${a(3)}, and it turned out that they ${a(4)}. They felt: ${a(5)}. Suddenly ${a(0)} said: «${a(6)}». To which ${a(1)} confidently replied: «${a(7)}». People around watched silently and thought: ${a(8)}. But eventually ${a(9)}. In the end they came up with: ${a(10)}. The moral of the story: ${a(11)}.` :
                    v === 1 ? `It was time for an epic rap battle! ${a(0)} stepped on stage against ${a(1)} ${a(2)}. It all started ${a(3)}, when they first ${a(4)}. They were overwhelmed with feeling: ${a(5)}. Round one! ${a(0)} dropped the punchline: «${a(6)}». But ${a(1)} countered: «${a(7)}». The crowd screamed and thought: ${a(8)}. In the finale ${a(9)}, proudly displaying ${a(10)}. The moral of this battle: ${a(11)}.` :
                        v === 2 ? `It was a typical alien abduction. ${a(0)} woke up on a spaceship next to ${a(1)} ${a(2)}. It occurred ${a(3)}, and trying to survive, they ${a(4)}. They felt cosmic horror: ${a(5)}. Pressing a button, ${a(0)} yelled: «${a(6)}». The alien AI replied: «${a(7)}». The galactic council thought: ${a(8)}. After a hyperspace jump ${a(9)}. As a souvenir they engineered ${a(10)}. Universal moral: ${a(11)}.` :
                            `A dramatic soap opera moment. ${a(0)} looking deeply into the eyes of ${a(1)} ${a(2)}, shed a tear. It was ${a(3)} when they suddenly ${a(4)}. Their heart pounded from: ${a(5)}. Turning away, ${a(0)} sighed: «${a(6)}». But ${a(1)} snapped back: «${a(7)}». The TV audience thought: ${a(8)}. On the 400th episode ${a(9)}, burying ${a(10)}. Moral: ${a(11)}.`;
            }
            return v === 0 ? `Одного разу ${a(0)} зустрівся ${a(1)} ${a(2)}. Це відбулося ${a(3)}, і, як з'ясувалося, там вони ${a(4)}. При цьому вони почувалися: ${a(5)}. Зненацька ${a(0)} видав(-ла): «${a(6)}». На що ${a(1)} впевнено відповів(-ла): «${a(7)}». Оточуючі мовчки за цим спостерігали і подумали: ${a(8)}. Але зрештою ${a(9)}. Наостанок вони придумали: ${a(10)}. Мораль цієї історії: ${a(11)}.` :
                v === 1 ? `Настав час епічного реп-батлу! На сцену вийшов ${a(0)}, щоб битися ${a(1)} ${a(2)}. Все почалося ${a(3)}, і першим ділом вони ${a(4)}. Їх переповнювало відчуття: ${a(5)}. Раунд перший! ${a(0)} видає панчлайн: «${a(6)}». Але ${a(1)} контратакує: «${a(7)}». Натовп просто кричав і думав: ${a(8)}. У фіналі ${a(9)}, після чого вони гордо продемонстрували ${a(10)}. Мораль цього батлу: ${a(11)}.` :
                    v === 2 ? `Це було звичайне викрадення прибульцями. ${a(0)} опинився на космічному кораблі ${a(1)} ${a(2)}. Це сталося ${a(3)}, і щоб вижити, вони ${a(4)}. Вони відчували космічний стан: ${a(5)}. ${a(0)} натиснув на пульт і крикнув: «${a(6)}». Іншопланетний комп'ютер відповів: «${a(7)}». Галактична рада подумала: ${a(8)}. Після стрибка у гіперпростір ${a(9)}. В якості сувеніра вони розробили ${a(10)}. Всесвітня мораль: ${a(11)}.` :
                        `Драматичний момент у стилі мильної опери. ${a(0)} дивлячись у вічі ${a(1)} ${a(2)}, пустив(-ла) сльозу. Було ${a(3)}, коли вони раптом ${a(4)}. Їхнє серце калатало від: ${a(5)}. Обернувшись, ${a(0)} зітхнув: «${a(6)}». Але ${a(1)} відрізав: «${a(7)}». Глядачі біля екранів подумали: ${a(8)}. На 400-й серії ${a(9)}, ховаючи ${a(10)}. Мораль: ${a(11)}.`;
        }
    },
    new_year: {
        id: "new_year",
        name: "new_year",
        description: "new_year theme",
        questions: [
            "Q_NEW_YEAR_0",
            "Q_NEW_YEAR_1",
            "Q_NEW_YEAR_2",
            "Q_NEW_YEAR_3",
            "Q_NEW_YEAR_4",
            "Q_NEW_YEAR_5",
            "Q_NEW_YEAR_6",
            "Q_NEW_YEAR_7",
            "Q_NEW_YEAR_8",
            "Q_NEW_YEAR_9",
            "Q_NEW_YEAR_10",
            "Q_NEW_YEAR_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Сніговик-морквоїд', 'Грінч', 'Олень Рудольф', 'Ельф'], ['з Лускунчиком', 'зі Сніговою Королевою', 'з танцюючим пінгвіном'], ['на верхівці ялинки', 'в холодильнику', 'в заметах'], ['о 23:59:59', 'як тільки випав перший сніг', 'о 2 ночі'], ['останню мандаринку', 'пульт від телевізора', 'ключі від саней'], ["радісно, але трішки п'яно", 'повні різдвяного настрою'], ['А де мій подарунок?!', 'Наливайте ще!'], ['Хо-хо-хо... ік!', 'Я на пенсії!', 'Пишіть листи!'], ['що це новорічне шоу', 'що вже почалося 2 січня'], ['усі заснули лицем в салат', 'почався новорічний салют'], ["відро олів'є", 'сани, що не їдуть'], ['За мир і злагоду!', 'Щоб ялинка стояла до травня!']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `The holiday started when ${a(0)} and ${a(1)} met ${a(2)}, right at ${a(3)}. They deeply searched for ${a(4)}, and their mood was: ${a(5)}. Suddenly ${a(0)} said during a toast: «${a(6)}». Santa Claus from the bushes strictly replied: «${a(7)}». The guests exchanged glances and thought: ${a(8)}. But the New Year's magic took its course, and eventually ${a(9)}. Under the tree they found gifts for each other: ${a(10)}. And their main toast became: «${a(11)}». That's a real Miracle!` :
                    v === 1 ? `It was a disaster! Santa was taken hostage. ${a(0)} and elite agent ${a(1)} landed ${a(2)}. The clock struck ${a(3)} when they started searching for ${a(4)}. The situation heated up, they felt: ${a(5)}. Storming the doors, ${a(0)} shouted: «${a(6)}». The gang leader yelled back: «${a(7)}». The hostages in shock thought: ${a(8)}. A confetti grenade exploded, and ${a(9)}. They rewarded each other with ${a(10)}. Law of the jungle: ${a(11)}.` :
                        v === 2 ? `Reindeer rebellion! At the HQ, ${a(0)} meets ${a(1)} ${a(2)}. It happened ${a(3)}. Everyone rushed to find ${a(4)}, and their state was: ${a(5)}. From the roof, ${a(0)} declared a manifesto: «${a(6)}». Rudolph angrily growled: «${a(7)}». The striking elves thought: ${a(8)}. Eventually the union won and ${a(9)}. Everyone got a bonus consisting of ${a(10)}. New labor law: ${a(11)}.` :
                            `The magic went crazy, and everyone turned into snowmen. ${a(0)} and snow-woman ${a(1)} rolled ${a(2)}. During the magic hour (${a(3)}) they hopelessly searched for ${a(4)}. They felt like ice: ${a(5)}. Melting in the sun, ${a(0)} whispered: «${a(6)}». An angry walrus replied: «${a(7)}». Passersby with shovels thought: ${a(8)}. By spring everyone melted and ${a(9)}. Only ${a(10)} remained. Philosophy of snow: ${a(11)}.`;
            }
            return v === 0 ? `Свято почалося, коли ${a(0)} та ${a(1)} зустрілися ${a(2)}, рівно ${a(3)}. Вони дуже довго шукали ${a(4)}, і їхній настрій був: ${a(5)}. Раптом ${a(0)} сказав(-ла) під час тосту: «${a(6)}». Дід Мороз із кущів суворо відповів: «${a(7)}». Гості перезирнулися і подумали: ${a(8)}. Але новорічна магія взяла своє, і зрештою ${a(9)}. Під ялинкою вони знайшли подарунки один одному: ${a(10)}. А їхнім головним тостом стало: «${a(11)}». Ось таке диво!` :
                v === 1 ? `Це був провал! Санту взяли в заручники. ${a(0)} та елітний спецназівець ${a(1)} висадилися ${a(2)}. На годиннику було ${a(3)}, коли вони почали шукати ${a(4)}. Ситуація нагрівалася, вони почувалися: ${a(5)}. Штурмуючи двері, ${a(0)} вигукнув: «${a(6)}». Ватажок банди закричав: «${a(7)}». Заручники в шоці подумали: ${a(8)}. Граната вибухнула конфетті, і ${a(9)}. Вони нагородили одне одного ${a(10)}. Закон джунглів: ${a(11)}.` :
                    v === 2 ? `Олені підняли повстання! У штабі ${a(0)} зустрічає ${a(1)} ${a(2)}. Це сталося ${a(3)}. Всі кинулися шукати ${a(4)}, і їхній стан був: ${a(5)}. З даху ${a(0)} оголосив маніфест: «${a(6)}». Рудольф сердито прогарчав: «${a(7)}». Ельфи, що страйкували, подумали: ${a(8)}. Зрештою профспілка перемогла і ${a(9)}. Всім видали премії у вигляді ${a(10)}. Новий закон праці: ${a(11)}.` :
                        `Магія зійшла з розуму, і всі перетворилися на сніговиків. ${a(0)} та снігова баба ${a(1)} скотилися ${a(2)}. У час магії (${a(3)}) вони безнадійно шукали ${a(4)}. Почувалися вони як лід: ${a(5)}. Розтанувши на сонці, ${a(0)} шепнув: «${a(6)}». Злющий морж відповів: «${a(7)}». Перехожі з лопатами подумали: ${a(8)}. Навесні всі розтали і ${a(9)}. Залишилась лише ${a(10)}. Філософія снігу: ${a(11)}.`;
        }
    },
    halloween: {
        id: "halloween",
        name: "halloween",
        description: "halloween theme",
        questions: [
            "Q_HALLOWEEN_0",
            "Q_HALLOWEEN_1",
            "Q_HALLOWEEN_2",
            "Q_HALLOWEEN_3",
            "Q_HALLOWEEN_4",
            "Q_HALLOWEEN_5",
            "Q_HALLOWEEN_6",
            "Q_HALLOWEEN_7",
            "Q_HALLOWEEN_8",
            "Q_HALLOWEEN_9",
            "Q_HALLOWEEN_10",
            "Q_HALLOWEEN_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Дракула', 'Франкенштейн', 'Оборотень', 'Мумія'], ['з зомбі', 'зі скелетом', 'з відьмою'], ['на цвинтарі', 'в покинутому замку', 'в підвалі'], ['опівночі', 'в повню', 'коли завив вовк'], ['варили зілля', 'викликали духів', 'шукали скарби'], ['моторошно', 'весело', 'в паніці'], ['Згинь, нечиста сило!', 'Де мій гарбуз?'], ['Я прийшов за тобою!', 'Уууууу...'], ['що це пранк', 'що треба тікати'], ['всі розбіглися', 'дочекалися ранку'], ['чарівну паличку', 'котел з цукерками'], ['не ходи вночі на цвинтар', 'завжди май при собі часник']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `It was Halloween night. ${a(0)} and ${a(1)} sneaked into ${a(2)} ${a(3)}. They performed a dark ritual around ${a(4)}, feeling ${a(5)}. To ward off evil, ${a(0)} whispered: «${a(6)}». From the darkness a voice said: «${a(7)}». Witches on brooms thought: ${a(8)}. At dawn the magic vanished, and ${a(9)}. In their pockets they found ${a(10)}. Cursed moral: ${a(11)}.` :
                    v === 1 ? `The vampire party went wrong. ${a(0)} and glamorous ${a(1)} showed up ${a(2)} ${a(3)}. Someone accidentally brought ${a(4)}, leaving everyone ${a(5)}. Grabbing the garlic, ${a(0)} shouted: «${a(6)}». Count Dracula offendedly stated: «${a(7)}». Invited werewolves thought: ${a(8)}. The music stopped, and ${a(9)}, presenting ${a(10)}. Bloody lesson: ${a(11)}.` :
                        v === 2 ? `The zombie apocalypse struck suddenly! ${a(0)} and wounded ${a(1)} barricaded ${a(2)} ${a(3)}. Searching for salvation and ${a(4)}, they were ${a(5)}. Seeing the horde, ${a(0)} screamed: «${a(6)}». The lead zombie mumbled: «${a(7)}». The survivors thought: ${a(8)}. When the rescue chopper arrived, ${a(9)}. They exchanged ${a(10)}. Survival rule #1: ${a(11)}.` :
                            `They were running from a mad witch! Fearing a hex, ${a(0)} and ${a(1)} hid ${a(2)}. They were found ${a(3)} while trying to use ${a(4)}. They were shaking from: ${a(5)}. Throwing the cat, ${a(0)} said: «${a(6)}». The witch on a vacuum cursed them: «${a(7)}». Black cats thought: ${a(8)}. The curse worked, and ${a(9)}. A magical anomaly formed — ${a(10)}. Potion-making lesson: ${a(11)}.`;
            }
            return v === 0 ? `Це була ніч Хелловіна. ${a(0)} та ${a(1)} пробралися ${a(2)} ${a(3)}. Вони робили темний ритуал довкола ${a(4)}, і їм ставало ${a(5)}. Аби відігнати зло, ${a(0)} прошепотів(-ла): «${a(6)}». З темряви почулося: «${a(7)}». Відьми на мітлах подумали: ${a(8)}. На світанку магія зникла, і ${a(9)}. У їхніх кишенях знайшовся ${a(10)}. Проклята мораль: ${a(11)}.` :
                v === 1 ? `Вечірка вампірів пішла не за планом. ${a(0)} та гламурний ${a(1)} засвітилися ${a(2)} ${a(3)}. Хтось випадково приніс ${a(4)}, і всі почувалися ${a(5)}. Схопивши часник, ${a(0)} крикнув(-ла): «${a(6)}». Граф Дракула ображено заявив: «${a(7)}». Запрошені перевертні подумали: ${a(8)}. Музика зупинилася, і ${a(9)}, презентувавши ${a(10)}. Кровавий урок: ${a(11)}.` :
                    v === 2 ? `Зомбі-апокаліпсис настав раптово! ${a(0)} та поранений ${a(1)} забарикадувалися ${a(2)} ${a(3)}. Шукаючи порятунок і ${a(4)}, вони були ${a(5)}. Побачивши орду, ${a(0)} заволав(-ла): «${a(6)}». Головний зомбі прошамкав: «${a(7)}». Вцілілі люди подумали: ${a(8)}. Коли прилетів гелікоптер, ${a(9)}. Вони обмінялися ${a(10)}. Правило виживання №1: ${a(11)}.` :
                        `Вони тікали від скаженої відьми! Остерігаючись порчі, ${a(0)} та ${a(1)} сховалися ${a(2)}. Їх знайшли ${a(3)}, коли вони намагалися використати ${a(4)}. Їх трусило від: ${a(5)}. Кинувши кота, ${a(0)} сказав: «${a(6)}». Відьма на пилососі прокляла їх: «${a(7)}». Чорні коти подумали: ${a(8)}. Прокляття спрацювало, і ${a(9)}. Утворилася магічна аномалія — ${a(10)}. Урок зіллєваріння: ${a(11)}.`;
        }
    },
    summer: {
        id: "summer",
        name: "summer",
        description: "summer theme",
        questions: [
            "Q_SUMMER_0",
            "Q_SUMMER_1",
            "Q_SUMMER_2",
            "Q_SUMMER_3",
            "Q_SUMMER_4",
            "Q_SUMMER_5",
            "Q_SUMMER_6",
            "Q_SUMMER_7",
            "Q_SUMMER_8",
            "Q_SUMMER_9",
            "Q_SUMMER_10",
            "Q_SUMMER_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Турист', 'Дайвер', 'Серфер', 'Рятувальник'], ['з крабом', 'з акулою', 'з чайкою'], ['на пляжі', 'на безлюдному острові', 'в аквапарку'], ['в обідню спеку', 'на заході сонця', 'під час шторму'], ['мазалися кремом', 'будували замок з піску', 'каталися на банані'], ['спекотно', 'чудово', 'як варена креветка'], ['Вода тепла!', 'Я тону!'], ['Без паніки!', 'Тримайся за круг!'], ['що це зйомки фільму', 'що хлопець перегрівся'], ['пішли пити коктейлі', 'отримали опіки'], ['черепашку', 'магнітик на холодильник'], ['завжди користуйся кремом SPF', 'пий багато води']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `Summer vacation was in full swing. ${a(0)} and ${a(1)} chilled ${a(2)}. On a hot day (${a(3)}) they accidentally used ${a(4)}. Everyone around was ${a(5)}. Escaping the crowd, ${a(0)} yelled: «${a(6)}». The lifeguard with a megaphone replied: «${a(7)}». Seagulls in the sky thought: ${a(8)}. At the end of the trip ${a(9)}. They packed ${a(10)} in their suitcase. Beach wisdom: ${a(11)}.` :
                    v === 1 ? `Shark attack! ${a(0)} and terrified ${a(1)} ended up ${a(2)} around ${a(3)}. Armed with ${a(4)}, they felt ${a(5)}. Slapping the water, ${a(0)} screamed: «${a(6)}». The Megalodon surfaced and said: «${a(7)}». Sailors on a yacht thought: ${a(8)}. The coast guard arrived and ${a(9)}. As a trophy they kept ${a(10)}. Maritime law: ${a(11)}.` :
                        v === 2 ? `A deadly prank. When ${a(0)} buried ${a(1)} in the sand ${a(2)}. It was ${a(3)} when the prank with ${a(4)} got out of hand. They were high on: ${a(5)}. Taking off the shades, ${a(0)} proudly said: «${a(6)}». The dug-up friend spat sand: «${a(7)}». Corn vendors thought: ${a(8)}. The scandal ended with ${a(9)}, gifting ${a(10)}. Summer lesson: ${a(11)}.` :
                            `Lost at sea! On an inflatable mattress, ${a(0)} and ${a(1)} drifted ${a(2)} since ${a(3)}. Their only salvation was ${a(4)}. From dehydration they felt ${a(5)}. Spotting a mirage, ${a(0)} wheezed: «${a(6)}». A crab on the mattress clicked its claw: «${a(7)}». Mermaids underwater thought: ${a(8)}. A wave washed them ashore and ${a(9)}. They dug up ${a(10)}. Pirate wisdom: ${a(11)}.`;
            }
            return v === 0 ? `Літня відпустка у самому розпалі. ${a(0)} та ${a(1)} відпочивали ${a(2)}. Спекотного дня (${a(3)}) вони випадково використали ${a(4)}. Всі навколо були ${a(5)}. Рятуючись від натовпу, ${a(0)} вигукнув(-ла): «${a(6)}». Рятувальник в рупор відповів: «${a(7)}». Чайки в небі подумали: ${a(8)}. В кінці путівки ${a(9)}. У валізі додому поїхав(-ла) ${a(10)}. Мудрість пляжу: ${a(11)}.` :
                v === 1 ? `Атака акул! ${a(0)} та наляканий ${a(1)} опинилися ${a(2)} об ${a(3)}. Взявши з собою ${a(4)} як зброю, вони почувалися ${a(5)}. Б'ючи по воді, ${a(0)} закричав: «${a(6)}». Мегалодон випірнув і сказав: «${a(7)}». Моряки на яхті подумали: ${a(8)}. Прибула берегова охорона і ${a(9)}. В якості трофею вони залишили ${a(10)}. Морський закон: ${a(11)}.` :
                    v === 2 ? `Смертельний розіграш. Коли ${a(0)} закопав в пісок ${a(1)} ${a(2)}. Було ${a(3)}, коли розіграш з ${a(4)} вийшов з-під контролю. Вони ловили кайф: ${a(5)}. Знявши окуляри, ${a(0)} гордо мовив: «${a(6)}». Відкопаний друг сплюнув пісок: «${a(7)}». Продавці кукурудзи подумали: ${a(8)}. Скандал завершився тим, що ${a(9)}, подарувавши ${a(10)}. Літній урок: ${a(11)}.` :
                        `Вони загубилися в морі! На надувному матраці ${a(0)} та ${a(1)} дрейфували ${a(2)} вже з ${a(3)}. Їхнім єдиним порятунком було ${a(4)}. Від зневоднення вони були ${a(5)}. Помітивши міраж, ${a(0)} прохрипів: «${a(6)}». Краб на матраці клацнув клешнею: «${a(7)}». Русалки під водою подумали: ${a(8)}. Хвиля прибила їх до берега і ${a(9)}. Вони викопали ${a(10)}. Піратська мудрість: ${a(11)}.`;
        }
    },
    student: {
        id: "student",
        name: "student",
        description: "student theme",
        questions: [
            "Q_STUDENT_0",
            "Q_STUDENT_1",
            "Q_STUDENT_2",
            "Q_STUDENT_3",
            "Q_STUDENT_4",
            "Q_STUDENT_5",
            "Q_STUDENT_6",
            "Q_STUDENT_7",
            "Q_STUDENT_8",
            "Q_STUDENT_9",
            "Q_STUDENT_10",
            "Q_STUDENT_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Першокурсник', 'Ботан', 'Староста', 'Прогульник'], ['з викладачем', 'з комендантом', 'з відмінником'], ['в аудиторії', 'в гуртожитку', 'в бібліотеці'], ['за ніч до екзамену', 'під час сесії', 'на парі'], ['писали шпори', 'пили енергетик', 'благали про халяву'], ['в стресі', 'сонно', 'з надією'], ['Поставте три!', 'Я вчив, чесно!'], ['Прийдете на перездачу', 'Тягніть білет'], ['що він смертник', 'що це кінець'], ['отримали залік', 'пішли в армію'], ['шпаргалку-рулон', 'диплом'], ['від сесії до сесії живуть студенти весело', 'не відкладай на останню ніч']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `First class, eyes shutting. ${a(0)} and ${a(1)} crashed ${a(2)} ${a(3)}. They vainly crammed ${a(4)}, making them ${a(5)}. Looking at the exam ticket, ${a(0)} blurted: «${a(6)}». The examiner raised their glasses: «${a(7)}». The nerds in front thought: ${a(8)}. After the retake ${a(9)}, drowning their sorrow over ${a(10)}. Main college rule: ${a(11)}.` :
                    v === 1 ? `An epic dorm party got out of hand. After midnight, ${a(0)} and ${a(1)} woke up ${a(2)} at ${a(3)}. Shocked by ${a(4)} on the ceiling, they felt ${a(5)}. Rubbing their eyes, ${a(0)} mumbled: «${a(6)}». The dorm warden with a mop replied: «${a(7)}». Neighbors next door thought: ${a(8)}. They weren't evicted, instead ${a(9)}. They invented a hangover cure: ${a(10)}. The student anthem says: ${a(11)}.` :
                        v === 2 ? `Attempting to bribe the professor! ${a(0)} slyly winked at ${a(1)} ${a(2)} exactly at ${a(3)}. Handing over ${a(4)} as a bribe, they were ${a(5)}. ${a(0)} whispered the secret password: «${a(6)}». The professor slammed the desk: «${a(7)}». The security camera recorded it and the AI thought: ${a(8)}. The corrupt scheme failed and ${a(9)}. All that remained was ${a(10)}. University pledge: ${a(11)}.` :
                            `They accidentally invented a new science. In the lab, ${a(0)} and genius ${a(1)} locked themselves ${a(2)} ${a(3)}. Mixing chemicals with ${a(4)}, they felt ${a(5)}. During the explosion, ${a(0)} screamed: «${a(6)}». The dean in a gas mask barked: «${a(7)}». The Nobel committee thought: ${a(8)}. They got a patent, and ${a(9)}. Humanity then saw ${a(10)}. Scientific postulate: ${a(11)}.`;
            }
            return v === 0 ? `Перша пара, очі злипаються. ${a(0)} та ${a(1)} завалилися ${a(2)} ${a(3)}. Вони марно зубрили ${a(4)}, від чого були ${a(5)}. Подивившись у білет, ${a(0)} видав: «${a(6)}». Екзаменатор підняв окуляри: «${a(7)}». Відмінники попереду подумали: ${a(8)}. Після перездачі ${a(9)}, обмиваючи своє горе через ${a(10)}. Головне правило вишу: ${a(11)}.` :
                v === 1 ? `Епічна гулянка в гуртожитку вийшла з-під контролю. Після півночі ${a(0)} та ${a(1)} прокинулися ${a(2)} об ${a(3)}. Оторопівши від ${a(4)} на стелі, їхнє самопочуття було ${a(5)}. Протерши очі, ${a(0)} бовкнув: «${a(6)}». Комендантка зі шваброю відповіла: «${a(7)}». Сусіди за стіною подумали: ${a(8)}. Їх не виселили, натомість ${a(9)}. Вони винайшли ліки від похмілля: ${a(10)}. Студентський гімн гласить: ${a(11)}.` :
                    v === 2 ? `Спроба підкупу викладача! ${a(0)} хитро підморгнув ${a(1)} ${a(2)} рівно ${a(3)}. Передаючи як хабар ${a(4)}, вони були ${a(5)}. ${a(0)} шепнув секретний пароль: «${a(6)}». Викладач ударив кулаком по столу: «${a(7)}». Камера спостереження записала і штучний інтелект подумав: ${a(8)}. Корупційна схема провалилася і ${a(9)}. На згадку лишилась тільки ${a(10)}. Університетська клятва: ${a(11)}.` :
                        `Вони випадково винайшли нову науку. В лабораторії ${a(0)} та геніальний ${a(1)} замкнулися ${a(2)} ${a(3)}. Змішавши хімікати з ${a(4)}, їх осінило ${a(5)}. Під час вибуху ${a(0)} заволав: «${a(6)}». Декан у протигазі гаркнув: «${a(7)}». Нобелівський комітет подумав: ${a(8)}. Їм видали патент, і ${a(9)}. Тоді людство побачило ${a(10)}. Науковий постулат: ${a(11)}.`;
        }
    },
    gaming: {
        id: "gaming",
        name: "gaming",
        description: "gaming theme",
        questions: [
            "Q_GAMING_0",
            "Q_GAMING_1",
            "Q_GAMING_2",
            "Q_GAMING_3",
            "Q_GAMING_4",
            "Q_GAMING_5",
            "Q_GAMING_6",
            "Q_GAMING_7",
            "Q_GAMING_8",
            "Q_GAMING_9",
            "Q_GAMING_10",
            "Q_GAMING_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Нуб', 'Кіберспортсмен', 'Тріпл-клік', 'Снайпер'], ['з чітером', 'з ботом', 'з топ-1 гравцем'], ['на міді', 'в кущах', 'на респавні'], ['в овертаймі', 'на першій хвилині', 'під час лагу'], ['кемперили', 'рашили', 'збирали лут'], ['в рейджі', 'зосереджено', 'як боги геймінгу'], ['Раш Б!', 'Мене вбили!'], ['Ізі пізі', 'ГГ ВП'], ['що це смурф', 'що треба репорт'], ['зламали клавіатуру', 'виграли турнір'], ['легендарний скін', 'бан на 10 років'], ['не будь токсиком', 'купи нормальний комп']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `A tough match! ${a(0)} and ${a(1)} got stuck ${a(2)}. It was ${a(3)} and they were still using ${a(4)}. Their state resembled ${a(5)}. With their last breath, ${a(0)} yelled into Discord: «${a(6)}». The enemy sniper typed in all-chat: «${a(7)}». Twitch viewers thought: ${a(8)}. In the end they clutched and ${a(9)}. They got an epic legendary drop: ${a(10)}. The golden gamer rule: ${a(11)}.` :
                    v === 1 ? `A toxic lobby went beyond the game. ${a(0)} tracked ${a(1)}'s IP and they met ${a(2)} ${a(3)}. Insulting each other over ${a(4)}, the rage level was ${a(5)}. Taking off the headset, ${a(0)} declared: «${a(6)}». The opponent smashed their keyboard: «${a(7)}». Mom in the next room thought: ${a(8)}. Nobody got hurt IRL and ${a(9)}, finding a common ${a(10)}. Moral of randoms: ${a(11)}.` :
                        v === 2 ? `Players trapped in VR! Pixelated ${a(0)} and buggy ${a(1)} wandered ${a(2)} as of ${a(3)}. Applying the cheat code ${a(4)}, they were ${a(5)}. Looking at a glitched texture, ${a(0)} cried out: «${a(6)}». The matrix sysadmin replied: «${a(7)}». Antivirus programs thought: ${a(8)}. The server crashed and ${a(9)}. A trojan remained shaped like ${a(10)}. Brain firmware: ${a(11)}.` :
                            `Clan war for epic loot. Tank ${a(0)} and healer ${a(1)} dropped ${a(2)} ${a(3)}. When ${a(4)} dropped, their euphoria was ${a(5)}. Charging the ultimate, ${a(0)} shouted: «${a(6)}». The dungeon boss laughed: «${a(7)}». AFK guildmates thought: ${a(8)}. They looted the vault and ${a(9)}. Sharing the gold, they crafted ${a(10)}. MMO commandment: ${a(11)}.`;
            }
            return v === 0 ? `Тяжка катка! ${a(0)} і ${a(1)} застрягли ${a(2)}. Вже йшла ${a(3)}, а вони все ще використовували ${a(4)}. Їхнє самопочуття нагадувало ${a(5)}. З останніх сил ${a(0)} крикнув в діскорд: «${a(6)}». Ворожий снайпер написав у загальний чат: «${a(7)}». Глядачі на Твічі подумали: ${a(8)}. У фіналі вони затащили і ${a(9)}. Їм випав легендарний лут: ${a(10)}. Золоте правило геймера: ${a(11)}.` :
                v === 1 ? `Токсичне лоббі вийшло за межі гри. ${a(0)} вирішив знайти по айпі ${a(1)} і вони перетнулися ${a(2)} ${a(3)}. Обізвавши один одного ${a(4)}, рівень гніву був ${a(5)}. Знявши навушники, ${a(0)} заявив: «${a(6)}». Опонент розбив клавіатуру: «${a(7)}». Мама в сусідній кімнаті подумала: ${a(8)}. В реалі ніхто не постраждав і ${a(9)}, знайшовши спільну ${a(10)}. Мораль рандомів: ${a(11)}.` :
                    v === 2 ? `Гравці застрягли у віртуальній реальності! Піксельний ${a(0)} та багований ${a(1)} блукали ${a(2)} станом на ${a(3)}. Застосовуючи чіт-код ${a(4)}, вони були ${a(5)}. Дивлячись на глючну текстуру, ${a(0)} скрикнув: «${a(6)}». Системний адміністратор матриці відповів: «${a(7)}». Антивірусні програми подумали: ${a(8)}. Сервер крашнувся і ${a(9)}. В системі залишився троян у вигляді ${a(10)}. Прошивка мозку: ${a(11)}.` :
                        `Клан-вар за епічний лут. Танк ${a(0)} разом з хілером ${a(1)} десантувалися ${a(2)} ${a(3)}. Коли випав ${a(4)}, їхня ейфорія була ${a(5)}. Готуючи ультимейт, ${a(0)} прокричав: «${a(6)}». Бос підземелля засміявся: «${a(7)}». Сокланівці в афк подумали: ${a(8)}. Вони обчистили скарбницю і ${a(9)}. Ділячи золото, вони створили ${a(10)}. Заповідь ММО: ${a(11)}.`;
        }
    },
    romance: {
        id: "romance",
        name: "romance",
        description: "romance theme",
        questions: [
            "Q_ROMANCE_0",
            "Q_ROMANCE_1",
            "Q_ROMANCE_2",
            "Q_ROMANCE_3",
            "Q_ROMANCE_4",
            "Q_ROMANCE_5",
            "Q_ROMANCE_6",
            "Q_ROMANCE_7",
            "Q_ROMANCE_8",
            "Q_ROMANCE_9",
            "Q_ROMANCE_10",
            "Q_ROMANCE_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Закоханий', 'Пікапер', 'Романтик', 'Холостяк'], ['з моделлю', 'з колишньою', 'з таємною симпатією'], ['в ресторані', 'в парку', 'на даху'], ['на першому побаченні', 'на день святого Валентина', 'під зоряним небом'], ['дарували квіти', 'співали серенаду', 'дивилися в очі'], ['метелики в животі', 'дуже ніяково', 'як у казці'], ['Я тебе кохаю!', 'Ти вийдеш за мене?'], ['Я подумаю', 'Давай залишимося друзями'], ['що вони мила пара', 'що це розлучення'], ['поцілунком', 'втекли разом'], ['обручку', 'коробку цукерок'], ['кохання сліпе', 'слухай своє серце']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4;
            if (lang === 'en') {
                return v === 0 ? `The most awkward first date ever. ${a(0)} took ${a(1)} ${a(2)} ${a(3)}. While trying to share ${a(4)}, their cringe level reached ${a(5)}. Nervous, ${a(0)} suddenly said: «${a(6)}». Blinking in embarrassment, ${a(1)} replied: «${a(7)}». The waiter nearby thought: ${a(8)}. Ultimately the evening was saved when ${a(9)}. They kept ${a(10)} as a memory. Moral of love: ${a(11)}.` :
                    v === 1 ? `The proposal went wrong! Getting on one knee, ${a(0)} in front of ${a(1)} ${a(2)} ${a(3)} pulled out the ring box. But instead there was ${a(4)}. Emotions jumped: ${a(5)}. With hope in their eyes, ${a(0)} said: «${a(6)}». The shocked partner exclaimed: «${a(7)}». A random witness thought: ${a(8)}. You can't fool the heart, and ${a(9)}, celebrating with ${a(10)}. Cupid's rule: ${a(11)}.` :
                        v === 2 ? `The ex suddenly showed up! During dinner, ${a(0)} and ${a(1)} were relaxing ${a(2)} ${a(3)}. Suddenly ${a(4)} was thrown on the table, and the vibe turned ${a(5)}. Gritting teeth, ${a(0)} snapped: «${a(6)}». The uninvited guest countered: «${a(7)}». The violinist thought: ${a(8)}. The drama turned into a comedy and ${a(9)}. After everything they threw away ${a(10)}. Life experience: ${a(11)}.` :
                            `A romantic walk in acid rain. Holding hands, ${a(0)} and ${a(1)} ran ${a(2)} ${a(3)}. Taking cover from the water using ${a(4)}, their passion was ${a(5)}. Under the thunder, ${a(0)} yelled: «${a(6)}». Smiling, ${a(1)} whispered: «${a(7)}». A wet pigeon on the ledge thought: ${a(8)}. They got soaked and ${a(9)}. And then dried ${a(10)} together. Lesson of passion: ${a(11)}.`;
            }
            return v === 0 ? `Це було найнезручніше перше побачення. ${a(0)} привів ${a(1)} ${a(2)} ${a(3)}. Коли вони намагалися розділити ${a(4)}, їхній рівень крінжу досяг ${a(5)}. Нервуючи, ${a(0)} раптом сказав(-ла): «${a(6)}». Зніяковіло кліпаючи, ${a(1)} відповів(-ла): «${a(7)}». Офіціант неподалік подумав: ${a(8)}. Зрештою вечір був врятований тим, що ${a(9)}. Вони зберегли на пам'ять ${a(10)}. Мораль кохання: ${a(11)}.` :
                v === 1 ? `Освідчення пішло не за планом! Ставши на коліно, ${a(0)} перед ${a(1)} ${a(2)} ${a(3)} дістав обручку. Але замість неї там було ${a(4)}. Емоції стрибали: ${a(5)}. З надією в очах ${a(0)} промовив: «${a(6)}». Шокована половинка вигукнула: «${a(7)}». Випадковий свідок подумав: ${a(8)}. Серце не обманеш, і ${a(9)}, святкуючи з ${a(10)}. Правило Купідона: ${a(11)}.` :
                    v === 2 ? `Раптово з'явився колишній(а)! Під час вечері ${a(0)} та ${a(1)} відпочивали ${a(2)} ${a(3)}. Раптом на стіл кинули ${a(4)}, і атмосфера стала ${a(5)}. Зціпивши зуби, ${a(0)} гаркнув: «${a(6)}». Незваний гість парирував: «${a(7)}». Музикант зі скрипкою подумав: ${a(8)}. Драма переросла в комедію і ${a(9)}. Після всього вони викинули ${a(10)}. Життєвий досвід: ${a(11)}.` :
                        `Романтична прогулянка під кислотним дощем. Тримаючись за руки, ${a(0)} та ${a(1)} бігли ${a(2)} ${a(3)}. Прикриваючись від води за допомогою ${a(4)}, їхня пристрасть була ${a(5)}. Під гуркіт грому ${a(0)} крикнув: «${a(6)}». Усміхаючись, ${a(1)} прошепотів: «${a(7)}». Мокрий голуб на карнизі подумав: ${a(8)}. Вони промокли до нитки і ${a(9)}. А потім разом висушили ${a(10)}. Урок пристрасті: ${a(11)}.`;
        }
    },
    chaos: {
        id: "chaos",
        name: "chaos",
        description: "chaos theme",
        questions: [
            "Q_CHAOS_0",
            "Q_CHAOS_1",
            "Q_CHAOS_2",
            "Q_CHAOS_3",
            "Q_CHAOS_4",
            "Q_CHAOS_5",
            "Q_CHAOS_6",
            "Q_CHAOS_7",
            "Q_CHAOS_8",
            "Q_CHAOS_9",
            "Q_CHAOS_10",
            "Q_CHAOS_11"
        ],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Баба Яга', 'Олег', 'Шрек', 'Дедпул'], ['з пінгвіном', 'зі своїм двійником', 'з зомбі'], ['на Місяці', 'в АТБ', 'в кратері вулкана'], ['о 3 ночі', 'у 2077 році', 'на Хелловін'], ['вирішували інтеграли', 'пекли піцу', 'літали'], ['дуже розгублено', 'мов два детективи', 'геть без слів'], ['Це нормально!', 'Ніхто не очікував!', 'Просто бізнес'], ['Прийнято!', 'Давай ще раз?', 'Ок, ок...'], ['що це норма', 'що треба викликати поліцію'], ['усі розійшлися по домівках', 'хтось замовив піцу'], ['машину часу з GPS', 'рецепт від нудьги'], ['дружба вирішує все', 'добро повертається']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const hashStr = localSeed + answers.join('');
            let sum = 0;
            for (let i = 0; i < hashStr.length; i++) sum += hashStr.charCodeAt(i);
            const v = sum % 7;
            const chaosVariant = (sum * 7) % 4;
            const themesArr = ["classic", "new_year", "halloween", "summer", "student", "gaming", "romance"];
            const t = TEMPLATES[themesArr[v]];
            return t.buildStory(answers, lang, String(chaosVariant), localSeed);
        }
    }
};
export function parseLegacyStory(story: string): { templateId: string, answers: string[] } | null {
    return null;
}
