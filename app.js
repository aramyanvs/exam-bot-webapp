// app.js — ЧИСТАЯ ВЕРСИЯ

document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

  if (!tg) {
    console.error("Telegram WebApp API не найден.");
    return;
  }

  tg.ready();
  tg.expand();

  const form = document.getElementById("exam-form");
  const fioInput = document.getElementById("fio");
  const birthInput = document.getElementById("birth");
  const emailInput = document.getElementById("email");
  const docTypeSelect = document.getElementById("doc_type");
  const levelSelect = document.getElementById("level");
  const directionSelect = document.getElementById("direction");

  // Направления по уровням
  const DIRECTIONS = {
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

  // Обновляем список направлений под выбранный уровень
  function fillDirections(level) {
    directionSelect.innerHTML = "";

    if (!level || !DIRECTIONS[level]) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Сначала выберите уровень";
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

  // Обновляем уровни в зависимости от документа
  function updateLevelOptions() {
    const docType = docTypeSelect.value;
    levelSelect.innerHTML = "";
    directionSelect.innerHTML = "";

    let levels = [];

    if (
      docType === "Аттестат о среднем общем образовании" ||
      docType === "Диплом СПО (колледж)"
    ) {
      levels = ["Бакалавриат"];
    } else if (docType === "Диплом бакалавра") {
      levels = ["Бакалавриат", "Магистратура"];
    } else if (
      docType === "Диплом специалиста" ||
      docType === "Диплом магистра"
    ) {
      levels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }

    if (levels.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Сначала выберите документ";
      levelSelect.appendChild(opt);
      const opt2 = document.createElement("option");
      opt2.value = "";
      opt2.textContent = "Сначала выберите уровень";
      directionSelect.appendChild(opt2);
      return;
    }

    levels.forEach((lvl) => {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = lvl;
      levelSelect.appendChild(opt);
    });

    // Автозаполняем направления для первого уровня
    fillDirections(levels[0]);
  }

  // Слушатель смены документа
  docTypeSelect.addEventListener("change", updateLevelOptions);

  // Слушатель смены уровня
  levelSelect.addEventListener("change", () => {
    const level = levelSelect.value;
    fillDirections(level);
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
      tg.showAlert("Похоже, email указан некорректно.");
      return false;
    }
    if (!docType) {
      tg.showAlert("Пожалуйста, выберите документ об образовании.");
      return false;
    }
    if (!level) {
      tg.showAlert("Пожалуйста, выберите уровень образования.");
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

    if (!validateForm()) {
      return;
    }

    const payload = {
      fio: fioInput.value.trim(),
      birth: birthInput.value.trim(),
      email: emailInput.value.trim(),
      doc_type: docTypeSelect.value,   // ВАЖНО: doc_type — как в bot.py
      level: levelSelect.value,
      direction: directionSelect.value,
    };

    console.log("Отправляем в бота:", payload);

    try {
      tg.sendData(JSON.stringify(payload));
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
      // Можно закрыть WebApp, если нужно
      // tg.close();
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  });
});
