// app.js — минимальный рабочий вариант

document.addEventListener("DOMContentLoaded", function () {
  // === Telegram WebApp API ===
  const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

  if (!tg) {
    console.error(
      'Telegram WebApp API не найден. Проверь <script src="https://telegram.org/js/telegram-web-app.js"></script> в index.html.'
    );
    return;
  }

  tg.ready();
  tg.expand();

  // === ЭЛЕМЕНТЫ ФОРМЫ ===
  const form = document.getElementById("exam-form");
  const fioInput = document.getElementById("fio");
  const birthInput = document.getElementById("birth");
  const emailInput = document.getElementById("email");
  const docTypeSelect = document.getElementById("doc_type");
  const levelSelect = document.getElementById("level");
  const directionSelect = document.getElementById("direction");
  const sendBtn = document.getElementById("send"); // на всякий случай

  if (
    !form ||
    !fioInput ||
    !birthInput ||
    !emailInput ||
    !docTypeSelect ||
    !levelSelect ||
    !directionSelect
  ) {
    console.error("Не найдены какие-то элементы формы. Проверь id полей в HTML.");
    return;
  }

  // === СПРАВОЧНИК НАПРАВЛЕНИЙ ===
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
    const list = DIRECTIONS[level] || [];
    list.forEach((dir) => {
      const opt = document.createElement("option");
      opt.value = dir;
      opt.textContent = dir;
      directionSelect.appendChild(opt);
    });
  }

  // === ЛОГИКА ВЫБОРА УРОВНЯ ПО ДОКУМЕНТУ ===
  const ALL_LEVEL_OPTIONS = [
    { value: "Бакалавриат", label: "Бакалавриат" },
    { value: "Магистратура", label: "Магистратура" },
    { value: "Аспирантура", label: "Аспирантура" },
  ];

  function updateLevelOptions() {
    const docType = docTypeSelect.value;

    let allowedLevels = [];

    if (
      docType === "Аттестат о среднем общем образовании" ||
      docType === "Диплом СПО (колледж)"
    ) {
      allowedLevels = ["Бакалавриат"];
    } else if (docType === "Диплом бакалавра") {
      allowedLevels = ["Бакалавриат", "Магистратура"];
    } else if (
      docType === "Диплом специалиста" ||
      docType === "Диплом магистра"
    ) {
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    } else {
      // запасной вариант — все уровни
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }

    levelSelect.innerHTML = "";

    ALL_LEVEL_OPTIONS.forEach((opt) => {
      if (allowedLevels.includes(opt.value)) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        levelSelect.appendChild(option);
      }
    });

    // после пересборки уровней — обновляем направления
    if (levelSelect.value) {
      fillDirections(levelSelect.value);
    } else {
      directionSelect.innerHTML = "";
    }
  }

  // события на select'ах
  docTypeSelect.addEventListener("change", updateLevelOptions);
  levelSelect.addEventListener("change", () => {
    fillDirections(levelSelect.value);
  });

  // первичная инициализация
  updateLevelOptions();

  // === ВАЛИДАЦИЯ ===
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
      tg.showAlert("Пожалуйста, выберите уровень образования.");
      return false;
    }
    if (!direction) {
      tg.showAlert("Пожалуйста, выберите направление подготовки.");
      return false;
    }
    return true;
  }

  // === ОТПРАВКА ДАННЫХ В БОТА ===
  function sendToBot() {
    if (!validateForm()) {
      return;
    }

    const payload = {
      fio: fioInput.value.trim(),
      birth: birthInput.value.trim(),
      email: emailInput.value.trim(),
      doc_type: docTypeSelect.value,   // ВАЖНО: doc_type, как в bot.py
      level: levelSelect.value,
      direction: directionSelect.value,
    };

    console.log("Отправляем в бота:", payload);

    try {
      tg.sendData(JSON.stringify(payload));
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
      // при желании можно закрыть мини-приложение:
      // tg.close();
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  // отправка по submit формы
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendToBot();
  });

  // и по клику на кнопку, если она есть
  if (sendBtn) {
    sendBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sendToBot();
    });
  }
});
