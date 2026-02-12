// scripts/objects_game.js
// Режим 3: выбор объектов по признаку

const ObjectsGame = (function () {

    let state = {
        running: false,
        timeLeft: 0,
        timerId: null,
        score: 0,
        round: 0,
        roundsTotal: 0,
        difficultyKey: "easy",
        playerName: "",
        currentQuestion: null,
        currentObjects: [],
        selected: new Set()
    };

    // Перемешивание массива
    function shuffle(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }

    // Сообщение
    function setMessage(text, type = "") {
        const el = document.getElementById("objects-message");
        if (!el) return;
        el.textContent = text;
        el.className = "message";
        if (type) el.classList.add(type);
    }

    // Обновление шапки
    function updateHeader() {
        const cfg = OBJECT_CONFIG[state.difficultyKey];
        document.getElementById("objects-player-name").textContent = state.playerName;
        document.getElementById("objects-difficulty-label").textContent = cfg.label;
        document.getElementById("objects-score").textContent = state.score;
        document.getElementById("objects-timer").textContent = state.timeLeft;
    }

    // Выбор (одиночный клик)
    function selectOnly(index) {
        if (!state.running) return;

        const btn = document.querySelector(`button.object-item[data-index="${index}"]`);
        if (!btn) return;

        if (state.selected.has(index)) return;

        state.selected.add(index);
        btn.classList.add("selected");
    }

    // Снятие выбора (двойной клик)
    function unselect(index) {
        if (!state.running) return;

        const btn = document.querySelector(`button.object-item[data-index="${index}"]`);
        if (!btn) return;

        state.selected.delete(index);
        btn.classList.remove("selected");
    }

    // Отрисовка объектов
    function renderObjects() {
        const container = document.getElementById("objects-container");
        container.innerHTML = "";

        state.currentObjects.forEach((obj, index) => {
            const btn = document.createElement("button");
            btn.className = "object-item";
            btn.textContent = obj.name;
            btn.dataset.index = index;

            btn.addEventListener("click", (e) => {
                if (e.detail === 1) selectOnly(index);
            });

            btn.addEventListener("dblclick", (e) => {
                e.preventDefault();
                unselect(index);
            });

            btn.addEventListener("mouseenter", () => btn.classList.add("hovered"));
            btn.addEventListener("mouseleave", () => btn.classList.remove("hovered"));

            container.appendChild(btn);
        });
    }

    // Проверка ответа
    function checkAnswer() {
        if (!state.running || !state.currentQuestion) return;

        const correctIndexes = state.currentObjects
            .map((obj, i) => obj.tags.includes(state.currentQuestion.tag) ? i : null)
            .filter(i => i !== null);

        const selectedArr = [...state.selected];

        let success = true;

        selectedArr.forEach(i => {
            if (!correctIndexes.includes(i)) success = false;
        });

        correctIndexes.forEach(i => {
            if (!selectedArr.includes(i)) success = false;
        });

        if (success) {
            const bonus = 5 + state.timeLeft;
            state.score += bonus;
            document.getElementById("objects-score").textContent = state.score;
            setMessage(`Верно! +${bonus} очков`, "success");
            nextRound();
        } else {
            state.score = Math.max(0, state.score - 3);
            document.getElementById("objects-score").textContent = state.score;
            setMessage("Ошибка! -3 очка. Попробуйте ещё раз.", "error");
        }
    }

    // Таймер
    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            if (!state.running) return;

            state.timeLeft--;
            document.getElementById("objects-timer").textContent = state.timeLeft;

            if (state.timeLeft <= 0) {
                endGame("Время вышло!");
            }
        }, 1000);
    }

    // Старт раунда
    function startRound() {
        const cfg = OBJECT_CONFIG[state.difficultyKey];

        state.round++;
        if (state.round > state.roundsTotal) {
            endGame("Все раунды завершены!");
            return;
        }

        // 1. выбираем вопрос
        state.currentQuestion = shuffle(OBJECT_QUESTIONS)[0];

        // 2. генерируем объекты до тех пор, пока хотя бы один подходит
        let objects;
        let attempts = 0;

        do {
            objects = shuffle(OBJECTS).slice(0, cfg.count);
            attempts++;

            if (attempts > 20) break; // защита от бесконечного цикла
        } while (!objects.some(obj => obj.tags.includes(state.currentQuestion.tag)));

        state.currentObjects = objects;
        state.selected.clear();

        document.getElementById("objects-question").textContent =
            `${state.currentQuestion.text} (Раунд ${state.round} из ${state.roundsTotal})`;

        state.timeLeft = cfg.timeLimit;
        updateHeader();
        renderObjects();
        setMessage("Выберите подходящие объекты и нажмите Проверить.");

        state.running = true;
        startTimer();
    }

    // Следующий раунд
    function nextRound() {
        state.running = false;
        clearInterval(state.timerId);

        setTimeout(() => startRound(), 800);
    }

    // Завершение игры
    function endGame(reason) {
        state.running = false;
        clearInterval(state.timerId);

        setMessage(reason, "success");

        saveToLeaderboard("objects", state.playerName, state.score);

        const final = document.getElementById("objects-final-result");
        const screen = document.getElementById("objects-screen");
        const confetti = document.getElementById("confetti");

        final.innerHTML = `
            <div>Игра завершена!</div>
            <div><strong>${state.score}</strong> очков</div>
        `;
        final.classList.remove("hidden");

        screen.classList.add("game-ended");
        confetti.classList.remove("hidden");

        // скрываем кнопку "Проверить"
        document.getElementById("objects-check-btn").classList.add("hidden");
    }

    // Сохранение результата при выходе в меню
    function forceFinishToMenu() {
        if (!state.running) return;

        state.running = false;
        clearInterval(state.timerId);

        saveToLeaderboard("objects", state.playerName, state.score);

        // скрываем кнопку при выходе
        document.getElementById("objects-check-btn").classList.add("hidden");
    }

    // Инициализация режима
    function init(diffKey = "easy") {
        state.playerName = document.getElementById("menu-player-name").textContent || "Игрок";
        state.difficultyKey = diffKey;
        state.score = 0;
        state.round = 0;

        const cfg = OBJECT_CONFIG[diffKey];
        state.roundsTotal = cfg.rounds;
        state.timeLeft = cfg.timeLimit;
        state.selected = new Set();

        document.getElementById("objects-final-result").classList.add("hidden");
        document.getElementById("confetti").classList.add("hidden");
        document.getElementById("objects-screen").classList.remove("game-ended");

        document.getElementById("objects-score").textContent = "0";
        document.getElementById("objects-timer").textContent = state.timeLeft;

        // показываем кнопку "Проверить" при запуске режима
        document.getElementById("objects-check-btn").classList.remove("hidden");

        updateHeader();
        startRound();
    }

    // Остановка
    function stop() {
        state.running = false;
        clearInterval(state.timerId);
    }

    // Управление с клавиатуры
    document.addEventListener("keydown", (e) => {
        if (!state.running) return;

        if (e.key === "Enter") {
            checkAnswer();
            return;
        }

        if (e.code.startsWith("Digit")) {
            const n = Number(e.code.slice(5));
            if (n >= 1 && n <= 9) selectByKeyboard(n - 1);
            return;
        }

        const map = { KeyQ: 9, KeyW: 10, KeyE: 11, KeyR: 12 };
        if (map[e.code] !== undefined) selectByKeyboard(map[e.code]);
    });

    document.getElementById("objects-check-btn").addEventListener("click", () => {
        checkAnswer();
    });

    function selectByKeyboard(index) {
        const btn = document.querySelectorAll("#objects-container .object-item")[index];
        if (!btn) return;

        const idx = Number(btn.dataset.index);

        if (state.selected.has(idx)) unselect(idx);
        else selectOnly(idx);
    }

    return {
        init,
        stop,
        forceFinishToMenu
    };
})();
