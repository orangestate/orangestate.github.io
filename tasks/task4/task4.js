const latin = [
    "Consuetudo est altera natura",
    "Nota bene",
    "Nulla calamitas sola",
    "Per aspera ad astra"
];

const russian = [
    "Привычка — вторая натура",
    "Заметьте хорошо!",
    "Беда не приходит одна",
    "Через тернии к звёздам"
];

let latinWork = latin.slice();
let russianWork = russian.slice();

const addRowBtn = document.getElementById("addRowBtn");
const recolorBtn = document.getElementById("recolorBtn");
const clearBtn = document.getElementById("clearBtn");
const table = document.getElementById("phrase-table");

let clickCount = 0;
let isBold = false;

addRowBtn.onclick = function () {

    if (latinWork.length === 0) {
        alert("Фразы закончились");
        return;
    }

    let randomIndex = Math.floor(Math.random() * latinWork.length);

    let latinText = latinWork[randomIndex];
    let russianText = russianWork[randomIndex];

    latinWork.splice(randomIndex, 1);
    russianWork.splice(randomIndex, 1);

    clickCount++;

    let row = table.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    cell1.innerHTML = latinText;
    cell2.innerHTML = russianText;

    if (clickCount % 2 === 0) {
        row.className = "class1";
    } else {
        row.className = "class2";
    }
};

recolorBtn.onclick = function () {

    let rows = table.rows;
    isBold = !isBold;

    for (let i = 1; i < rows.length; i++) {
        if (i % 2 === 0) {
            rows[i].style.fontWeight = isBold ? "bold" : "normal";
        }
    }
};

clearBtn.onclick = function () {

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    latinWork = latin.slice();
    russianWork = russian.slice();

    clickCount = 0;
    isBold = false;
};
