// scripts/pos_game.js

const PosGame = (function () {

    let state = {
        running: false,
        timeLeft: 0,
        timerId: null,
        score: 0,
        rounds: [],
        currentRound: 0,
        playerName: "",
        difficultyKey: "easy"
    };

    // Генерация UID
    function uid() {
        return crypto.randomUUID();
    }

    // Перемешивание массива
    function shuffle(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }

    function setMessage(text, type = "") {
        const el = document.getElementById("pos-message");
        el.textContent = text;
        el.className = "message";
        if (type) el.classList.add(type);
    }

    // Создаём список раундов
    function buildRounds(diffKey) {
        const cfg = POS_CONFIG[diffKey];
        const rounds = [];
        let pool = shuffle(POS_WORDS).map(w => ({ ...w, uid: uid() }));

        while (pool.length > 0) {
            const chunk = pool.splice(0, cfg.wordsCount);
            rounds.push(chunk);
        }

        return rounds;
    }

    // Отрисовка слов
    function renderWords(words) {
        const container = document.getElementById("pos-words");
        container.innerHTML = "";

        words.forEach(w => {
            const btn = document.createElement("button");
            btn.className = "word";
            btn.textContent = w.text;
            btn.dataset.uid = w.uid;
            btn.draggable = true;

            btn.addEventListener("dragstart", e => {
                e.dataTransfer.setData("uid", w.uid);
            });

            container.appendChild(btn);
        });
    }

    // Настройка зон сброса
    function setupDropzones() {
        document.querySelectorAll(".pos-dropzone").forEach(zone => {
            zone.addEventListener("dragover", e => e.preventDefault());
            zone.addEventListener("drop", e => {
                e.preventDefault();
                const uid = e.dataTransfer.getData("uid");
                handleDrop(uid, zone.parentElement.dataset.pos);
            });
        });
    }

    // Обработка сброса слова
    function handleDrop(uid, targetPos) {
        const words = state.rounds[state.currentRound];
        const word = words.find(w => w.uid === uid);
        const btn = document.querySelector(`button.word[data-uid="${uid}"]`);

        if (!word || !btn) return;

        if (word.pos === targetPos) {
            btn.remove();

            const span = document.createElement("span");
            span.className = "word correct";
            span.textContent = word.text;

            document
                .querySelector(`.pos-group[data-pos="${targetPos}"] .pos-dropzone`)
                .appendChild(span);

            state.score += 2;
            document.getElementById("pos-score").textContent = state.score;

            // Если слова закончились — следующий раунд
            if (document.querySelectorAll("#pos-words .word").length === 0) {
                nextRound();
            }
        } else {
            btn.classList.add("wrong");
            setTimeout(() => btn.classList.remove("wrong"), 600);

            state.score = Math.max(0, state.score - 1);
            document.getElementById("pos-score").textContent = state.score;

            setMessage("Неверная группа!", "error");
        }
    }

    // Таймер
    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            if (!state.running) return;

            state.timeLeft--;
            document.getElementById("pos-timer").textContent = state.timeLeft;

            if (state.timeLeft <= 0) {
                endGame("Время вышло!");
            }
        }, 1000);
    }

    // Запуск раунда
    function startRound() {
        const words = state.rounds[state.currentRound];

        document.getElementById("pos-words").innerHTML = "";
        document.querySelectorAll(".pos-dropzone").forEach(z => z.innerHTML = "");

        renderWords(words);
        setupDropzones();

        setMessage("Перетащите слова в правильные группы.");
    }

    // Следующий раунд
    function nextRound() {
        state.currentRound++;

        if (state.currentRound >= state.rounds.length) {
            endGame("Все слова отсортированы!");
            return;
        }

        const cfg = POS_CONFIG[state.difficultyKey];
        state.timeLeft = cfg.timeLimit;
        document.getElementById("pos-timer").textContent = state.timeLeft;

        startRound();
    }

    // Финал игры
    function endGame(reason) {
        state.running = false;
        clearInterval(state.timerId);

        setMessage(reason, "success");

        // Новая система лидеров
        saveToLeaderboard("pos", state.playerName, state.score);

        document.getElementById("confetti").classList.remove("hidden");

        const final = document.getElementById("pos-final-result");
        final.innerHTML = `
            <div>Игра завершена!</div>
            <div><strong>${state.score}</strong> очков</div>
        `;
        final.classList.remove("hidden");

        document.getElementById("pos-screen").classList.add("game-ended");
    }

    // Сохранение результата при выходе в меню
    function forceFinishToMenu() {
        if (!state.running) return;

        state.running = false;
        clearInterval(state.timerId);

        saveToLeaderboard("pos", state.playerName, state.score);
    }

    // Инициализация режима
    function init(diffKey = "easy") {
        state.playerName = document.getElementById("menu-player-name").textContent;
        state.score = 0;
        state.currentRound = 0;
        state.difficultyKey = diffKey;

        state.rounds = buildRounds(diffKey);

        const cfg = POS_CONFIG[diffKey];
        state.timeLeft = cfg.timeLimit;
        state.running = true;

        document.getElementById("pos-score").textContent = "0";
        document.getElementById("pos-timer").textContent = state.timeLeft;

        document.getElementById("pos-screen").classList.remove("game-ended");

        document.getElementById("pos-final-result").classList.add("hidden");
        document.getElementById("confetti").classList.add("hidden");

        startRound();
        startTimer();
    }

    return {
        init,
        forceFinishToMenu
    };

})();
