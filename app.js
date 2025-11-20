// app.js
document.addEventListener("DOMContentLoaded", function () {
  // === Telegram WebApp API ===
  const tg =
    window.Telegram && window.Telegram.WebApp
      ? window.Telegram.WebApp
      : null;

  if (!tg) {
    console.error(
      'Telegram WebApp API не найден. Проверь <script src="https://telegram.org/js/telegram-web-app.js"></script> в HTML.'
    );
    return;
  }

  tg.ready();
  if (tg.expand) tg.expand();

  // === ЭЛЕМЕНТЫ ФОРМЫ ===
  // форма
  const form =
    document.getElementById("exam-form") ||
    document.querySelector("form");

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
    console.error(
      "Не найдены какие-то элементы формы. Проверь id полей в HTML."
    );
    return;
  }

  // === НАПРАВЛЕНИЯ ПО УРОВНЮ ===
  const directionsByLevel = {
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

    const list = directionsByLevel[level] || [];
    list.forEach((dir) => {
      const opt = document.createElement("option");
      opt.value = dir;
      opt.textContent = dir;
      directionSelect.appendChild(opt);
    });
  }

  // === ВЫБОР УРОВНЯ ПО ДОКУМЕНТУ ===
  const ALL_LEVEL_OPTIONS = [
    { value: "Бакалавриат", label: "Бакалавриат" },
    { value: "Магистратура", label: "Магистратура" },
    { value: "Аспирантура", label: "Аспирантура" },
  ];

  function updateLevelOptions() {
    const docType = docTypeSelect.value;

    let allowedLevels = [];

    if (
      docType === "Аттестат" ||
      docType === "Аттестат о среднем общем образовании" ||
      docType === "Диплом колледжа" ||
      docType === "Диплом СПО (колледж)"
    ) {
      // только бакалавриат
      allowedLevels = ["Бакалавриат"];
    } else if (docType === "Диплом бакалавра") {
      // бакалавриат + магистратура
      allowedLevels = ["Бакалавриат", "Магистратура"];
    } else if (
      docType === "Диплом специалиста" ||
      docType === "Диплом магистра"
    ) {
      // все три
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    } else {
      // запасной вариант — всё
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }

    // чистим список уровней
    levelSelect.innerHTML = "";

    ALL_LEVEL_OPTIONS.forEach((opt) => {
      if (allowedLevels.includes(opt.value)) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        levelSelect.appendChild(option);
      }
    });

    // сразу обновляем направления под первый доступный уровень
    if (levelSelect.value) {
      fillDirections(levelSelect.value);
    } else {
      directionSelect.innerHTML = "";
    }
  }

  docTypeSelect.addEventListener("change", updateLevelOptions);

  levelSelect.addEventListener("change", () => {
    const level = levelSelect.value;
    fillDirections(level);
  });

  // стартовый прогон
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
  function handleSubmit(e) {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      fio: fioInput.value.trim(),
      birth: birthInput.value.trim(),
      email: emailInput.value.trim(),
      doc_type: docTypeSelect.value, // ключ, который ждёт bot.py
      level: levelSelect.value,
      direction: directionSelect.value,
    };

    console.log("Отправляем в бот:", payload);

    try {
      tg.sendData(JSON.stringify(payload));
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
      // при желании можно закрыть вебапп:
      // tg.close();
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  // отправка по submit формы
  form.addEventListener("submit", handleSubmit);

  // и дублируем на кнопку "Отправить заявку", если она есть и type="button"
  if (sendBtn) {
    sendBtn.addEventListener("click", handleSubmit);
  }
});
