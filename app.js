const tg = window.Telegram.WebApp;
tg.expand(); // растянуть приложение

// Подгружаем уровни в зависимости от документа
const docSelect = document.getElementById("doc_type");
const levelSelect = document.getElementById("level");
const directionSelect = document.getElementById("direction");

const directions = {
  "Бакалавриат": [
    "Юриспруденция",
    "Менеджмент",
    "Государственное и муниципальное управление",
    "Экономика",
    "Управление персоналом",
    "Дизайн",
    "Бизнес-информатика",
    "Психология",
    "ЖКХ",
  ],
  "Магистратура": [
    "Юриспруденция",
    "Менеджмент",
    "Государственное и муниципальное управление (магистратура)",
    "Экономика (магистратура)",
  ],
  "Аспирантура": [
    "Региональная и отраслевая экономика",
    "Общая психология, психология личности, история психологии",
  ],
};

// выбираем уровни
docSelect.addEventListener("change", () => {
  levelSelect.innerHTML = "";

  const doc = docSelect.value;

  let levels = [];

  if (doc === "Аттестат о среднем общем образовании" || doc === "Диплом СПО (колледж)") {
    levels = ["Бакалавриат"];
  } else if (doc === "Диплом бакалавра") {
    levels = ["Бакалавриат", "Магистратура"];
  } else {
    levels = ["Бакалавриат", "Магистратура", "Аспирантура"];
  }

  levels.forEach(lvl => {
    let opt = document.createElement("option");
    opt.textContent = lvl;
    levelSelect.appendChild(opt);
  });

  directionSelect.innerHTML = "";
});

// подставляем направления
levelSelect.addEventListener("change", () => {
  const level = levelSelect.value;
  directionSelect.innerHTML = "";

  directions[level].forEach(dir => {
    let opt = document.createElement("option");
    opt.textContent = dir;
    directionSelect.appendChild(opt);
  });
});

// отправляем данные боту
document.getElementById("send").addEventListener("click", () => {
  const data = {
    fio: document.getElementById("fio").value,
    birth: document.getElementById("birth").value,
    email: document.getElementById("email").value,
    doc: docSelect.value,
    level: levelSelect.value,
    direction: directionSelect.value
  };

  tg.sendData(JSON.stringify(data));
});