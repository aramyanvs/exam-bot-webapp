// app.js — чистый и рабочий

document.addEventListener("DOMContentLoaded", () => {
  // Telegram WebApp объект
  const tg =
    window.Telegram && window.Telegram.WebApp
      ? window.Telegram.WebApp
      : null;

  if (tg) {
    tg.ready();
    tg.expand();
  } else {
    console.warn(
      "Telegram WebApp API не найден. Форма работает в тестовом режиме в браузере."
    );
  }

  // Элементы формы
  const form = document.getElementById("exam-form");
  const fioInput = document.getElementById("fio");
  const birthInput = document.getElementById("birth");
  const emailInput = document.getElementById("email");
  const docTypeSelect = document.getElementById("doc_type");
  const levelSelect = document.getElementById("level");
  const directionSelect = document.getElementById("direction");

  // Карта направлений по уровню
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

  // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

  // Обновляем список уровней в зависимости от документа
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
      // На всякий случай — все уровни
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }

    levelSelect.innerHTML = "";

    // Добавляем placeholder
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = "Выберите уровень";
    levelSelect.appendChild(placeholder);

    // Добавляем только разрешённые уровни
    ALL_LEVEL_OPTIONS.forEach((opt) => {
      if (allowedLevels.includes(opt.value)) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        levelSelect.appendChild(option);
      }
    });

    // При смене документа сбрасываем направления
    updateDirectionOptions();
  }

  // Обновляем направления по выбранному уровню
  function updateDirectionOptions() {
    const level = levelSelect.value;
    directionSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = level
      ? "Выберите направление"
      : "Сначала выберите уровень";
    directionSelect.appendChild(placeholder);

    if (!level || !DIRECTIONS_BY_LEVEL[level]) {
      return;
    }

    DIRECTIONS_BY_LEVEL[level].forEach((dir) => {
      const opt = document.createElement("option");
      opt.value = dir;
      opt.textContent = dir;
      directionSelect.appendChild(opt);
    });
  }

  // Простая валидация формы
  function validateForm() {
    const fio = fioInput.value.trim();
    const birth = birthInput.value.trim();
    const email = emailInput.value.trim();
    const docType = docTypeSelect.value;
    const level = levelSelect.value;
    const direction = directionSelect.value;

    const show = (msg) => {
      if (tg) {
        tg.showAlert(msg);
      } else {
        alert(msg);
      }
    };

    if (!fio) {
      show("Пожалуйста, укажите ФИО.");
      return false;
    }

    if (!birth) {
      show("Пожалуйста, укажите дату рождения.");
      return false;
    }

    if (!email) {
      show("Пожалуйста, укажите email.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show("Похоже, email указан неверно.");
      return false;
    }

    if (!docType) {
      show("Пожалуйста, выберите документ об образовании.");
      return false;
    }

    if (!level) {
      show("Пожалуйста, выберите уровень обучения.");
      return false;
    }

    if (!direction) {
      show("Пожалуйста, выберите направление подготовки.");
      return false;
    }

    return true;
  }

  // === СВЯЗКА ОБРАБОТЧИКОВ ===

  // При смене документа — обновить уровни
  docTypeSelect.addEventListener("change", updateLevelOptions);

  // При смене уровня — обновить направления
  levelSelect.addEventListener("change", updateDirectionOptions);

  // Отправка формы
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      fio: fioInput.value.trim(),
      birth: birthInput.value.trim(),
      email: emailInput.value.trim(),
      doc_type: docTypeSelect.value, // ВАЖНО: doc_type — как в bot.py
      level: levelSelect.value,
      direction: directionSelect.value,
    };

    console.log("Отправляем в бота:", payload);

    const msgOk =
      "Заявка отправлена, ожидайте ответ в чате бота.";

    if (tg) {
      try {
        tg.sendData(JSON.stringify(payload));
        tg.showAlert(msgOk);
        // Можно закрыть WebApp, если хочешь:
        // tg.close();
      } catch (err) {
        console.error("Ошибка при отправке данных в бота:", err);
        tg.showAlert(
          "Не удалось отправить заявку. Попробуйте ещё раз."
        );
      }
    } else {
      // Режим теста в обычном браузере
      alert(msgOk + "\n\n(Сейчас вы в тестовом режиме браузера.)");
    }
  });
});
