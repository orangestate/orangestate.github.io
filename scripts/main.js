// js/main.js — экраны, запуск режимов, лидерборды

document.addEventListener("DOMContentLoaded", () => {

    // Экраны
    const authScreen = document.getElementById("auth-screen");
    const menuScreen = document.getElementById("menu-screen");
    const gameScreen = document.getElementById("game-screen");
    const posScreen = document.getElementById("pos-screen");
    const objectsScreen = document.getElementById("objects-screen");

    // Кнопки
    const authStartBtn = document.getElementById("auth-start-btn");
    const startGameBtn = document.getElementById("start-game-btn");
    const nextRoundBtn = document.getElementById("next-round-btn");
    const backToMenuBtn = document.getElementById("back-to-menu-btn");
    const backToAuthBtn = document.getElementById("back-to-auth-btn");
    const posBackBtn = document.getElementById("pos-back-btn");
    const objectsBackBtn = document.getElementById("objects-back-btn");

    // Поля
    const playerNameInput = document.getElementById("player-name");
    const menuPlayerName = document.getElementById("menu-player-name");
    const difficultySelect = document.getElementById("difficulty");
    const modeSelect = document.getElementById("mode");

    // Лидерборд
    const leaderboardContainer = document.getElementById("leaderboard");

    // Показ экрана
    function showScreen(screen) {
        [authScreen, menuScreen, gameScreen, posScreen, objectsScreen]
            .forEach(s => s.classList.remove("active"));
        screen.classList.add("active");
    }

    // Отрисовка таблицы лидеров
    function renderLeaderboard() {
        const mode = modeSelect.value;
        const list = loadLeaderboard(mode);

        leaderboardContainer.innerHTML = "";

        if (!list.length) {
            leaderboardContainer.textContent = "Пока нет рекордов.";
            return;
        }

        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.padding = "0";

        list.forEach(entry => {
            const li = document.createElement("li");
            const date = new Date(entry.date).toLocaleString();
            li.textContent = `${entry.player} — ${entry.score} очк. — ${date}`;
            li.style.padding = "6px 0";
            ul.appendChild(li);
        });

        leaderboardContainer.appendChild(ul);
    }

    // Загружаем имя игрока
    const savedName = loadPlayerName();
    if (savedName) {
        playerNameInput.value = savedName;
        menuPlayerName.textContent = savedName;
    }

    // Авторизация
    authStartBtn.addEventListener("click", () => {
        const name = playerNameInput.value.trim();
        if (!name) {
            alert("Введите имя игрока");
            return;
        }

        savePlayerName(name);
        menuPlayerName.textContent = name;

        showScreen(menuScreen);
        renderLeaderboard();
    });

    // Запуск игры
    startGameBtn.addEventListener("click", () => {
        const name = playerNameInput.value.trim() || loadPlayerName() || "Игрок";
        const diffKey = difficultySelect.value;
        const mode = modeSelect.value;

        if (mode === "assemble") {
            Game.setPlayerName(name);
            Game.setDifficulty(diffKey);

            document.getElementById("game-player-name").textContent = name;
            document.getElementById("game-difficulty-label").textContent =
                DIFFICULTY_CONFIG[diffKey].label;

            showScreen(gameScreen);
            Game.init(name, diffKey);
        }

        if (mode === "pos") {
            document.getElementById("pos-player-name").textContent = name;
            showScreen(posScreen);
            PosGame.init(diffKey);
        }

        if (mode === "objects") {
            document.getElementById("objects-player-name").textContent = name;
            document.getElementById("objects-difficulty-label").textContent =
                OBJECT_CONFIG[diffKey].label;

            showScreen(objectsScreen);
            ObjectsGame.init(diffKey);
        }
    });

    // Возврат из режима 1
    backToMenuBtn.addEventListener("click", () => {
        Game.forceFinishToMenu();
        Game.stop();

        showScreen(menuScreen);
        document.getElementById("confetti").classList.add("hidden");
        renderLeaderboard();
    });

    // Возврат из режима 2
    posBackBtn.addEventListener("click", () => {
        PosGame.forceFinishToMenu();

        showScreen(menuScreen);
        document.getElementById("confetti").classList.add("hidden");
        document.getElementById("pos-final-result").classList.add("hidden");
        posScreen.classList.remove("game-ended");

        renderLeaderboard();
    });

    // Возврат из режима 3
    objectsBackBtn.addEventListener("click", () => {
        ObjectsGame.forceFinishToMenu();
        ObjectsGame.stop();

        showScreen(menuScreen);
        document.getElementById("confetti").classList.add("hidden");
        document.getElementById("objects-final-result").classList.add("hidden");
        objectsScreen.classList.remove("game-ended");

        renderLeaderboard();
    });

    // Выход в авторизацию
    backToAuthBtn.addEventListener("click", () => {
        Game.stop();
        ObjectsGame.stop();
        showScreen(authScreen);
    });

    // Обновление таблицы при смене режима
    modeSelect.addEventListener("change", () => {
        renderLeaderboard();
    });

    // Первичная отрисовка
    renderLeaderboard();
});
