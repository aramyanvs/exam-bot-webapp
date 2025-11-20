// app.js (чистый, без помойки)

window.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

  if (!tg) {
    console.error(
      'Telegram WebApp API не найден. Проверь <script src="https://telegram.org/js/telegram-web-app.js"></script> в index.html'
    );
    return;
  }

  tg.ready();
  tg.expand();

  // Элементы формы
  const form = document.getElementById("exam-form");
  const fioInput = document.getElementById("fio");
  const birthInput = document.getElementById("birth");
  const emailInput = document.getElementById("email");
  const docTypeSelect = document.getElementById("doc_type");
  const levelSelect = document.getElementById("level");
  const directionSelect = document.getElementById("direction");

  if (
    !form ||
    !fioInput ||
    !birthInput ||
    !emailInput ||
    !docTypeSelect ||
    !levelSelect ||
    !directionSelect
  ) {
    console.error("Не найдены элементы формы. Проверь id в index.html");
    return;
  }

  // Справочник направлений
  const DIRECTIONS = {
    Бакалавриат: [
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
    Магистратура: [
      "Юриспруденция",
      "Менеджмент",
      "Государственное и муниципальное управление (магистратура)",
      "Экономика (магистратура)",
    ],
    Аспирантура: [
      "Региональная и отраслевая экономика",
      "Общая психология, психология личности, история психологии",
    ],
  };

  function fillDirections(level) {
    directionSelect.innerHTML = "";

    if (!level || !DIRECTIONS[level]) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Сначала выберите уровень…";
      directionSelect.appendChild(opt);
      return;
    }

    DIRECTIONS[level].forEach((dir) => {
      const opt = document.createElement("option");
      opt.value = dir;
      opt.textContent = dir;
      directionSelect.appendChild(opt);
    });
  }

  // Настройка уровней в зависимости от документа
  const ALL_LEVELS = ["Бакалавриат", "Магистратура", "Аспирантура"];

  function updateLevelOptions() {
    const doc = docTypeSelect.value;
    let allowed = [];

    if (
      doc === "Аттестат о среднем общем образовании" ||
      doc === "Диплом СПО (колледж)"
    ) {
      allowed = ["Бакалавриат"];
    } else if (doc === "Диплом бакалавра") {
      allowed = ["Бакалавриат", "Магистратура"];
    } else if (doc === "Диплом специалиста" || doc === "Диплом магистра") {
      allowed = ["Бакалавриат", "Магистратура", "Аспирантура"];
    } else {
      allowed = [];
    }

    levelSelect.innerHTML = "";

    if (!allowed.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Сначала выберите документ…";
      levelSelect.appendChild(opt);
      fillDirections(null);
      return;
    }

    allowed.forEach((lvl) => {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = lvl;
      levelSelect.appendChild(opt);
    });

    // по умолчанию заполняем направления для первого уровня
    fillDirections(allowed[0]);
  }

  docTypeSelect.addEventListener("change", updateLevelOptions);

  levelSelect.addEventListener("change", () => {
    const lvl = levelSelect.value;
    fillDirections(lvl);
  });

  // Простая валидация
  function validateForm() {
    const fio = fioInput.value.trim();
    const birth = birthInput.value.trim();
    const email = emailInput.value.trim();
    const docType = docTypeSelect.value;
    const level = levelSelect.value;
    const direction = directionSelect.value;

    if (!fio) {
      tg.showAlert("Пожалуйста, укажите ФИО.");
      return false;
    }
    if (!birth) {
      tg.showAlert("Пожалуйста, укажите дату рождения.");
      return false;
    }
    if (!email) {
      tg.showAlert("Пожалуйста, укажите email.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tg.showAlert("Похоже, email указан неверно.");
      return false;
    }
    if (!docType) {
      tg.showAlert("Пожалуйста, выберите документ об образовании.");
      return false;
    }
    if (!level) {
      tg.showAlert("Пожалуйста, выберите уровень обучения.");
      return false;
    }
    if (!direction) {
      tg.showAlert("Пожалуйста, выберите направление подготовки.");
      return false;
    }
    return true;
  }

  // Отправка данных в бота
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      fio: fioInput.value.trim(),
      birth: birthInput.value.trim(),
      email: emailInput.value.trim(),
      doc_type: docTypeSelect.value,  // ВАЖНО: ключ doc_type
      level: levelSelect.value,
      direction: directionSelect.value,
    };

    console.log("Отправляем в бота:", payload);

    try {
      tg.sendData(JSON.stringify(payload));
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
      tg.close(); // можно убрать, если хочешь оставлять форму открытой
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  });

  // первый вызов
  updateLevelOptions();
});
