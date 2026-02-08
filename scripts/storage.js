// js/storage.js

// Ключи для хранения данных в localStorage
const STORAGE_KEYS = {
    PLAYER_NAME: "funtext_player_name",              // имя игрока
    BEST_SCORE: "funtext_best_score",                // лучший результат (число)
    BEST_SCORE_WITH_PLAYER: "funtext_best_score_with_player", // лучший результат + имя
    RECENT_GAMES: "funtext_recent_games"             // старый глобальный ключ (не используется)
};

// Сохранение имени игрока
function savePlayerName(name) {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
}

// Загрузка имени игрока
function loadPlayerName() {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || "";
}

// Генерация уникального ключа истории для каждого игрока
function _recentGamesKeyForPlayer(player) {
    const safe = (player || "Игрок").trim().replace(/\s+/g, "_");
    return `${STORAGE_KEYS.RECENT_GAMES}_${safe}`;
}

// Сохранение результата игры для конкретного игрока
function saveGameResultForPlayer(player, score, difficulty) {
    const key = _recentGamesKeyForPlayer(player);
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];

    const entry = {
        player: player || "Игрок",
        score: Number(score) || 0,
        difficulty: difficulty || "",
        date: new Date().toISOString()
    };

    arr.unshift(entry);          // добавляем запись в начало
    const trimmed = arr.slice(0, 5); // храним только последние 5 игр
    localStorage.setItem(key, JSON.stringify(trimmed));
}

// Загрузка последних игр игрока
function loadRecentGamesForPlayer(player) {
    const key = _recentGamesKeyForPlayer(player);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
}

// Сохранение глобального рекорда (очки + имя)
function saveBestScoreWithPlayer(player, score) {
    const current = loadBestScoreWithPlayer();
    const s = Number(score) || 0;

    // сохраняем только если результат лучше предыдущего
    if (!current || s > current.score) {
        const entry = {
            player: player || "Игрок",
            score: s,
            date: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.BEST_SCORE_WITH_PLAYER, JSON.stringify(entry));
    }
}

// Загрузка глобального рекорда
function loadBestScoreWithPlayer() {
    const raw = localStorage.getItem(STORAGE_KEYS.BEST_SCORE_WITH_PLAYER);
    return raw ? JSON.parse(raw) : null;
}

// Сохранение лучшего результата (только число)
function saveBestScore(score) {
    localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(score));

    // если нет записи с именем — создаём
    const current = loadBestScoreWithPlayer();
    if (!current) {
        saveBestScoreWithPlayer(loadPlayerName() || "Игрок", Number(score) || 0);
    }
}

// Загрузка лучшего результата (число)
function loadBestScore() {
    const raw = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
    return raw ? Number(raw) : 0;
}
