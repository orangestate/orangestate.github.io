// js/game.js

const Game = (function () {
    // Основное состояние игры
    let state = {
        playerName: "",
        difficultyKey: "easy",
        phrase: "",
        words: [],
        nextIndex: 0,
        score: 0,
        roundPoints: 0,
        timeLeft: 0,
        timerId: null,
        running: false,
        remainingPhrases: []
    };

    // Перемешивание массива (Фишер–Йетс)
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Получение списка фраз под выбранную сложность
    function buildRemainingPhrases(diffKey) {
        const cfg = DIFFICULTY_CONFIG[diffKey];
        const candidates = PHRASES.filter(p => {
            const len = p.split(" ").length;
            return len >= cfg.minWords && len <= cfg.maxWords;
        });
        return shuffle(candidates.slice());
    }

    // Подготовка слов + возможное предзаполнение
    function buildWordsWithPrefill(phrase, diffKey) {
        const originalWords = phrase.split(" ");
        const originalIndexed = originalWords.map((t, i) => ({ text: t, originalIndex: i }));

        const cfg = DIFFICULTY_CONFIG[diffKey];
        const prefillProb = cfg.prefillProbability || 0;
        const willPrefill = Math.random() < prefillProb && originalIndexed.length >= 3;

        const prefillIndex = willPrefill ? Math.floor(Math.random() * originalIndexed.length) : -1;

        const words = [];
        for (let i = 0; i < originalIndexed.length; i++) {
            const w = {
                text: originalIndexed[i].text,
                order: i,
                originalIndex: originalIndexed[i].originalIndex,
                isPrefilled: i === prefillIndex,
                isFilled: i === prefillIndex
            };
            words.push(w);
        }

        return { orderedWords: words };
    }

    // Отрисовка доступных слов
    function renderWords() {
        const container = document.getElementById("words-container");
        container.innerHTML = "";

        const ordered = state.words;

        const candidates = ordered
            .filter(w => !w.isPrefilled && !w.isFilled)
            .map(w => ({ text: w.text, order: w.order }));

        const shuffled = shuffle(candidates);

        shuffled.forEach(item => {
            const order = item.order;
            const wordObj = ordered.find(w => w.order === order);
            if (!wordObj) return;

            const btn = document.createElement("button");
            btn.className = "word";
            btn.textContent = wordObj.text;
            btn.dataset.order = wordObj.order;

            btn.draggable = true;
            btn.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("order", btn.dataset.order);
            });

            btn.addEventListener("click", onWordClick);
            container.appendChild(btn);
        });
    }

    // Отрисовка собранного предложения
    function renderAssembled() {
        const assembled = document.getElementById("assembled-sentence");
        assembled.innerHTML = "";
        const words = state.words;

        for (let i = 0; i < words.length; i++) {
            const span = document.createElement("span");

            if (i === state.nextIndex) {
                span.addEventListener("dragover", (e) => e.preventDefault());
                span.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const draggedOrder = Number(e.dataTransfer.getData("order"));
                    handleDrop(draggedOrder);
                });
            }

            if (words[i].isFilled) {
                span.textContent = words[i].text;
                span.classList.add("filled-slot");
                if (words[i].isPrefilled) {
                    span.style.opacity = "0.85";
                    span.style.background = "#0b1220";
                    span.title = "Предзаполнено";
                }
            } else {
                span.textContent = "___";
                span.classList.add("empty-slot");
            }
            assembled.appendChild(span);
        }
    }

    // Вывод сообщения игроку
    function setMessage(text, type = "") {
        const el = document.getElementById("message");
        el.textContent = text;
        el.className = "message";
        if (type) el.classList.add(type);
    }

    // Обновление шапки игры
    function updateHeader() {
        const cfg = DIFFICULTY_CONFIG[state.difficultyKey];
        document.getElementById("game-player-name").textContent = state.playerName;
        document.getElementById("game-difficulty-label").textContent = cfg.label;
        document.getElementById("score").textContent = state.score;
        document.getElementById("timer").textContent = state.timeLeft;
    }

    // Обновление очков в реальном времени
    function updateScoreDisplay() {
        document.getElementById("score").textContent = state.score + state.roundPoints;
    }

    // Обновление таймера
    function updateTimer() {
        document.getElementById("timer").textContent = state.timeLeft;
    }

    // Блокировка всех слов
    function disableAllWords() {
        document.querySelectorAll(".word").forEach(w => {
            w.classList.add("disabled");
            w.disabled = true;
        });
    }

    // Запуск таймера
    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            if (!state.running) return;
            state.timeLeft--;
            updateTimer();
            if (state.timeLeft <= 0) {
                state.timeLeft = 0;
                updateTimer();
                endRound(false, "Время вышло!");
            }
        }, 1000);
    }

    // Старт нового раунда
    function startRound() {
        if (!state.remainingPhrases || state.remainingPhrases.length === 0) {
            finishGameSession();
            return;
        }

        const idx = Math.floor(Math.random() * state.remainingPhrases.length);
        const phrase = state.remainingPhrases.splice(idx, 1)[0];

        if (!phrase) {
            setMessage("Нет фраз для этой сложности", "error");
            return;
        }

        state.phrase = phrase;
        const built = buildWordsWithPrefill(phrase, state.difficultyKey);
        state.words = built.orderedWords.map(w => ({ ...w }));
        state.nextIndex = 0;
        state.roundPoints = 0;

        while (state.nextIndex < state.words.length && state.words[state.nextIndex].isFilled) {
            state.nextIndex++;
        }

        const cfg = DIFFICULTY_CONFIG[state.difficultyKey];
        state.timeLeft = cfg.timeLimit;
        state.running = true;

        renderWords();
        renderAssembled();
        updateHeader();
        updateScoreDisplay();
        setMessage("Соберите предложение, перетаскивая или нажимая на слова по порядку.");

        const nextBtn = document.getElementById("next-round-btn");
        if (nextBtn) nextBtn.classList.add("hidden");

        startTimer();
    }

    // Завершение раунда
    function endRound(success, reason) {
        state.running = false;
        clearInterval(state.timerId);
        disableAllWords();

        const cfg = DIFFICULTY_CONFIG[state.difficultyKey];
        const multiplier = cfg.scoreMultiplier || 1;

        if (success) {
            const baseCompleteBonus = 5;
            const raw = state.roundPoints + state.timeLeft + baseCompleteBonus;
            const roundScore = Math.max(0, Math.round(raw * multiplier));

            state.score += roundScore;

            document.getElementById("score").textContent = state.score;

            setMessage(`Отлично! +${roundScore} очков (×${multiplier}). ${reason}`, "success");

            if (!state.remainingPhrases || state.remainingPhrases.length === 0) {
                setTimeout(() => finishGameSession(), 800);
            } else {
                setTimeout(() => {
                    setMessage("Следующее предложение...", "");
                    startRound();
                }, 800);
            }

        } else {
            document.getElementById("score").textContent = state.score;
            finishGameSession(`Раунд не пройден. ${reason}`);
        }
    }

    // Обработка клика по слову
    function onWordClick(e) {
        if (!state.running) return;

        const btn = e.currentTarget;
        const order = Number(btn.dataset.order);

        if (order === state.nextIndex) {
            const wordObj = state.words.find(w => w.order === order);
            if (!wordObj) return;

            wordObj.isFilled = true;
            btn.classList.remove("wrong");
            btn.classList.add("correct");
            btn.disabled = true;

            state.nextIndex++;
            while (state.nextIndex < state.words.length && state.words[state.nextIndex].isFilled) {
                state.nextIndex++;
            }

            renderAssembled();

            state.roundPoints += 2;
            updateScoreDisplay();

            if (state.nextIndex >= state.words.length) {
                endRound(true, "Предложение собрано!");
            }
        } else {
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 600);

            state.roundPoints = Math.max(0, state.roundPoints - 3);
            updateScoreDisplay();
            setMessage("Неправильное слово!", "error");
        }
    }

    // Обработка перетаскивания
    function handleDrop(order) {
        if (!state.running) return;

        if (order === state.nextIndex) {
            const wordObj = state.words.find(w => w.order === order);
            if (!wordObj) return;

            wordObj.isFilled = true;

            state.nextIndex++;
            while (state.nextIndex < state.words.length && state.words[state.nextIndex].isFilled) {
                state.nextIndex++;
            }

            state.roundPoints += 2;
            updateScoreDisplay();

            renderWords();
            renderAssembled();

            if (state.nextIndex >= state.words.length) {
                endRound(true, "Предложение собрано!");
            }
        } else {
            const btn = document.querySelector(`button.word[data-order="${order}"]`);
            if (btn) {
                btn.classList.add("wrong");
                setTimeout(() => btn.classList.remove("wrong"), 600);
            }
            setMessage("Неправильное слово!", "error");
        }
    }

    // Завершение всей игры
    function finishGameSession(customMessage) {

        // 🔥 НОВАЯ СИСТЕМА ЛИДЕРОВ
        saveToLeaderboard("assemble", state.playerName, state.score);

        state.running = false;
        clearInterval(state.timerId);
        disableAllWords();

        const cfgLabel = DIFFICULTY_CONFIG[state.difficultyKey].label;
        const msg = customMessage
            ? `${customMessage} Итог: ${state.score} очков.`
            : `Все фразы для уровня "${cfgLabel}" исчерпаны. Итог: ${state.score} очков.`;

        setMessage(msg, "success");

        document.getElementById("game-screen").classList.add("game-ended");

        const final = document.getElementById("final-result");
        final.innerHTML = `
            <div>Игра завершена!</div>
            <div><strong>${state.score}</strong> очков</div>
        `;
        final.classList.remove("hidden");
        document.getElementById("confetti").classList.remove("hidden");

        const nextBtn = document.getElementById("next-round-btn");
        if (nextBtn) nextBtn.classList.add("hidden");
    }

    // 🔥 Сохранение результата при выходе в меню
    function forceFinishToMenu() {
        if (!state.running) return;

        state.running = false;
        clearInterval(state.timerId);

        saveToLeaderboard("assemble", state.playerName, state.score);
    }

    // Инициализация игры
    function init(playerName, difficultyKey) {
        document.getElementById("game-screen").classList.remove("game-ended");
        document.getElementById("final-result").classList.add("hidden");

        state.playerName = playerName;
        state.difficultyKey = difficultyKey;
        state.score = 0;
        state.remainingPhrases = buildRemainingPhrases(difficultyKey);

        startRound();
    }

    function nextRound() {
        startRound();
    }

    function setDifficulty(key) {
        state.difficultyKey = key;
    }

    function setPlayerName(name) {
        state.playerName = name;
    }

    // Остановка игры
    function stop() {
        state.running = false;
        clearInterval(state.timerId);
    }

    // Управление с клавиатуры (цифры 1–9)
    document.addEventListener("keydown", (e) => {
        if (!state.running) return;

        if (e.key < "1" || e.key > "9") return;

        const index = Number(e.key) - 1;

        const btn = document.querySelectorAll("#words-container .word")[index];
        if (btn) btn.click();
    });

    return {
        init,
        nextRound,
        setDifficulty,
        setPlayerName,
        stop,
        forceFinishToMenu
    };
})();
