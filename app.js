const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const fioInput = document.getElementById("fio");
const birthInput = document.getElementById("birth");
const emailInput = document.getElementById("email");

const docSelect = document.getElementById("doc_type");
const levelSelect = document.getElementById("level");
const directionSelect = document.getElementById("direction");
const sendBtn = document.getElementById("send");

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
    "Государственное и муниципальное управление",
    "Экономика",
  ],
  "Аспирантура": [
    "Региональная и отраслевая экономика",
    "Общая психология, психология личности, история психологии",
  ],
};

function fillDirections(level) {
  directionSelect.innerHTML = "";
  const list = directions[level] || [];
  list.forEach((dir) => {
    const opt = document.createElement("option");
    opt.value = dir;
    opt.textContent = dir;
    directionSelect.appendChild(opt);
  });
}

docSelect.addEventListener("change", () => {
  levelSelect.innerHTML = "";
  directionSelect.innerHTML = "";

  const doc = docSelect.value;
  let levels = [];

  if (
    doc === "Аттестат о среднем общем образовании" ||
    doc === "Диплом СПО (колледж)"
  ) {
    levels = ["Бакалавриат"];
  } else if (doc === "Диплом бакалавра") {
    levels = ["Бакалавриат", "Магистратура"];
  } else if (doc === "Диплом специалиста" || doc === "Диплом магистра") {
    levels = ["Бакалавриат", "Магистратура", "Аспирантура"];
  }

  levels.forEach((lvl) => {
    const opt = document.createElement("option");
    opt.value = lvl;
    opt.textContent = lvl;
    levelSelect.appendChild(opt);
  });

  // ВАЖНО: если уровень один (например только Бакалавриат) — сразу подставим направления
  if (levels.length === 1) {
    fillDirections(levels[0]);
  }
});

levelSelect.addEventListener("change", () => {
  const level = levelSelect.value;
  fillDirections(level);
});

sendBtn.addEventListener("click", () => {
  const fio = fioInput.value.trim();
  const birth = birthInput.value; // YYYY-MM-DD
  const email = emailInput.value.trim();
  const doc = docSelect.value;
  const level = levelSelect.value;
  const direction = directionSelect.value;

  // Простая проверка
  if (!fio || !birth || !email || !doc || !level || !direction) {
    tg.showAlert("Пожалуйста, заполните все поля перед отправкой.");
    return;
  }

  const data = {
    fio,
    birth,
    email,
    doc,
    level,
    direction,
  };

  tg.sendData(JSON.stringify(data));
  tg.close(); // закрываем мини-приложение, пользователь возвращается в чат
});
