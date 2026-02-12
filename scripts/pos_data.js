// scripts/pos_data.js

// Список слов с указанием части речи
// pos: "noun" | "verb" | "adj"
const POS_WORDS = [
    // существительные
    { text: "кот", pos: "noun" },
    { text: "рыба", pos: "noun" },
    { text: "мальчик", pos: "noun" },
    { text: "девочка", pos: "noun" },
    { text: "птица", pos: "noun" },
    { text: "собака", pos: "noun" },
    { text: "цветок", pos: "noun" },
    { text: "мяч", pos: "noun" },

    // глаголы
    { text: "читает", pos: "verb" },
    { text: "бежит", pos: "verb" },
    { text: "играет", pos: "verb" },
    { text: "поёт", pos: "verb" },
    { text: "ловит", pos: "verb" },
    { text: "рисует", pos: "verb" },

    // прилагательные
    { text: "красивый", pos: "adj" },
    { text: "быстрый", pos: "adj" },
    { text: "весёлый", pos: "adj" },
    { text: "яркий", pos: "adj" },
    { text: "маленький", pos: "adj" },
    { text: "большой", pos: "adj" }
];

// Настройки сложности для режима сортировки
const POS_CONFIG = {
    easy: {
        label: "Лёгкая",
        timeLimit: 30,
        wordsCount: 8
    },
    medium: {
        label: "Средняя",
        timeLimit: 25,
        wordsCount: 12
    },
    hard: {
        label: "Сложная",
        timeLimit: 25,
        wordsCount: 15
    }
};
