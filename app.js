// app.js

document.addEventListener("DOMContentLoaded", function () {
  // Инициализация Telegram WebApp
  const tg =
    window.Telegram && window.Telegram.WebApp
      ? window.Telegram.WebApp
      : null;

  if (!tg) {
    console.error(
      'Telegram WebApp API не найден. Проверьте подключение скрипта: <script src="https://telegram.org/js/telegram-web-app.js"></script>.'
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
    console.error("Не найдены какие-то элементы формы. Проверь id в index.html.");
    return;
  }

  // Справочник направлений по уровню
  const DIRECTIONS_BY_LEVEL = {
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

  // Все возможные уровни
  const ALL_LEVEL_OPTIONS = [
    { value: "Бакалавриат", label: "Бакалавриат" },
    { value: "Магистратура", label: "Магистратура" },
    { value: "Аспирантура", label: "Аспирантура" },
  ];

  // Заполняет select направлений по выбранному уровню
  function fillDirections(level) {
    directionSelect.innerHTML = "";

    const list = DIRECTIONS_BY_LEVEL[level] || [];
    list.forEach((dir) => {
      const opt = document.createElement("option");
      opt.value = dir;
      opt.textContent = dir;
      directionSelect.appendChild(opt);
    });
  }

  // Обновляет допустимые уровни в зависимости от документа
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
      // на всякий случай — все уровни
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }

    // Чистим и заполняем select уровней
    levelSelect.innerHTML = "";

    ALL_LEVEL_OPTIONS.forEach((opt) => {
      if (allowedLevels.includes(opt.value)) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        levelSelect.appendChild(option);
      }
    });

    // После обновления уровней сразу подставляем направления
    if (levelSelect.value) {
      fillDirections(levelSelect.value);
    } else {
      directionSelect.innerHTML = "";
    }
  }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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

  // === СВЯЗЬ С Telegram (отправка данных) ===

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      fio: fioInput.value.trim(),
      birth: birthInput.value.trim(),
      email: emailInput.value.trim(),
      doc_type: docTypeSelect.value,
      level: levelSelect.value,
      direction: directionSelect.value,
    };

    console.log("Отправляем в бота payload:", payload);

    try {
      tg.sendData(JSON.stringify(payload));
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
      // tg.close(); // если захочешь автоматически закрывать WebApp
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  });

  // === ОБРАБОТЧИКИ И ПЕРВОНАЧАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ===

  docTypeSelect.addEventListener("change", updateLevelOptions);
  levelSelect.addEventListener("change", () => {
    if (levelSelect.value) {
      fillDirections(levelSelect.value);
    }
  });

  // Первичная настройка, если документ уже выбран (или был выбран по умолчанию)
  if (docTypeSelect.value) {
    updateLevelOptions();
  }
});
