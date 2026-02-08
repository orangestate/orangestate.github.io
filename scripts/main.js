// js/main.js

document.addEventListener("DOMContentLoaded", () => {

    // Экранные блоки
    const authScreen = document.getElementById("auth-screen");
    const menuScreen = document.getElementById("menu-screen");
    const gameScreen = document.getElementById("game-screen");

    // Кнопки управления
    const authStartBtn = document.getElementById("auth-start-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const nextRoundBtn = document.getElementById("next-round-btn");
    const backToMenuBtn = document.getElementById("back-to-menu-btn");
    const backToAuthBtn = document.getElementById("back-to-auth-btn"); // кнопка выхода в логин

    // Поля ввода и элементы интерфейса
    const playerNameInput = document.getElementById("player-name");
    const menuPlayerName = document.getElementById("menu-player-name");
    const difficultySelect = document.getElementById("difficulty");

    // Получение лучшего результата игрока
    function getBestScoreForPlayer(player) {
        const list = loadRecentGamesForPlayer(player);
        if (!list || list.length === 0) return 0;
        return Math.max(...list.map(entry => entry.score));
    }

    // Обновление отображения лучшего результата
    function updatePlayerBestScore(name) {
        const best = getBestScoreForPlayer(name);
        const el = document.getElementById("best-score");
        if (el) el.textContent = best;
    }

    // Автозагрузка имени игрока при входе
    const savedName = loadPlayerName();
    if (savedName) {
        playerNameInput.value = savedName;
        menuPlayerName.textContent = savedName;
        updatePlayerBestScore(savedName);
    }

    // Переключение экранов
    function showScreen(screen) {
        [authScreen, menuScreen, gameScreen].forEach(s => s.classList.remove("active"));
        screen.classList.add("active");
    }

    // Отрисовка последних игр игрока
    function renderRecentGames() {
        const container = document.getElementById("recent-games");
        if (!container) return;

        const currentPlayer = (playerNameInput.value || loadPlayerName() || "").trim();
        container.innerHTML = "";

        if (!currentPlayer) {
            container.textContent = "Введите имя, чтобы увидеть вашу историю.";
            return;
        }

        const list = loadRecentGamesForPlayer(currentPlayer);
        if (!list || list.length === 0) {
            container.textContent = "У вас ещё нет сохранённых игр.";
            return;
        }

        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.padding = "0";

        list.forEach(entry => {
            const li = document.createElement("li");
            const date = new Date(entry.date).toLocaleString();
            li.textContent = `${entry.player} — ${entry.score} очк. — ${entry.difficulty} — ${date}`;
            li.style.padding = "6px 0";
            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    // Отображение глобального рекорда
    function renderGlobalRecord() {
        const el = document.getElementById("global-record");
        if (!el) return;

        const best = loadBestScoreWithPlayer();
        if (best) {
            const date = new Date(best.date).toLocaleString();
            el.textContent = `${best.player} — ${best.score} очк. (${date})`;
        } else {
            el.textContent = "—";
        }
    }

    // Кнопка "Продолжить" на экране логина
    authStartBtn.addEventListener("click", () => {
        const name = playerNameInput.value.trim();
        if (!name) {
            alert("Введите имя игрока");
            return;
        }

        savePlayerName(name);
        menuPlayerName.textContent = name;

        updatePlayerBestScore(name);
        renderRecentGames();
        renderGlobalRecord();
        showScreen(menuScreen); // переход в меню
    });

    // Кнопка "Начать игру"
    startGameBtn.addEventListener("click", () => {
        const name = playerNameInput.value.trim() || loadPlayerName() || "Игрок";
        const diffKey = difficultySelect.value;

        Game.setPlayerName(name);
        Game.setDifficulty(diffKey);

        document.getElementById("game-player-name").textContent = name;
        document.getElementById("game-difficulty-label").textContent =
            DIFFICULTY_CONFIG[diffKey].label;

        showScreen(gameScreen); // переход в игру
        Game.init(name, diffKey);
    });

    // Кнопка "Следующее предложение"
    nextRoundBtn.addEventListener("click", () => {
        Game.nextRound();
    });

    // Кнопка "В меню" на игровом экране
    backToMenuBtn.addEventListener("click", () => {
        Game.stop();
        showScreen(menuScreen);
        renderRecentGames();
        renderGlobalRecord();
        document.getElementById("confetti").classList.add("hidden");
        updatePlayerBestScore(playerNameInput.value.trim());
    });

    // Кнопка "Выйти" из меню → возвращает на логин
    backToAuthBtn.addEventListener("click", () => {
        Game.stop();
        showScreen(authScreen);
    });

    // Первичная отрисовка данных
    renderRecentGames();
    renderGlobalRecord();
});
