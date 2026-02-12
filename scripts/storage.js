// js/storage.js — имя игрока и таблицы лидеров

// Имя игрока
const STORAGE_KEYS = {
    PLAYER_NAME: "funtext_player_name"
};

// Сохранить имя
function savePlayerName(name) {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
}

// Загрузить имя
function loadPlayerName() {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || "";
}



// Таблицы лидеров

// Ключ для режима
function _leaderboardKey(mode) {
    return `funtext_leaderboard_${mode}`;
}

// Загрузить таблицу
function loadLeaderboard(mode) {
    const raw = localStorage.getItem(_leaderboardKey(mode));
    return raw ? JSON.parse(raw) : [];
}

// Сохранить результат
function saveToLeaderboard(mode, player, score) {
    const key = _leaderboardKey(mode);
    const list = loadLeaderboard(mode);

    const entry = {
        player: player || "Игрок",
        score: Number(score) || 0,
        date: new Date().toISOString()
    };

    // Ищем игрока в таблице
    const existing = list.find(e => e.player === entry.player);

    if (existing) {
        // Если новый результат лучше — обновляем
        if (entry.score > existing.score) {
            existing.score = entry.score;
            existing.date = entry.date;
        }
    } else {
        // Если игрока нет — добавляем
        list.push(entry);
    }

    // Сортируем по убыванию
    list.sort((a, b) => b.score - a.score);

    // Оставляем только ТОП‑5
    const trimmed = list.slice(0, 5);

    localStorage.setItem(key, JSON.stringify(trimmed));
}

