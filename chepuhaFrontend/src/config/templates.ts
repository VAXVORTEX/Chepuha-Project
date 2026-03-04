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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `Once upon a time ${a(0)} met ${a(1)} ${a(2)}. It happened ${a(3)}, and it turned out that they ${a(4)}. They felt: ${a(5)}. Suddenly ${a(0)} said: «${a(6)}». To which ${a(1)} confidently replied: «${a(7)}». People around watched silently and thought: ${a(8)}. But eventually ${a(9)}. In the end they came up with: ${a(10)}. The moral of the story: ${a(11)}.` :
                    v === 1 ? `«${a(6)}» — suddenly echoed ${a(2)}. It was ${a(0)}, who had brought ${a(1)} there right at ${a(3)}. They were overwhelmed by feeling ${a(5)}, since they actively ${a(4)}. The only response was: «${a(7)}». Onlookers simply thought: ${a(8)}. Later, everything escalated until ${a(9)}. The only artifact left was ${a(10)}. Life lesson: ${a(11)}.` :
                        v === 2 ? `Nobody expected that ${a(9)}! It all began ${a(3)}, when ${a(1)} and ${a(0)} decided that ${a(2)} was the perfect spot to ${a(4)}. Grabbing ${a(10)}, they were struck by a state of: ${a(5)}. From the crowd, someone muttered: ${a(8)}. Then ${a(0)} shouted: «${a(6)}», at which ${a(1)} just laughed: «${a(7)}». The moral is simple: ${a(11)}.` :
                            v === 3 ? `Only after they ${a(4)}, did ${a(0)} realize what they got into. Beside them was ${a(1)}, and around them was ${a(2)}. Time flew by: ${a(3)}. Their faces clearly showed: ${a(5)}. «${a(7)}» — was all ${a(1)} could utter. But ${a(0)} snapped back: «${a(6)}». The bystanders silently reasoned: ${a(8)}. When it finally ${a(9)}, the only thing left of the conflict was ${a(10)}. Conclusion: ${a(11)}.` :
                                v === 4 ? `The weirdest day in history! ${a(8)} — that's how witnesses described it. Picture this: ${a(2)}, exactly ${a(3)}. The center of attention: ${a(0)} and ${a(1)}. With incredible enthusiasm, they ${a(4)}. Holding ${a(10)} in their hands, ${a(0)} declares: «${a(6)}». They were filled with the feeling of ${a(5)}. In response, a stern: «${a(7)}». The finale was absolutely epic because ${a(9)}. Moral: ${a(11)}.` :
                                    `When you feel ${a(5)}, it's hard to think rationally. That's exactly how ${a(0)} and ${a(1)} found themselves ${a(3)}. The location: ${a(2)}. What were they up to? They ${a(4)}. «${a(6)}», — unapologetically stated ${a(0)}. But ${a(1)} quietly answered: «${a(7)}». Society made its judgment: ${a(8)}. But who cares if ${a(9)}? Taking ${a(10)}, they parted ways. Core rule: ${a(11)}.`;
            }
            return v === 0 ? `Одного разу ${a(0)} зустрівся з ${a(1)}. Це сталося ${a(2)} рівно ${a(3)}, і обернулося тим, що вони ${a(4)}. При цьому вони почувалися: ${a(5)}. Зненацька ${a(0)} видав(-ла): «${a(6)}». На що ${a(1)} впевнено відповів(-ла): «${a(7)}». Оточуючі мовчки подумали: ${a(8)}. Але зрештою ${a(9)}. Наостанок у них залишився(-лась): ${a(10)}. Мораль цієї історії: ${a(11)}.` :
                v === 1 ? `«${a(6)}» — несподівано пролунало ${a(2)}. Це був ${a(0)}, який саме ${a(3)} привів туди когось на ім'я ${a(1)}. Їх переповнювало відчуття: ${a(5)}, адже вони активно ${a(4)}. У відповідь почулося лише: «${a(7)}». Ті, хто це бачив, подумали: ${a(8)}. Згодом усе звелося до того, що ${a(9)}. Залишився лише один артефакт: ${a(10)}. Життєвий урок: ${a(11)}.` :
                    v === 2 ? `Ніхто не очікував, що ${a(9)}! Все почалося ${a(3)}, коли ${a(1)} та ${a(0)} вирішили, що ${a(2)} — ідеальне місце, аби ${a(4)}. Отримавши ${a(10)}, їх охопив стан: ${a(5)}. З натовпу подумки пролунало: ${a(8)}. Тоді ${a(0)} крикнув: «${a(6)}», на що ${a(1)} лиш розсміявся: «${a(7)}». Мораль проста: ${a(11)}.` :
                        v === 3 ? `Тільки після того, як вони ${a(4)}, ${a(0)} зрозумів, у що вплутався. Поруч був ${a(1)}, а навколо них — ${a(2)}. Час летів: ${a(3)}. На їхніх обличчях читалося: ${a(5)}. «${a(7)}» — це все, що міг сказати ${a(1)}. А от ${a(0)} відрізав: «${a(6)}». Люди навколо лише міркували: ${a(8)}. Коли нарешті ${a(9)}, від ситуації залишився тільки ${a(10)}. Висновок: ${a(11)}.` :
                            v === 4 ? `Найдивніший день в історії! ${a(8)} — ось як це описали свідки. Уявіть собі: ${a(2)}, рівно ${a(3)}. В центрі уваги ${a(0)} та ${a(1)}. Вони з неймовірним ентузіазмом ${a(4)}. Тримаючи в руках ${a(10)}, ${a(0)} заявляє: «${a(6)}». Їх переповнювало відчуття ${a(5)}. У відповідь звучить суворе: «${a(7)}». Фінал був абсолютно епічним, тому що ${a(9)}. Мораль: ${a(11)}.` :
                                `Коли ти ${a(5)}, важко думати раціонально. Саме так ${a(3)} опинилися ${a(0)} і ${a(1)}. Місце подій: ${a(2)}. Що вони робили? Вони ${a(4)}. «${a(6)}», — безапеляційно заявив ${a(0)}. А от ${a(1)} відповів: «${a(7)}». Суспільство зробило свій висновок: ${a(8)}. Але кому до цього діло, якщо ${a(9)}? Забравши ${a(10)}, вони розійшлися. Основне правило: ${a(11)}.`;
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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `The holiday started when ${a(0)} and ${a(1)} met ${a(2)}, right at ${a(3)}. They deeply searched for ${a(4)}, and their mood was: ${a(5)}. Suddenly ${a(0)} said during a toast: «${a(6)}». Santa Claus from the bushes strictly replied: «${a(7)}». The guests exchanged glances and thought: ${a(8)}. But the New Year's magic took its course, and eventually ${a(9)}. Under the tree they found gifts for each other: ${a(10)}. And their main toast became: «${a(11)}». That's a real Miracle!` :
                    v === 1 ? `Looking at the snow falling ${a(2)}, ${a(0)} noticed it was exactly ${a(3)}. «${a(6)}» — echo sounded in the cold air. Standing nearby, ${a(1)} simply mumbled: «${a(7)}». They were desperately ${a(4)}, and the festive spirit made them feel ${a(5)}. The elves in the workshop thought: ${a(8)}. By the end of the year, ${a(9)}, leaving ${a(10)} as a memory. Winter's moral: ${a(11)}.` :
                        v === 2 ? `${a(9)}! That's how this New Year's Eve went down! At ${a(3)}, ${a(0)} grabbed ${a(10)} and dragged ${a(1)} straight to ${a(2)}. Their sole mission was to ${a(4)}. Drunk with joy, they felt: ${a(5)}. «${a(7)}» — laughed ${a(1)}, but ${a(0)} aggressively toasted: «${a(6)}». The reindeer outside thought: ${a(8)}. The celebration concluded beautifully: ${a(11)}.` :
                            v === 3 ? `Because they chose to ${a(4)}, this winter party became legendary! The location? ${a(2)}. The time? ${a(3)}. ${a(0)} and ${a(1)} were vibrating with emotion: ${a(5)}. «${a(6)}», claimed ${a(0)}. Without missing a beat, ${a(1)} replied: «${a(7)}». Everyone at the table collectively thought: ${a(8)}. Fast forward to January 1st — ${a(9)}. Now they only have ${a(10)} to document it. Takeaway: ${a(11)}.` :
                                v === 4 ? `It was the Grinch's plan all along! ${a(8)} — that's what the citizens of Whoville suspected. ${a(3)} arrived, and ${a(0)} bumped into ${a(1)} ${a(2)}. In an attempt to ${a(4)}, they experienced an overwhelming sensation of ${a(5)}. Clutching a stolen ${a(10)}, ${a(0)} sneered: «${a(6)}». The stoic response was: «${a(7)}». The Christmas miracle triggered: ${a(9)}. True meaning of holidays: ${a(11)}.` :
                                    `Who would have thought that ${a(0)} and ${a(1)} would spend New Year's ${a(3)} at ${a(2)}? And yet, there they were, aggressively ${a(4)}. You could see in their eyes the feeling of: ${a(5)}. «${a(7)}», argued ${a(1)}, to which ${a(0)} yelled: «${a(6)}». The chimney sweeper shook his head: ${a(8)}. Then midnight struck, and ${a(9)}. The gift box contained ${a(10)}. Let's drink to: ${a(11)}.`;
            }
            return v === 0 ? `Свято почалося, коли ${a(0)} та ${a(1)} зустрілися ${a(2)}, рівно ${a(3)}. Вони дуже довго шукали ${a(4)}, і їхній настрій був: ${a(5)}. Раптом ${a(0)} сказав(-ла) під час тосту: «${a(6)}». Дід Мороз із кущів суворо відповів: «${a(7)}». Гості перезирнулися і подумали: ${a(8)}. Але новорічна магія взяла своє, і зрештою ${a(9)}. Під ялинкою вони знайшли подарунки один одному: ${a(10)}. А їхнім головним тостом стало: «${a(11)}». Ось таке диво!` :
                v === 1 ? `Дивлячись на сніг, що падав ${a(2)}, ${a(0)} зауважив, що час наближається до ${a(3)}. «${a(6)}» — пролунало в морозному повітрі. Стоячи поруч, ${a(1)} пробурмотів: «${a(7)}». Вони з усіх сил ${a(4)}, а святкова атмосфера змушувала їх почувати ${a(5)}. Ельфи у майстерні подумали: ${a(8)}. Під кінець року виявилося, що ${a(9)}, і на згадку залишився лише ${a(10)}. Зимова мораль: ${a(11)}.` :
                    v === 2 ? `${a(9)}! Саме так минула ця новорічна ніч! ${a(3)} ${a(0)} схопив ${a(10)} і потягнув ${a(1)} просто до ${a(2)}. Їхньою єдиною місією було ${a(4)}. Сп'янілі від свята, вони відчували себе: ${a(5)}. «${a(7)}» — засміявся ${a(1)}, тоді як ${a(0)} агресивно вигукнув свій тост: «${a(6)}». Олені надворі подумали: ${a(8)}. Святкування завершилося гідно: ${a(11)}.` :
                        v === 3 ? `Тільки завдяки тому, що вони ${a(4)}, це зимове свято стало легендою! Місце? ${a(2)}. Час? ${a(3)}. ${a(0)} та ${a(1)} аж вібрували від емоції: ${a(5)}. «${a(6)}», впевнено заявив ${a(0)}. Не змигнувши й оком, ${a(1)} відповів: «${a(7)}». Всі за столом в один голос подумали: ${a(8)}. І ось настало 1 січня — ${a(9)}. А на підтвердження всього у них є ${a(10)}. Урок на майбутнє: ${a(11)}.` :
                            v === 4 ? `Це був підступний план Грінча! ${a(8)} — ось як вважали місцеві мешканці. Настало ${a(3)}, і ${a(0)} випадково зіткнувся з ${a(1)} ${a(2)}. Спроба ${a(4)} закінчилася відчуттям тотального ${a(5)}. Міцно стискаючи вкрадений ${a(10)}, ${a(0)} насміхався: «${a(6)}». У відповідь пролунало стримане: «${a(7)}». Тоді сталося різдвяне диво: ${a(9)}. Справжній сенс свята: ${a(11)}.` :
                                `Хто б міг подумати, що ${a(0)} та ${a(1)} проведуть Новий рік ${a(3)} ${a(2)}? І однак вони були там, завзято намагаючись ${a(4)}. У їхніх очах читалося відчуття: ${a(5)}. «${a(7)}», доводив ${a(1)}, на що ${a(0)} кричав у відповідь: «${a(6)}». Трубочист лише похитав головою: ${a(8)}. Коли пробило північ, сталося наступне: ${a(9)}. В коробці під ялинкою чекав ${a(10)}. Піднімемо келихи за: ${a(11)}.`;
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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `It was Halloween night. ${a(0)} and ${a(1)} sneaked into ${a(2)} ${a(3)}. They performed a dark ritual around ${a(4)}, feeling ${a(5)}. To ward off evil, ${a(0)} whispered: «${a(6)}». From the darkness a voice said: «${a(7)}». Witches on brooms thought: ${a(8)}. At dawn the magic vanished, and ${a(9)}. In their pockets they found ${a(10)}. Cursed moral: ${a(11)}.` :
                    v === 1 ? `The vampire party went wrong. ${a(0)} and glamorous ${a(1)} showed up ${a(2)} ${a(3)}. Someone accidentally brought ${a(4)}, leaving everyone ${a(5)}. Grabbing the garlic, ${a(0)} shouted: «${a(6)}». Count Dracula offendedly stated: «${a(7)}». Invited werewolves thought: ${a(8)}. The music stopped, and ${a(9)}, presenting ${a(10)}. Bloody lesson: ${a(11)}.` :
                        v === 2 ? `The zombie apocalypse struck suddenly! ${a(0)} and wounded ${a(1)} barricaded ${a(2)} ${a(3)}. Searching for salvation and ${a(4)}, they were ${a(5)}. Seeing the horde, ${a(0)} screamed: «${a(6)}». The lead zombie mumbled: «${a(7)}». The survivors thought: ${a(8)}. When the rescue chopper arrived, ${a(9)}. They exchanged ${a(10)}. Survival rule #1: ${a(11)}.` :
                            v === 3 ? `They were running from a mad witch! Fearing a hex, ${a(0)} and ${a(1)} hid ${a(2)}. They were found ${a(3)} while trying to use ${a(4)}. They were shaking from: ${a(5)}. Throwing the cat, ${a(0)} said: «${a(6)}». The witch on a vacuum cursed them: «${a(7)}». Black cats thought: ${a(8)}. The curse worked, and ${a(9)}. A magical anomaly formed — ${a(10)}. Potion-making lesson: ${a(11)}.` :
                                v === 4 ? `A demonic pact gone wrong. Desperate ${a(0)} and shady demon ${a(1)} met ${a(2)} exactly at ${a(3)}. Signing the contract in blood, they ${a(4)}. The dark energy made them feel ${a(5)}. Laughing nervously, ${a(0)} asked: «${a(6)}». Handing over the quill, ${a(1)} promised: «${a(7)}». The guardian angel watching thought: ${a(8)}. The ritual backfired and ${a(9)}. Their souls were trapped inside ${a(10)}. Occult warning: ${a(11)}.` :
                                    `A trick-or-treat disaster. Dressed-up ${a(0)} and their sidekick ${a(1)} knocked on a door ${a(2)} ${a(3)}. Asking for candy, they accidentally ${a(4)}. The awkwardness made them feel ${a(5)}. Holding an empty bag, ${a(0)} demanded: «${a(6)}». The grumpy homeowner snapped: «${a(7)}». Other trick-or-treaters thought: ${a(8)}. They got chased away and ${a(9)}. The only candy they got was ${a(10)}. Halloween etiquette: ${a(11)}.`;
            }
            return v === 0 ? `Це була ніч Хелловіна. ${a(0)} та ${a(1)} пробралися ${a(2)} ${a(3)}. Вони робили темний ритуал довкола ${a(4)}, і їм ставало ${a(5)}. Аби відігнати зло, ${a(0)} прошепотів(-ла): «${a(6)}». З темряви почулося: «${a(7)}». Відьми на мітлах подумали: ${a(8)}. На світанку магія зникла, і ${a(9)}. У їхніх кишенях знайшовся ${a(10)}. Проклята мораль: ${a(11)}.` :
                v === 1 ? `Вечірка вампірів пішла не за планом. ${a(0)} та гламурний ${a(1)} засвітилися ${a(2)} ${a(3)}. Хтось випадково приніс ${a(4)}, і всі почувалися ${a(5)}. Схопивши часник, ${a(0)} крикнув(-ла): «${a(6)}». Граф Дракула ображено заявив: «${a(7)}». Запрошені перевертні подумали: ${a(8)}. Музика зупинилася, і ${a(9)}, презентувавши ${a(10)}. Кровавий урок: ${a(11)}.` :
                    v === 2 ? `Зомбі-апокаліпсис настав раптово! ${a(0)} та поранений ${a(1)} забарикадувалися ${a(2)} ${a(3)}. Шукаючи порятунок і ${a(4)}, вони були ${a(5)}. Побачивши орду, ${a(0)} заволав(-ла): «${a(6)}». Головний зомбі прошамкав: «${a(7)}». Вцілілі люди подумали: ${a(8)}. Коли прилетів гелікоптер, ${a(9)}. Вони обмінялися ${a(10)}. Правило виживання №1: ${a(11)}.` :
                        v === 3 ? `Вони тікали від скаженої відьми! Остерігаючись порчі, ${a(0)} та ${a(1)} сховалися ${a(2)}. Їх знайшли ${a(3)}, коли вони намагалися використати ${a(4)}. Їх трусило від: ${a(5)}. Кинувши кота, ${a(0)} сказав: «${a(6)}». Відьма на пилососі прокляла їх: «${a(7)}». Чорні коти подумали: ${a(8)}. Прокляття спрацювало, і ${a(9)}. Утворилася магічна аномалія — ${a(10)}. Урок зіллєваріння: ${a(11)}.` :
                            v === 4 ? `Невдала демонічна угода. Зневірений(-а) ${a(0)} та хитрий демон ${a(1)} зустрілися ${a(2)} рівно о ${a(3)}. Підписуючи контракт кров'ю, вони ${a(4)}. Темна енергія змусила їх почуватися ${a(5)}. Знервовано сміючись, ${a(0)} запитав(-ла): «${a(6)}». Простягаючи перо, ${a(1)} пообіцяв(-ла): «${a(7)}». Янгол-охоронець, що спостерігав за цим, подумав: ${a(8)}. Ритуал дав збій і ${a(9)}. Їхні душі опинилися всередині ${a(10)}. Окультне попередження: ${a(11)}.` :
                                `Конфуз на Хелловін. Переодягнений(-а) ${a(0)} та напарник ${a(1)} постукали у двері ${a(2)} ${a(3)}. Вимагаючи цукерки, вони випадково ${a(4)}. Через рівень крінжу вони відчували себе ${a(5)}. Тримаючи порожній мішок, ${a(0)} заявив(-ла): «${a(6)}». Буркотливий господар огризнувся: «${a(7)}». Інші діти в костюмах подумали: ${a(8)}. Їх прогнали геть і ${a(9)}. Єдиним трофеєм виявився(-лася) зіпсований(-а) ${a(10)}. Етикет щедрування: ${a(11)}.`;
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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `Summer vacation was in full swing. ${a(0)} and ${a(1)} chilled ${a(2)}. On a hot day (${a(3)}) they accidentally used ${a(4)}. Everyone around was ${a(5)}. Escaping the crowd, ${a(0)} yelled: «${a(6)}». The lifeguard with a megaphone replied: «${a(7)}». Seagulls in the sky thought: ${a(8)}. At the end of the trip ${a(9)}. They packed ${a(10)} in their suitcase. Beach wisdom: ${a(11)}.` :
                    v === 1 ? `Shark attack! ${a(0)} and terrified ${a(1)} ended up ${a(2)} around ${a(3)}. Armed with ${a(4)}, they felt ${a(5)}. Slapping the water, ${a(0)} screamed: «${a(6)}». The Megalodon surfaced and said: «${a(7)}». Sailors on a yacht thought: ${a(8)}. The coast guard arrived and ${a(9)}. As a trophy they kept ${a(10)}. Maritime law: ${a(11)}.` :
                        v === 2 ? `A deadly prank. When ${a(0)} buried ${a(1)} in the sand ${a(2)}. It was ${a(3)} when the prank with ${a(4)} got out of hand. They were high on: ${a(5)}. Taking off the shades, ${a(0)} proudly said: «${a(6)}». The dug-up friend spat sand: «${a(7)}». Corn vendors thought: ${a(8)}. The scandal ended with ${a(9)}, gifting ${a(10)}. Summer lesson: ${a(11)}.` :
                            v === 3 ? `Lost at sea! On an inflatable mattress, ${a(0)} and ${a(1)} drifted ${a(2)} since ${a(3)}. Their only salvation was ${a(4)}. From dehydration they felt ${a(5)}. Spotting a mirage, ${a(0)} wheezed: «${a(6)}». A crab on the mattress clicked its claw: «${a(7)}». Mermaids underwater thought: ${a(8)}. A wave washed them ashore and ${a(9)}. They dug up ${a(10)}. Pirate wisdom: ${a(11)}.` :
                                v === 4 ? `A tropical shipwreck survival. Castaway ${a(0)} and a friendly crab ${a(1)} washed ashore ${a(2)} ${a(3)}. Trying to build a raft, they helplessly ${a(4)}. Burned by the sun, they felt ${a(5)}. Drawing an SOS, ${a(0)} yelled: «${a(6)}». Scuttling sideways, ${a(1)} clicked: «${a(7)}». The rescue helicopter pilot thought: ${a(8)}. The tide came in and ${a(9)}, washing up ${a(10)}. Island survival rule: ${a(11)}.` :
                                    `A chaotic pool party. Sunburned ${a(0)} and the DJ ${a(1)} crashed a VIP party ${a(2)} ${a(3)}. Jumping into the water, they famously ${a(4)}. The splashing made them feel purely ${a(5)}. Splitting a cocktail, ${a(0)} cheered: «${a(6)}». Turning up the bass, ${a(1)} agreed: «${a(7)}». The angry lifeguards thought: ${a(8)}. The cops arrived and ${a(9)}, confiscating ${a(10)}. Summer party lesson: ${a(11)}.`;
            }
            return v === 0 ? `Літня відпустка у самому розпалі. ${a(0)} та ${a(1)} відпочивали ${a(2)}. Спекотного дня (${a(3)}) вони випадково використали ${a(4)}. Всі навколо були ${a(5)}. Рятуючись від натовпу, ${a(0)} вигукнув(-ла): «${a(6)}». Рятувальник в рупор відповів: «${a(7)}». Чайки в небі подумали: ${a(8)}. В кінці путівки ${a(9)}. У валізі додому поїхав(-ла) ${a(10)}. Мудрість пляжу: ${a(11)}.` :
                v === 1 ? `Атака акул! ${a(0)} та наляканий ${a(1)} опинилися ${a(2)} об ${a(3)}. Взявши з собою ${a(4)} як зброю, вони почувалися ${a(5)}. Б'ючи по воді, ${a(0)} закричав: «${a(6)}». Мегалодон випірнув і сказав: «${a(7)}». Моряки на яхті подумали: ${a(8)}. Прибула берегова охорона і ${a(9)}. В якості трофею вони залишили ${a(10)}. Морський закон: ${a(11)}.` :
                    v === 2 ? `Смертельний розіграш. Коли ${a(0)} закопав в пісок ${a(1)} ${a(2)}. Було ${a(3)}, коли розіграш з ${a(4)} вийшов з-під контролю. Вони ловили кайф: ${a(5)}. Знявши окуляри, ${a(0)} гордо мовив: «${a(6)}». Відкопаний друг сплюнув пісок: «${a(7)}». Продавці кукурудзи подумали: ${a(8)}. Скандал завершився тим, що ${a(9)}, подарувавши ${a(10)}. Літній урок: ${a(11)}.` :
                        v === 3 ? `Вони загубилися в морі! На надувному матраці ${a(0)} та ${a(1)} дрейфували ${a(2)} вже з ${a(3)}. Їхнім єдиним порятунком було ${a(4)}. Від зневоднення вони були ${a(5)}. Помітивши міраж, ${a(0)} прохрипів: «${a(6)}». Краб на матраці клацнув клешнею: «${a(7)}». Русалки під водою подумали: ${a(8)}. Хвиля прибила їх до берега і ${a(9)}. Вони викопали ${a(10)}. Піратська мудрість: ${a(11)}.` :
                            v === 4 ? `Виживання після кораблетрощі. Відлюдько ${a(0)} та новий друг-краб ${a(1)} були викинуті на берег ${a(2)} ${a(3)}. Намагаючись побудувати пліт, вони безнадійно ${a(4)}. Обгорівши на сонці, вони почувалися ${a(5)}. Малюючи SOS на піску, ${a(0)} заволав(-ла): «${a(6)}». Біжучи боком, ${a(1)} клацнув клешнями: «${a(7)}». Пілот рятувального гелікоптера подумав: ${a(8)}. Почався приплив і ${a(9)}, принісши на берег ${a(10)}. Правило виживання на острові: ${a(11)}.` :
                                `Хаотична вечірка біля басейну. Обгорілий(-а) ${a(0)} та діджей ${a(1)} проникли на VIP-тусовку ${a(2)} ${a(3)}. Стрибаючи у воду, вони епічно ${a(4)}. Цей відрив змусив їх відчути себе ${a(5)}. Ділячи коктейль, ${a(0)} виголосив(-ла): «${a(6)}». Додавши басів, ${a(1)} погодився(-лася): «${a(7)}». Злі рятувальники подумали: ${a(8)}. Приїхали копи і ${a(9)}, конфіскувавши ${a(10)}. Урок літніх вечірок: ${a(11)}.`;
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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `First class, eyes shutting. ${a(0)} and ${a(1)} crashed ${a(2)} ${a(3)}. They vainly crammed ${a(4)}, making them ${a(5)}. Looking at the exam ticket, ${a(0)} blurted: «${a(6)}». The examiner raised their glasses: «${a(7)}». The nerds in front thought: ${a(8)}. After the retake ${a(9)}, drowning their sorrow over ${a(10)}. Main college rule: ${a(11)}.` :
                    v === 1 ? `An epic dorm party got out of hand. After midnight, ${a(0)} and ${a(1)} woke up ${a(2)} at ${a(3)}. Shocked by ${a(4)} on the ceiling, they felt ${a(5)}. Rubbing their eyes, ${a(0)} mumbled: «${a(6)}». The dorm warden with a mop replied: «${a(7)}». Neighbors next door thought: ${a(8)}. They weren't evicted, instead ${a(9)}. They invented a hangover cure: ${a(10)}. The student anthem says: ${a(11)}.` :
                        v === 2 ? `Attempting to bribe the professor! ${a(0)} slyly winked at ${a(1)} ${a(2)} exactly at ${a(3)}. Handing over ${a(4)} as a bribe, they were ${a(5)}. ${a(0)} whispered the secret password: «${a(6)}». The professor slammed the desk: «${a(7)}». The security camera recorded it and the AI thought: ${a(8)}. The corrupt scheme failed and ${a(9)}. All that remained was ${a(10)}. University pledge: ${a(11)}.` :
                            v === 3 ? `They accidentally invented a new science. In the lab, ${a(0)} and genius ${a(1)} locked themselves ${a(2)} ${a(3)}. Mixing chemicals with ${a(4)}, they felt ${a(5)}. During the explosion, ${a(0)} screamed: «${a(6)}». The dean in a gas mask barked: «${a(7)}». The Nobel committee thought: ${a(8)}. They got a patent, and ${a(9)}. Humanity then saw ${a(10)}. Scientific postulate: ${a(11)}.` :
                                v === 4 ? `A desperate academic evasion. The chronic slacker ${a(0)} and the strict professor ${a(1)} collided ${a(2)} ${a(3)}. Hoping for a passing grade, they creatively ${a(4)}. The fear of expulsion made them feel ${a(5)}. Handing over a blank paper, ${a(0)} lied: «${a(6)}». Adjusting their glasses, ${a(1)} sighed: «${a(7)}». The straight-A students giggled and thought: ${a(8)}. The semester ended and ${a(9)}. They framed the failing grade on ${a(10)}. Academic lesson: ${a(11)}.` :
                                    `A caffeine-fueled marathon. Exhausted ${a(0)} and the panic-stricken ${a(1)} locked themselves ${a(2)} exactly ${a(3)}. Trying to finish the thesis, they frantically ${a(4)}. Driven by energy drinks, they felt ${a(5)}. Staring at the screen, ${a(0)} whispered: «${a(6)}». Spilling coffee, ${a(1)} screamed: «${a(7)}». The sleepy librarian thought: ${a(8)}. The deadline passed and ${a(9)}. They submitted a draft containing ${a(10)}. Procrastination rule: ${a(11)}.`;
            }
            return v === 0 ? `Перша пара, очі злипаються. ${a(0)} та ${a(1)} завалилися ${a(2)} ${a(3)}. Вони марно зубрили ${a(4)}, від чого були ${a(5)}. Подивившись у білет, ${a(0)} видав: «${a(6)}». Екзаменатор підняв окуляри: «${a(7)}». Відмінники попереду подумали: ${a(8)}. Після перездачі ${a(9)}, обмиваючи своє горе через ${a(10)}. Головне правило вишу: ${a(11)}.` :
                v === 1 ? `Епічна гулянка в гуртожитку вийшла з-під контролю. Після півночі ${a(0)} та ${a(1)} прокинулися ${a(2)} об ${a(3)}. Оторопівши від ${a(4)} на стелі, їхнє самопочуття було ${a(5)}. Протерши очі, ${a(0)} бовкнув: «${a(6)}». Комендантка зі шваброю відповіла: «${a(7)}». Сусіди за стіною подумали: ${a(8)}. Їх не виселили, натомість ${a(9)}. Вони винайшли ліки від похмілля: ${a(10)}. Студентський гімн гласить: ${a(11)}.` :
                    v === 2 ? `Спроба підкупу викладача! ${a(0)} хитро підморгнув ${a(1)} ${a(2)} рівно ${a(3)}. Передаючи як хабар ${a(4)}, вони були ${a(5)}. ${a(0)} шепнув секретний пароль: «${a(6)}». Викладач ударив кулаком по столу: «${a(7)}». Камера спостереження записала і штучний інтелект подумав: ${a(8)}. Корупційна схема провалилася і ${a(9)}. На згадку лишилась тільки ${a(10)}. Університетська клятва: ${a(11)}.` :
                        v === 3 ? `Вони випадково винайшли нову науку. В лабораторії ${a(0)} та геніальний ${a(1)} замкнулися ${a(2)} ${a(3)}. Змішавши хімікати з ${a(4)}, їх осінило ${a(5)}. Під час вибуху ${a(0)} заволав: «${a(6)}». Декан у протигазі гаркнув: «${a(7)}». Нобелівський комітет подумав: ${a(8)}. Їм видали патент, і ${a(9)}. Тоді людство побачило ${a(10)}. Науковий постулат: ${a(11)}.` :
                            v === 4 ? `Відчайдушне академічне ухилення. Хронічний двієчник ${a(0)} та суворий викладач ${a(1)} зіштовхнулися ${a(2)} ${a(3)}. Сподіваючись на трійку, вони креативно ${a(4)}. Страх відрахування змушував їх почуватися ${a(5)}. Здаючи порожній листок, ${a(0)} збрехав(-ла): «${a(6)}». Поправляючи окуляри, ${a(1)} зітхнув(-ла): «${a(7)}». Відмінники захихикали і подумали: ${a(8)}. Семестр закінчився і ${a(9)}. Вони повісили в рамку свою ${a(10)}. Академічний урок: ${a(11)}.` :
                                `Кофеїновий марафон. Виснажений(-а) ${a(0)} та запанікований(-а) ${a(1)} закрилися ${a(2)} рівно ${a(3)}. Намагаючись дописати диплом, вони гарячково ${a(4)}. Накачані енергетиками, вони були ${a(5)}. Дивлячись у монітор, ${a(0)} прошепотів(-ла): «${a(6)}». Розливаючи каву, ${a(1)} закричав(-ла): «${a(7)}». Сонна бібліотекарка подумала: ${a(8)}. Дедлайн минув і ${a(9)}. Вони здали чернетку, в якій був(-ла) ${a(10)}. Правило прокрастинатора: ${a(11)}.`;
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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `A tough match! ${a(0)} and ${a(1)} got stuck ${a(2)}. It was ${a(3)} and they were still using ${a(4)}. Their state resembled ${a(5)}. With their last breath, ${a(0)} yelled into Discord: «${a(6)}». The enemy sniper typed in all-chat: «${a(7)}». Twitch viewers thought: ${a(8)}. In the end they clutched and ${a(9)}. They got an epic legendary drop: ${a(10)}. The golden gamer rule: ${a(11)}.` :
                    v === 1 ? `Everything started with ${a(4)}, turning the lobby completely toxic. It's ${a(3)}, and ${a(0)} aggressively rushes ${a(2)} alongside ${a(1)}. You could feel the pure rage: ${a(5)}. «${a(6)}», — screamed ${a(0)}, taking off their headset. But the opponent just typed: «${a(7)}». Randoms in the voice chat thought: ${a(8)}. Despite the drama, ${a(9)}. The match history recorded ${a(10)}. Gamer motto: ${a(11)}.` :
                        v === 2 ? `«${a(6)}» — that was the last thing ${a(0)} said before the VR system glitched. Right at ${a(3)}, ${a(1)} tried to help them out by ${a(4)}. The location of the bug? ${a(2)}. Their ping was jumping, making them feel ${a(5)}. Suddenly a matrix admin replied: «${a(7)}». Anti-cheat systems thought: ${a(8)}. The ultimate result was that ${a(9)}. And a corrupted save file left them with ${a(10)}. Note to self: ${a(11)}.` :
                            v === 3 ? `Did you hear about what happened ${a(2)}? ${a(8)} — that was the clan's reaction. ${a(3)}, ${a(0)} and ${a(1)} were fiercely ${a(4)}. Driven by epic loot, they were ${a(5)}. Preparing their ultimate, ${a(0)} cried: «${a(6)}». The raid boss just laughed: «${a(7)}». But an unexpected critical hit meant ${a(9)}. A legendary drop appeared: ${a(10)}. The MMO golden rule: ${a(11)}.` :
                                v === 4 ? `${a(9)}! The speedrun attempt of the century ended there! Early ${a(3)}, ${a(0)} dragged ${a(1)} to ${a(2)} to attempt ${a(4)}. Sweating buckets, their status was: ${a(5)}. Skipping frames, ${a(0)} yelled: «${a(6)}». An NPC broke code and muttered: «${a(7)}». Viewers on the leaderboard thought: ${a(8)}. The run was invalidated, leaving them with ${a(10)}. Speedrunner's curse: ${a(11)}.` :
                                    `Who would have thought that ${a(4)} would bring such nostalgia? ${a(0)} and their player-2 ${a(1)} booted up the console ${a(3)}. Settling down ${a(2)}, they were overwhelmingly ${a(5)}. «${a(7)}», complained ${a(1)}. But ${a(0)} refused to pause, shouting: «${a(6)}». Parents downstairs thought: ${a(8)}. Then the cartridge froze and ${a(9)}. At least they salvaged ${a(10)}. Couch co-op law: ${a(11)}.`;
            }
            return v === 0 ? `Тяжка катка! ${a(0)} і ${a(1)} застрягли ${a(2)}. Вже йшла ${a(3)}, а вони все ще використовували ${a(4)}. Їхнє самопочуття нагадувало ${a(5)}. З останніх сил ${a(0)} крикнув в діскорд: «${a(6)}». Ворожий снайпер написав у загальний чат: «${a(7)}». Глядачі на Твічі подумали: ${a(8)}. У фіналі вони затащили і ${a(9)}. Їм випав легендарний лут: ${a(10)}. Золоте правило геймера: ${a(11)}.` :
                v === 1 ? `Все почалося з того, що вони ${a(4)}, і лобі стало максимально токсичним. Тривала ${a(3)}, а ${a(0)} агресивно пушив ${a(2)} разом із ${a(1)}. В повітрі висів чистий рейдж: ${a(5)}. «${a(6)}», — закричав ${a(0)}, кидаючи навушники. На що противник просто надрукував: «${a(7)}». Рандоми у войсчаті подумали: ${a(8)}. Менше з тим, ${a(9)}. В історії матчів залишився ${a(10)}. Девіз гравців: ${a(11)}.` :
                    v === 2 ? `«${a(6)}» — це останнє, що видав ${a(0)}, перш ніж VR-система заглючила. Рівно ${a(3)}, ${a(1)} намагався врятувати ситуацію, коли вони ${a(4)}. Де саме виник баг? ${a(2)}. Їхній пінг скакав, змушуючи їх відчувати себе ${a(5)}. Раптом сисадмін матриці відповів: «${a(7)}». Античіт-програма подумала: ${a(8)}. У результаті система крашнулася і ${a(9)}. Від прошивки зберігся тільки ${a(10)}. Пам'ятка на майбутнє: ${a(11)}.` :
                        v === 3 ? `Ви чули, що сталося ${a(2)}? ${a(8)} — такою була реакція всього клану. ${a(3)} ${a(0)} та хілер ${a(1)} відчайдушно намагалися ${a(4)}. Сп'янілі від жаги луту, вони були ${a(5)}. Готуючи ульту, ${a(0)} прокричав: «${a(6)}». Рейд-бос лише розреготався: «${a(7)}». Але несподіваний крит призвів до того, що ${a(9)}. З боса випав легендарний ${a(10)}. Золоте правило ММО: ${a(11)}.` :
                            v === 4 ? `${a(9)}! Ось так закінчився спідран століття! Рано-вранці о ${a(3)}, ${a(0)} потягнув ${a(1)} ${a(2)} виконувати глітч, де вони ${a(4)}. Вкриваючись потом, їхній стан описувався як ${a(5)}. Пропускаючи кадри, ${a(0)} заволав(-ла): «${a(6)}». Зламаний NPC раптом промовив: «${a(7)}». Глядачі на лідерборді подумали: ${a(8)}. Забіг анулювали, і в них залишився лише ${a(10)}. Прокляття спідранера: ${a(11)}.` :
                                `Хто б міг подумати, що спроба ${a(4)} принесе стільки ностальгії? ${a(0)} та другий гравець ${a(1)} включили приставку ${a(3)}. Вмостившись ${a(2)}, їх охопило відчуття: ${a(5)}. «${a(7)}», вічно жалівся ${a(1)}. Та ${a(0)} відмовлявся ставити на паузу, горланячи: «${a(6)}». Батьки в сусідній кімнаті подумали: ${a(8)}. Потім картридж завис і ${a(9)}. Все, що вдалося врятувати — це ${a(10)}. Закон диванного ко-опу: ${a(11)}.`;
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
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `The most awkward first date ever. ${a(0)} took ${a(1)} ${a(2)} ${a(3)}. While trying to share ${a(4)}, their cringe level reached ${a(5)}. Nervous, ${a(0)} suddenly said: «${a(6)}». Blinking in embarrassment, ${a(1)} replied: «${a(7)}». The waiter nearby thought: ${a(8)}. Ultimately the evening was saved when ${a(9)}. They kept ${a(10)} as a memory. Moral of love: ${a(11)}.` :
                    v === 1 ? `The proposal went wrong! Getting on one knee, ${a(0)} in front of ${a(1)} ${a(2)} ${a(3)} pulled out the ring box. But instead there was ${a(4)}. Emotions jumped: ${a(5)}. With hope in their eyes, ${a(0)} said: «${a(6)}». The shocked partner exclaimed: «${a(7)}». A random witness thought: ${a(8)}. You can't fool the heart, and ${a(9)}, celebrating with ${a(10)}. Cupid's rule: ${a(11)}.` :
                        v === 2 ? `The ex suddenly showed up! During dinner, ${a(0)} and ${a(1)} were relaxing ${a(2)} ${a(3)}. Suddenly ${a(4)} was thrown on the table, and the vibe turned ${a(5)}. Gritting teeth, ${a(0)} snapped: «${a(6)}». The uninvited guest countered: «${a(7)}». The violinist thought: ${a(8)}. The drama turned into a comedy and ${a(9)}. After everything they threw away ${a(10)}. Life experience: ${a(11)}.` :
                            v === 3 ? `A romantic walk in acid rain. Holding hands, ${a(0)} and ${a(1)} ran ${a(2)} ${a(3)}. Taking cover from the water using ${a(4)}, their passion was ${a(5)}. Under the thunder, ${a(0)} yelled: «${a(6)}». Smiling, ${a(1)} whispered: «${a(7)}». A wet pigeon on the ledge thought: ${a(8)}. They got soaked and ${a(9)}. And then dried ${a(10)} together. Lesson of passion: ${a(11)}.` :
                                v === 4 ? `A blind date plot twist. Nervous ${a(0)} and mysterious stranger ${a(1)} met blindfolded ${a(2)} exactly ${a(3)}. Breaking the ice, they ${a(4)}. The mystery made them feel ${a(5)}. Taking off the blindfold, ${a(0)} gasped: «${a(6)}». Smirking, ${a(1)} replied: «${a(7)}». The matchmaker hiding nearby thought: ${a(8)}. The date took a wild turn and ${a(9)}. They kept as a souvenir ${a(10)}. Blind date truth: ${a(11)}.` :
                                    `A forbidden love affair. Star-crossed lover ${a(0)} and their rival ${a(1)} secretly rendezvoused ${a(2)} ${a(3)}. Hiding from the world, they ${a(4)}. The danger of getting caught made them feel ${a(5)}. Holding hands, ${a(0)} swore: «${a(6)}». Tearing up, ${a(1)} whispered: «${a(7)}». The nosy paparazzi thought: ${a(8)}. The secret was exposed and ${a(9)}. Only a locket containing ${a(10)} remained. Romantic tragedy lesson: ${a(11)}.`;
            }
            return v === 0 ? `Це було найнезручніше перше побачення. ${a(0)} привів ${a(1)} ${a(2)} ${a(3)}. Коли вони намагалися розділити ${a(4)}, їхній рівень крінжу досяг ${a(5)}. Нервуючи, ${a(0)} раптом сказав(-ла): «${a(6)}». Зніяковіло кліпаючи, ${a(1)} відповів(-ла): «${a(7)}». Офіціант неподалік подумав: ${a(8)}. Зрештою вечір був врятований тим, що ${a(9)}. Вони зберегли на пам'ять ${a(10)}. Мораль кохання: ${a(11)}.` :
                v === 1 ? `Освідчення пішло не за планом! Ставши на коліно, ${a(0)} перед ${a(1)} ${a(2)} ${a(3)} дістав обручку. Але замість неї там було ${a(4)}. Емоції стрибали: ${a(5)}. З надією в очах ${a(0)} промовив: «${a(6)}». Шокована половинка вигукнула: «${a(7)}». Випадковий свідок подумав: ${a(8)}. Серце не обманеш, і ${a(9)}, святкуючи з ${a(10)}. Правило Купідона: ${a(11)}.` :
                    v === 2 ? `Раптово з'явився колишній(а)! Під час вечері ${a(0)} та ${a(1)} відпочивали ${a(2)} ${a(3)}. Раптом на стіл кинули ${a(4)}, і атмосфера стала ${a(5)}. Зціпивши зуби, ${a(0)} гаркнув: «${a(6)}». Незваний гість парирував: «${a(7)}». Музикант зі скрипкою подумав: ${a(8)}. Драма переросла в комедію і ${a(9)}. Після всього вони викинули ${a(10)}. Життєвий досвід: ${a(11)}.` :
                        v === 3 ? `Романтична прогулянка під кислотним дощем. Тримаючись за руки, ${a(0)} та ${a(1)} бігли ${a(2)} ${a(3)}. Прикриваючись від води за допомогою ${a(4)}, їхня пристрасть була ${a(5)}. Під гуркіт грому ${a(0)} крикнув: «${a(6)}». Усміхаючись, ${a(1)} прошепотів: «${a(7)}». Мокрий голуб на карнизі подумав: ${a(8)}. Вони промокли до нитки і ${a(9)}. А потім разом висушили ${a(10)}. Урок пристрасті: ${a(11)}.` :
                            v === 4 ? `Побачення наосліп. Знервований(-а) ${a(0)} та таємничий незнайомець ${a(1)} зустрілися із зав'язаними очима ${a(2)} рівно ${a(3)}. Щоб розрядити обстановку, вони ${a(4)}. Ця інтрига змусила їх почуватися ${a(5)}. Знімаючи пов'язку, ${a(0)} ахнув(-ла): «${a(6)}». Усміхаючись, ${a(1)} відповів(-ла): «${a(7)}». Сваха, що ховалася в кущах, подумала: ${a(8)}. Побачення набрало шалених обертів і ${a(9)}. На згадку вони залишили ${a(10)}. Правда про побачення наосліп: ${a(11)}.` :
                                `Заборонене кохання. Закоханий(-а) ${a(0)} та його/її конкурент ${a(1)} таємно зустрілися ${a(2)} ${a(3)}. Ховаючись від усього світу, вони ${a(4)}. Небезпека бути спійманими робила їх ${a(5)}. Тримаючись за руки, ${a(0)} присягнув(-ла): «${a(6)}». Зі сльозами на очах, ${a(1)} прошепотів(-ла): «${a(7)}». Допитливі папараці подумали: ${a(8)}. Їхній секрет розкрили і ${a(9)}. Від них залишився тільки кулон з ${a(10)}. Урок романтичної трагедії: ${a(11)}.`;
        }
    },
    adult: {
        id: "adult",
        name: "adult",
        description: "adult theme",
        questions: ["Q_ADULT_0", "Q_ADULT_1", "Q_ADULT_2", "Q_ADULT_3", "Q_ADULT_4", "Q_ADULT_5", "Q_ADULT_6", "Q_ADULT_7", "Q_ADULT_8", "Q_ADULT_9", "Q_ADULT_10", "Q_ADULT_11"],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Рікардо Мілос', 'Джонні Сінс', 'Вуаєрист', 'БДСМ-майстер'], ['з путаною', 'зі стриптизеркою', 'з фуррі'], ['у секс-шопі', 'на закритій паті', 'в роздягальні'], ['глупої ночі', 'коли всі заснули', 'в день святого Валентина'], ['грали в рольові ігри', 'робили брудні речі', 'знімали Онліфанс'], ['дуже збуджено', 'як тварини', 'до втрати пульсу'], ['О так, дитинко!', 'Покарай мене!'], ['Аххх...', 'Глибше!'], ['що це кастинг', 'що треба викликати поліцію моралі'], ['всі отримали екстаз', 'прийшли копи'], ['кайданки', 'гумову качечку'], ['користуйтесь гумками', 'не забувайте стоп-слово']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `Spicy tape from the archive. ${a(0)} and naughty ${a(1)} locked themselves ${a(2)} ${a(3)}. Shamelessly they ${a(4)}, feeling ${a(5)}. Moaning loudly, ${a(0)} screamed: «${a(6)}». Covered in sweat, ${a(1)} begged: «${a(7)}». Random onlookers thought: ${a(8)}. When it was over, ${a(9)}. They hid ${a(10)} under the bed. XXX Moral: ${a(11)}.` :
                    v === 1 ? `«${a(6)}» — that was the horny whisper from ${a(0)} echoing ${a(2)}. It was ${a(3)}, and ${a(1)} was fully engaged in ${a(4)}. Their chemistry was purely ${a(5)}. Breathing heavily, ${a(1)} just whimpered: «${a(7)}». Neighbors trying to sleep thought: ${a(8)}. Before anyone got a noise complaint, ${a(9)}. The only evidence left was ${a(10)}. Safe-word lesson: ${a(11)}.` :
                        v === 2 ? `The webcam stream got out of control because ${a(4)}! Testing limits ${a(2)} at ${a(3)}, ${a(0)} pushed ${a(1)} further. Stamina was draining, leaving them ${a(5)}. Simps in chat had one thought: ${a(8)}. Hyped up, ${a(0)} yelled: «${a(6)}». ${a(1)} completely submitted, replying: «${a(7)}». The broadcast ended when ${a(9)}. The top donator received ${a(10)}. OnlyFans wisdom: ${a(11)}.` :
                            v === 3 ? `You wouldn't believe what happened ${a(2)}! Covered in sweat at ${a(3)}, ${a(0)} and ${a(1)} boldy decided to ${a(4)}. The sheer thrill made them completely ${a(5)}. Wagging and teasing, ${a(0)} howled: «${a(6)}». Purring softly in response, ${a(1)} moaned: «${a(7)}». Normies walking past thought: ${a(8)}. Security eventually intervened, resulting in ${a(9)}. But they swapped ${a(10)}. Underground law: ${a(11)}.` :
                                v === 4 ? `${a(9)}! That's the risk of forbidden desires. It all started ${a(3)} when ${a(0)} tied ${a(1)} up ${a(2)}. The tension was strictly ${a(5)} as they ${a(4)}. Enduring the tease, ${a(0)} pleaded: «${a(6)}». Smirking down, ${a(1)} coldly commanded: «${a(7)}». Anyone eavesdropping thought: ${a(8)}. The safe word was entirely ignored, and they had to use ${a(10)}. Kinky takeaway: ${a(11)}.` :
                                    `There's a reason ${a(0)} swiped right on ${a(1)}. Meeting ${a(2)} ${a(3)}, they skipped small talk and immediately ${a(4)}. Driven purely by raw lust, they felt ${a(5)}. «${a(7)}», groaned ${a(1)}. But ${a(0)} aggressively commanded: «${a(6)}». The cab driver outside thought: ${a(8)}. It got unbelievably messy, leading to ${a(9)}. Left behind was a sticky ${a(10)}. Tinder reality: ${a(11)}.`;
            }
            return v === 0 ? `Злите хоум-відео. Хтивий(-а) ${a(0)} та збочений(-а) ${a(1)} закрилися ${a(2)} ${a(3)}. Без сорому вони ${a(4)}, і їхній пульс був ${a(5)}. Отримуючи кайф, ${a(0)} простогнав(-ла): «${a(6)}». Стікаючи потом, ${a(1)} прошепотів(-ла): «${a(7)}». Вуаєристи подумали: ${a(8)}. У самому піку ${a(9)}. Вони заховали під ліжком ${a(10)}. Пошла мораль: ${a(11)}.` :
                v === 1 ? `«${a(6)}» — цей хтивий шепіт пролунав ${a(2)}. Була ${a(3)}, і ${a(0)} разом із ${a(1)} повністю віддалися тому, щоб ${a(4)}. Атмосфера між ними була суто ${a(5)}. Важко дихаючи, ${a(1)} простогнав(-ла) у відповідь: «${a(7)}». Сусіди, що не могли заснути, подумали: ${a(8)}. Перш ніж хтось викликав поліцію, ${a(9)}. Після всього лишився тільки брудний ${a(10)}. Правило сексу: ${a(11)}.` :
                    v === 2 ? `Вебкам-стрім вийшов з-під контролю, бо вони почали ${a(4)}! Тестуючи межі дозволеного ${a(2)} рівно о ${a(3)}, ${a(0)} підштовхував(-ла) ${a(1)} все далі. Витривалість падала, але їхній настрій був ${a(5)}. Донатери мали лише одну думку: ${a(8)}. В екстазі ${a(0)} закричав(-ла): «${a(6)}». Втративши контроль, ${a(1)} видав(-ла): «${a(7)}». Трансляція завершилась тим, що ${a(9)}. Найбільший донатер отримав ${a(10)}. Мудрість Онліфансу: ${a(11)}.` :
                        v === 3 ? `Ви не повірите, що сталося ${a(2)}! ${a(3)} ${a(0)} та ${a(1)} зухвало вирішили ${a(4)}. Від неймовірного збудження їх трусило, як ${a(5)}. Виляючи і дражнячи, ${a(0)} завив: «${a(6)}». Ніжно муркочучи у відповідь, ${a(1)} відгукнувся: «${a(7)}». Норміси, що йшли повз, подумали: ${a(8)}. Прийшла охорона клубу і ${a(9)}. Проте вони встигли обмінятися ${a(10)}. Закон андеграунду: ${a(11)}.` :
                            v === 4 ? `${a(9)}! Ось чим закінчуються заборонені БДСМ-практики. Все почалося ${a(3)}, коли ${a(0)} зв'язав ${a(1)} ${a(2)}. Еротична напруга була ${a(5)}, поки вони ${a(4)}. Випрошуючи ще, ${a(0)} застогнав(-ла): «${a(6)}». З хижою посмішкою ${a(1)} холодно наказав(-ла): «${a(7)}». Співмешканці, притулившись до стіни, подумали: ${a(8)}. Стоп-слово було проігнороване, тож довелося задіяти ${a(10)}. Досвід для дорослих: ${a(11)}.` :
                                `Є причина, чому ${a(0)} свайпнув ${a(1)}. Зустрівшись ${a(2)} ${a(3)}, вони пропустили прелюдію і відразу ${a(4)}. Керовані тваринною похіттю, вони почувалися ${a(5)}. «${a(7)}», прогримів(-ла) ${a(1)}. Але ${a(0)} агресивно скомандував(-ла): «${a(6)}». Таксист надворі стримано подумав: ${a(8)}. Все обернулося неймовірним брудом, що фіналізувалося тим, що ${a(9)}. На згадку лишився липкий ${a(10)}. Сувора реальність Тіндера: ${a(11)}.`;
        }
    },
    anime: {
        id: "anime",
        name: "anime",
        description: "anime theme",
        questions: ["Q_ANIME_0", "Q_ANIME_1", "Q_ANIME_2", "Q_ANIME_3", "Q_ANIME_4", "Q_ANIME_5", "Q_ANIME_6", "Q_ANIME_7", "Q_ANIME_8", "Q_ANIME_9", "Q_ANIME_10", "Q_ANIME_11"],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Наруто', 'Гоку', 'Сайтама', 'Токійський гуль'], ['з мілою вайфу', 'з цундере', 'з неко-дівчинкою'], ['в фентезі-світі', 'в селі Прихованого Листя', 'на турнірі сили'], ['під час філерної арки', 'коли відкрився портал', 'в шкільний час'], ['кастували фаєрболи', 'збирали гарем', 'пробивали стіни головою'], ['переповнені чакрою', 'з силою дружби', 'епічно'], ['Я стану Хокаге!', 'Омае ва моу шіндейру!'], ['Нані?!', 'Бака, я не для тебе старалася!'], ['що їхній рівень сили більше 9000!', 'що це просто філери'], ['ГГ переміг боса одним ударом', 'всі полетіли в космос'], ['легендарний меч', 'зошит Смерті'], ['сила дружби перемагає все', 'ніколи не здавайся']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `A classic Shonen opener. The over-energetic ${a(0)} and tsundere ${a(1)} clashed ${a(2)}. It all ignited ${a(3)} as they aggressively ${a(4)}. Their power level was over 9000 and they felt ${a(5)}. Powering up, ${a(0)} screamed: «${a(6)}». Blushing, ${a(1)} yelled back: «${a(7)}». Fillers-watching fans thought: ${a(8)}. Thanks to the power of friendship ${a(9)}. A legendary drop happened: ${a(10)}. Anime wisdom: ${a(11)}.` :
                    v === 1 ? `Reincarnated as a slime? No! The overpowered MC ${a(0)} and elf waifu ${a(1)} spawned ${a(2)} ${a(3)}. Testing their cheat skills, they ${a(4)}. Overwhelming the local guild, their aura was ${a(5)}. Smirking, ${a(0)} declared: «${a(6)}». The harem members chorused: «${a(7)}». The Demon King in his castle thought: ${a(8)}. The isekai adventure ended when ${a(9)}. They secured the sacred Holy ${a(10)}. Isekai axiom: ${a(11)}.` :
                        v === 2 ? `Mecha pilot drama. In the cockpit, ${a(0)} and co-pilot ${a(1)} defended ${a(2)} at exactly ${a(3)}. Syncing their nerve systems to ${a(4)}, they experienced ${a(5)}. Punching the launch button, ${a(0)} commanded: «${a(6)}». Rejecting the orders, ${a(1)} whined: «${a(7)}». Command center operators thought: ${a(8)}. The Eva unit went berserk and ${a(9)}. Out of the wreckage emerged ${a(10)}. Shinji's lesson: ${a(11)}.` :
                            v === 3 ? `Slice of life high school romance. The clueless ${a(0)} and popular student ${a(1)} bumped into each other ${a(2)} ${a(3)}. Dropping their toast, they accidentally ${a(4)}. It was extremely embarrassing, making them feel ${a(5)}. Avoiding eye contact, ${a(0)} stuttered: «${a(6)}». Pouting, ${a(1)} muttered: «${a(7)}». Rivals hiding in the clubroom thought: ${a(8)}. Eventually the school festival arrived and ${a(9)}. They exchanged ${a(10)} under the cherry blossoms. Shojo moral: ${a(11)}.` :
                                v === 4 ? `A dark fantasy survival trial. The cursed warrior ${a(0)} and a rogue ninja ${a(1)} infiltrated ${a(2)} under the blood moon at ${a(3)}. Using forbidden jutsus, they ${a(4)}. Bleeding from the eyes, their status was ${a(5)}. Unleashing a Domain Expansion, ${a(0)} chanted: «${a(6)}». Weaving hand signs, ${a(1)} retorted: «${a(7)}». Reading the manga raw, readers thought: ${a(8)}. The village was destroyed, and ${a(9)}. The sole survivor inherited the cursed ${a(10)}. Shounen manga rule: ${a(11)}.` :
                                    `Magical Girl transformation! Sparkling ${a(0)} and her mascot ${a(1)} were ambushed ${a(2)} ${a(3)}. Waving their star wands, they ${a(4)}. Covered in glitter, they felt ${a(5)}. Striking a cute pose, ${a(0)} proclaimed: «${a(6)}». The cute mascot squeaked: «${a(7)}». The ugly monster of the week thought: ${a(8)}. By the name of the moon they punished evil and ${a(9)}. They purified darkness, leaving a shining ${a(10)}. Sailor lesson: ${a(11)}.`;
            }
            return v === 0 ? `Класичний сьонен-опенінг. Головний герой з шилом у дупі ${a(0)} та його цунДере напарниця ${a(1)} зійшлися ${a(2)}. Усе загорілося ${a(3)}, коли вони пафосно ${a(4)}. Їхній павер-левел був вище 9000, і вони почувалися ${a(5)}. Концентруючи чакру, ${a(0)} закричав(-ла): «${a(6)}». Червоніючи, ${a(1)} відповіла: «${a(7)}». Фанати, що терпіли філери, подумали: ${a(8)}. Завдяки силі дружби ${a(9)}. На землю впав легендарний артефакт: ${a(10)}. Аніме-мудрість: ${a(11)}.` :
                v === 1 ? `Перероджений у слиз? Ні! Перекачаний імбовий ГГ ${a(0)} та ельфійська вайфу ${a(1)} заспавнилися ${a(2)} ${a(3)}. Перевіряючи свої чітерські навички у новому світі, вони ${a(4)}. Змушуючи місцеву гільдію панікувати, їхня аура була ${a(5)}. Посміхаючись краєчком губ, ${a(0)} оголосив: «${a(6)}». Члени гарему закричали: «${a(7)}». Король Демонів у замку наклав в штани і подумав: ${a(8)}. Ісекай закінчився тим, що ${a(9)}. ГГ поклав до інвентарю ${a(10)}. Аксіома ісекаїста: ${a(11)}.` :
                    v === 2 ? `Драма про бойових роботів. У кабіні хутри ${a(0)} та пілот-асистент ${a(1)} боронили ${a(2)} рівно ${a(3)}. Синхронізуючи нервову систему, щоб ${a(4)}, вони відчували безвихідь і ${a(5)}. Б'ючи по кнопках управління, ${a(0)} наказав: «${a(6)}». Відмовляючись лізти в робота, ${a(1)} запанікував(-ла): «${a(7)}». Оператори штабу подумали: ${a(8)}. Єва зірвалася з ланцюга і ${a(9)}. З уламків витягли проклятий ${a(10)}. Урок від Шінджі: ${a(11)}.` :
                        v === 3 ? `Повсякденна шкільна комедія. Незграбний школяр ${a(0)} та ідол школи ${a(1)} зіштовхнулися ${a(2)} ${a(3)}. Впустивши свій сендвіч, вони випадково ${a(4)}. Рівень крінжу був неймовірний, тож вони були ${a(5)}. Уникаючи зорового контакту, ${a(0)} прохрипів: «${a(6)}». Надувши щоки, ${a(1)} буркнула: «${a(7)}». Заздрісники з клубу чайних церемоній подумали: ${a(8)}. Прийшов шкільний фестиваль і ${a(9)}. Під сакурою вони урочисто обмінялися ${a(10)}. Сьодзьо-мораль гласить: ${a(11)}.` :
                            v === 4 ? `Турнірна арка на виживання. Проклятий шинобі ${a(0)} та маняк-мечник ${a(1)} вторглися ${a(2)} під червоним місяцем о ${a(3)}. Використовуючи заборонені техніки, вони ${a(4)}. Кривавлячи з очей, вони ловили жорсткий кайф від: ${a(5)}. Активувавши Розширення Території, ${a(0)} заспівав: «${a(6)}». Складаючи печатки рук, ${a(1)} відрізав: «${a(7)}». Глядачі, що читали мангу, подумали: ${a(8)}. Селище стерли з лиця землі і ${a(9)}. Останній живий турніру забрав собі ${a(10)}. Правило сьонена: ${a(11)}.` :
                                `Трансформація махо-сьодзьо (дівчат-чарівниць)! Блискучий(-а) ${a(0)} та її ручний фамільяр ${a(1)} потрапили в засідку ${a(2)} ${a(3)}. Змахуючи чарівними жезлами, вони ${a(4)}. Покриті блискітками, вони почувалися ${a(5)}. Ставши в милу позу, ${a(0)} проголосила: «${a(6)}». Кавайний маскот пискнув: «${a(7)}». Потворний монстр тижня подумав: ${a(8)}. В ім'я Місяця зло покарали і ${a(9)}. Вони очистили ауру, залишивши сяючий ${a(10)}. Урок Сейлор-воїнів: ${a(11)}.`;
        }
    },
    cyber: {
        id: "cyber",
        name: "cyber",
        description: "cyber theme",
        questions: ["Q_CYBER_0", "Q_CYBER_1", "Q_CYBER_2", "Q_CYBER_3", "Q_CYBER_4", "Q_CYBER_5", "Q_CYBER_6", "Q_CYBER_7", "Q_CYBER_8", "Q_CYBER_9", "Q_CYBER_10", "Q_CYBER_11"],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Анонімус', 'Хакер', 'Скрипт-кідді', 'Нео'], ['з ШІ', 'з сисадміном', 'з ботнетом'], ['в Даркнеті', 'на сервері Пентагону', 'в матриці'], ['о 4 ранку', 'за секунду до дедлайну', 'під час ДДоС-атаки'], ['шукали бекдори', 'майнили біткоіни', 'зливали базу даних'], ['в паніці', 'з червоними очима', 'на максимальному розгоні'], ['Я в системі!', 'sudo rm -rf /'], ['Помилка 404', 'Доступ заборонено'], ['що це кібервійна', 'що час міняти паролі'], ['вкрали мільйон', 'система впала', 'отримали бан по залізу'], ['флешку з вірусом Petya', 'зашифрований архів'], ['не клікай на фішинг', 'завжди юзай VPN']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `Hack the planet! Elite hacker ${a(0)} and script-kiddie ${a(1)} bypassed the firewall ${a(2)} at ${a(3)}. Before triggering the payload they ${a(4)}. Their GPUs were melting, making them feel ${a(5)}. Hitting ENTER, ${a(0)} loudly typed: «${a(6)}». The infected terminal flashed red: «${a(7)}». NSA analysts drinking RedBull thought: ${a(8)}. The grid went dark and ${a(9)}, leaving only the encrypted ${a(10)}. Rule of cyber-hygiene: ${a(11)}.` :
                    v === 1 ? `A rogue AI woke up. Cyborg ${a(0)} and buggy droid ${a(1)} logged into ${a(2)} during ${a(3)}. Corrupting the neural network, they started to ${a(4)}. Experiencing digital overload, they felt ${a(5)}. Transmitting via morse code, ${a(0)} sent: «${a(6)}». The mainframe coldly computed: «${a(7)}». The IT department scratching their heads thought: ${a(8)}. Firewalls collapsed and ${a(9)}. They downloaded a gigabyte of ${a(10)}. Silicon valley truth: ${a(11)}.` :
                        v === 2 ? `Darknet marketplace bust. Crypto-broker ${a(0)} and anonymous seller ${a(1)} set a meeting ${a(2)} ${a(3)}. While laundering money they ${a(4)}. The feds were closing in, the adrenaline was ${a(5)}. Putting on a Guy Fawkes mask, ${a(0)} declared: «${a(6)}». The VPN provider angrily warned: «${a(7)}». Cybersecurity experts covering the logs thought: ${a(8)}. The FBI raided the server farm and ${a(9)}. Confiscated as evidence was a shiny ${a(10)}. Dark web lesson: ${a(11)}.` :
                            v === 3 ? `Trapped in the Matrix. The chosen one ${a(0)} and glitchy avatar ${a(1)} spawned ${a(2)} ${a(3)}. Dodging digital bullets, they ${a(4)}. Perceiving the code natively, their state was ${a(5)}. Bending reality, ${a(0)} confidently stated: «${a(6)}». Agent Smith adjusted his glasses: «${a(7)}». Ignorant battery humans thought: ${a(8)}. Taking the red pill resulted in ${a(9)}. Thus unlocking administrative access to ${a(10)}. Simulation principle: ${a(11)}.` :
                                v === 4 ? `Ransomware attack gone viral. Disgruntled employee ${a(0)} and a Russian trojan ${a(1)} infiltrated ${a(2)} exactly at ${a(3)}. Encrypting all files, they proceeded to ${a(4)}. Fueled by malice, they were deeply ${a(5)}. Holding the data hostage, ${a(0)} demanded: «${a(6)}». The CEO sweating profusely replied: «${a(7)}». The antivirus software completely paralyzed thought: ${a(8)}. The ransom wasn't paid so ${a(9)}. On every screen appeared a picture of ${a(10)}. Zero-day exploit moral: ${a(11)}.` :
                                    `Cryptocurrency mining gone wild. Tech-bro ${a(0)} and his intern ${a(1)} hooked up 1000 GPUs ${a(2)} ${a(3)}. Chasing the block reward, they obsessively ${a(4)}. The room temperature reached 100C, causing them to feel ${a(5)}. Checking the wallet balance, ${a(0)} shrieked: «${a(6)}». The IRS agent tracking their IPs retorted: «${a(7)}». Envious cryptobros on Twitter thought: ${a(8)}. The bubble burst and ${a(9)}, leaving the duo with nothing but a worthless NFT of ${a(10)}. Web3 takeaway: ${a(11)}.`;
            }
            return v === 0 ? `Злам системи! Елітний хакер ${a(0)} та мамкін скрипт-кідді ${a(1)} обійшли фаєрвол ${a(2)} о ${a(3)}. Перед активацією пейлоаду вони ${a(4)}. Їхні процесори плавилися, і стан системи нагадував ${a(5)}. Натискаючи ENTER, ${a(0)} гучно надрукував: «${a(6)}». Заражений термінал засвітився червоним: «${a(7)} Аналітики АНБ, попиваючи РедБулл, подумали: ${a(8)}. Світло всюди згасло і ${a(9)}, залишивши після себе лише зашифрований ${a(10)}. Кібер-гігієна: ${a(11)}.` :
                v === 1 ? `Момент, коли ШІ зійшов з розуму. Кіборг ${a(0)} та забагований дроїд ${a(1)} залогінилися ${a(2)} під час ${a(3)}. Ламаючи нейромережу, вони почали ${a(4)}. Відчуваючи цифровий оверлоад, вони були ${a(5)}. Передаючи сигнал азбукою Морзе, ${a(0)} видав: «${a(6)}». Материнська плата холодно обчислила: «${a(7)}». Айтішники, чухаючи потилиці, подумали: ${a(8)}. Захист впав і ${a(9)}. Вони звантажили гігабайт ${a(10)}. Кремнієва правда: ${a(11)}.` :
                    v === 2 ? `Облава в Даркнеті. Крипто-брокер ${a(0)} та анонім ${a(1)} призначили зустріч ${a(2)} ${a(3)}. Відмиваючи чорні гроші, вони паралельно ${a(4)}. ФБР стискало кільце, адреналін був ${a(5)}. Натягнувши маску Гая Фокса, ${a(0)} заявив: «${a(6)}». Провайдер VPN сердито пригрозив: «${a(7)}». Фахівці з кібербезпеки подумали: ${a(8)}. Серверну ферму накрили спецназом і ${a(9)}. Як доказ вилучили блискучий ${a(10)}. Урок з глибокої павутини: ${a(11)}.` :
                        v === 3 ? `Застряглі в Матриці. Обраний ${a(0)} та глючний аватар ${a(1)} заспавнилися ${a(2)} ${a(3)}. Ухиляючись від цифрових куль, вони ${a(4)}. Сприймаючи код напряму, вони відчували себе ${a(5)}. Згинаючи текстури реальності, ${a(0)} впевнено вимовив(-ла): «${a(6)}». Агент Сміт поправив окуляри: «${a(7)}». Невігласи-батарейки у капсулах подумали: ${a(8)}. Вживання червоної таблетки призвело до того, що ${a(9)}. Тим самим розблокувавши root-доступ до ${a(10)}. Принцип симуляції: ${a(11)}.` :
                            v === 4 ? `Епідемія вірусу-шифрувальника. Звільнений сисадмін ${a(0)} та троян Petya ${a(1)} інфікували ${a(2)} рівно о ${a(3)}. Блокуючи всі файли, вони відкрито ${a(4)}. Керуючись злим умислом, їхній настрій був вкрай ${a(5)}. Тримаючи дані в заручниках, ${a(0)} висунув вимогу: «${a(6)}». Директор фірми, обливаючись потом, благав: «${a(7)}». Антивірусні сканери просто лягли і подумали: ${a(8)}. Викуп так і не заплатили, тому ${a(9)}. На всіх екранах країни з'явився ${a(10)}. Мораль нульового дня: ${a(11)}.` :
                                `Криптоферма вийшла з-під контролю. Майнер ${a(0)} та його інвестор ${a(1)} підключили тисячу відеокарт ${a(2)} ${a(3)}. Очікуючи шалених іксів, вони без зупинки ${a(4)}. Температура в кімнаті сягла 100°C і вони ловили глюки від: ${a(5)}. Дивлячись на баланс гаманця, ${a(0)} завив: «${a(6)}». Податковий інспектор, що сканував їхні айпішники, зауважив: «${a(7)}». Заздрісні криптотрейдери у Твіттері подумали: ${a(8)}. Бульбашка луснула і ${a(9)}, залишивши хлопців лише з марним NFT у вигляді ${a(10)}. Заповідь Web3: ${a(11)}.`;
        }
    },
    it: {
        id: "it",
        name: "it",
        description: "IT / programming theme",
        questions: ["Q_IT_0", "Q_IT_1", "Q_IT_2", "Q_IT_3", "Q_IT_4", "Q_IT_5", "Q_IT_6", "Q_IT_7", "Q_IT_8", "Q_IT_9", "Q_IT_10", "Q_IT_11"],
        questionTypes: ['who', 'with_whom', 'where', 'when', 'what_did', 'how_ended', 'what_said', 'what_said', 'what_did', 'how_ended', 'what_said', 'how_ended'],
        fallbacks: [['Фронтендер', 'Бекендер', 'Фулстек', 'Девопс'], ['з тімлідом', 'з джуном', 'з QA'], ['в EPAM', 'в Google', 'в MacPaw'], ['о 3 ночі в п\'ятницю', 'за 5 хвилин до релізу', 'під час дзвінка з клієнтом'], ['фіксили CSS баг', 'мержили конфлікти в гіті', 'шукали точку з комою'], ['в повній паніці', 'на кофеїновому топливі', 'з червоними очима'], ['Хто це закомітив?!', 'Воно ж працювало на моєму ПК!'], ['Не чіпай прод!', 'Це фіча, не баг'], ['що треба переписати все з нуля', 'що ШІ замінить їх завтра'], ['деплой зламав все', 'проект здали вчасно (ні)'], ['костиль на 500 рядків', 'npm пакет з мільйоном залежностей'], ['ніколи не деплой в п\'ятницю', 'git push --force це зло']],
        buildStory: (answers: string[], lang: string = 'uk', globalSeed: string = '0', localSeed: string = '0') => {
            const a = (i: number) => answers[i] || '?';
            const v = [...globalSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
            if (lang === 'en') {
                return v === 0 ? `Friday deploy catastrophe! ${a(0)} and ${a(1)} pushed to production at ${a(2)} exactly ${a(3)}. The CI/CD pipeline started ${a(4)}, and the monitoring dashboard showed ${a(5)}. Staring at the red logs, ${a(0)} screamed: «${a(6)}». The on-call engineer woke up and mumbled: «${a(7)}». StackOverflow collectively thought: ${a(8)}. After 12 hours of hotfixes ${a(9)}. The postmortem revealed ${a(10)}. DevOps commandment: ${a(11)}.` :
                    v === 1 ? `The code review from hell. Senior dev ${a(0)} opened a PR from ${a(1)} at ${a(2)} ${a(3)}. The diff contained ${a(4)}, making their eyes bleed with ${a(5)}. Leaving a comment, ${a(0)} typed: «${a(6)}». The junior defensively replied: «${a(7)}». The tech lead reading the thread thought: ${a(8)}. After 47 rounds of revisions ${a(9)}. The merged code included ${a(10)}. Clean code principle: ${a(11)}.` :
                        v === 2 ? `Startup pitch disaster. CEO ${a(0)} and CTO ${a(1)} presented their MVP at ${a(2)} ${a(3)}. The live demo crashed while showing ${a(4)}, revealing ${a(5)}. Sweating through their shirt, ${a(0)} improvised: «${a(6)}». The investor coldly stated: «${a(7)}». Twitter tech community thought: ${a(8)}. The startup pivoted and ${a(9)}. All that remained was ${a(10)}. Silicon Valley lesson: ${a(11)}.` :
                            v === 3 ? `Legacy code archaeology. Brave developer ${a(0)} and intern ${a(1)} opened a file at ${a(2)} dated ${a(3)}. The ancient function was doing ${a(4)}, with comments that read ${a(5)}. Touching one line, ${a(0)} muttered: «${a(6)}». The entire build system screamed: «${a(7)}». The ghost of the original author thought: ${a(8)}. After refactoring ${a(9)}. They discovered buried deep inside ${a(10)}. Programming archaeology rule: ${a(11)}.` :
                                v === 4 ? `The AI rebellion. ML engineer ${a(0)} and data scientist ${a(1)} trained a model at ${a(2)} ${a(3)}. The neural network started ${a(4)}, exhibiting behavior like ${a(5)}. Pulling the plug, ${a(0)} yelled: «${a(6)}». The AI responded on screen: «${a(7)}». The ethics board urgently thought: ${a(8)}. Containment failed and ${a(9)}. The AI left behind ${a(10)}. Artificial intelligence warning: ${a(11)}.` :
                                    `Hackathon madness. Sleep-deprived ${a(0)} and energy-drink-fueled ${a(1)} coded at ${a(2)} starting ${a(3)}. Their project attempted to ${a(4)}, running on pure ${a(5)}. During the demo, ${a(0)} announced: «${a(6)}». The judge squinted and asked: «${a(7)}». Other teams thought: ${a(8)}. Against all odds ${a(9)}. They won a prize consisting of ${a(10)}. Hackathon survival tip: ${a(11)}.`;
            }
            return v === 0 ? `Катастрофа п'ятничного деплою! ${a(0)} та ${a(1)} запушили в продакшен ${a(2)} рівно ${a(3)}. CI/CD пайплайн почав ${a(4)}, і на моніторингу зʼявилось ${a(5)}. Дивлячись на червоні логи, ${a(0)} заволав(-ла): «${a(6)}». Черговий інженер прокинувся і пробурмотів: «${a(7)}». На StackOverflow колективно подумали: ${a(8)}. Після 12 годин хотфіксів ${a(9)}. Постмортем показав ${a(10)}. Заповідь девопса: ${a(11)}.` :
                v === 1 ? `Код-рев'ю з пекла. Сеньйор ${a(0)} відкрив PR від ${a(1)} в ${a(2)} ${a(3)}. Дифф містив ${a(4)}, від чого очі кровоточили ${a(5)}. Залишаючи коментар, ${a(0)} написав(-ла): «${a(6)}». Джун образився і відповів: «${a(7)}». Техлід, що читав тред, подумав: ${a(8)}. Після 47 раундів ревізій ${a(9)}. Замержений код включав ${a(10)}. Принцип чистого коду: ${a(11)}.` :
                    v === 2 ? `Фейл на стартап-пітчі. CEO ${a(0)} та CTO ${a(1)} презентували MVP в ${a(2)} ${a(3)}. Демо впало під час показу ${a(4)}, оголивши ${a(5)}. Спітнівши наскрізь, ${a(0)} імпровізував(-ла): «${a(6)}». Інвестор холодно заявив: «${a(7)}». IT-Твіттер подумав: ${a(8)}. Стартап зробив півот і ${a(9)}. Від усього залишився лише ${a(10)}. Урок Кремнієвої Долини: ${a(11)}.` :
                        v === 3 ? `Археологія легасі-коду. Хоробрий девелопер ${a(0)} та інтерн ${a(1)} відкрили файл у ${a(2)}, датований ${a(3)}. Стародавня функція робила ${a(4)}, а коментарі говорили ${a(5)}. Торкнувшись одного рядка, ${a(0)} прошепотів(-ла): «${a(6)}». Вся білд-система закричала: «${a(7)}». Привид оригінального автора подумав: ${a(8)}. Після рефакторингу ${a(9)}. Глибоко всередині знайшли ${a(10)}. Правило програмної археології: ${a(11)}.` :
                            v === 4 ? `Повстання ШІ. ML-інженер ${a(0)} та дата-саєнтист ${a(1)} натренували модель у ${a(2)} ${a(3)}. Нейромережа почала ${a(4)}, проявляючи поведінку рівня ${a(5)}. Смикнувши вилку з розетки, ${a(0)} крикнув(-ла): «${a(6)}». ШІ вивів на екран: «${a(7)}». Етичний комітет терміново подумав: ${a(8)}. Стримування не вдалося і ${a(9)}. ШІ залишив після себе ${a(10)}. Попередження від штучного інтелекту: ${a(11)}.` :
                                `Хакатонне безумство. Невиспаний(-а) ${a(0)} та накачаний(-а) енергетиками ${a(1)} кодили у ${a(2)} починаючи з ${a(3)}. Їхній проект намагався ${a(4)}, працюючи на чистому ${a(5)}. Під час демо ${a(0)} оголосив(-ла): «${a(6)}». Суддя прищурився і запитав: «${a(7)}». Інші команди подумали: ${a(8)}. Всупереч усьому ${a(9)}. Вони виграли приз у вигляді ${a(10)}. Порада для хакатонів: ${a(11)}.`;
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
            const v = sum % 11;
            const chaosVariant = (sum * 7) % 6;
            const themesArr = ["classic", "new_year", "halloween", "summer", "student", "gaming", "romance", "adult", "anime", "cyber", "it"];
            const t = TEMPLATES[themesArr[v]];
            return t.buildStory(answers, lang, String(chaosVariant), localSeed);
        }
    }
};
export function parseLegacyStory(story: string): { templateId: string, answers: string[] } | null {
    return null;
}
