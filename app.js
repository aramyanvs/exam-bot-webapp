// app.js

// Ждём, пока загрузится DOM
document.addEventListener("DOMContentLoaded", function () {
  // Объект Telegram WebApp
  const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

  if (!tg) {
    console.error("Telegram WebApp API не найден. Проверь <script src=\"https://telegram.org/js/telegram-web-app.js\"></script> в HTML.");
    return;
  }

  // Сообщаем Telegram, что WebApp готов
  tg.ready();

  // Берём элементы формы
  const form = document.getElementById("exam-form");
  const fioInput = document.getElementById("fio");
  const birthInput = document.getElementById("birth");
  const emailInput = document.getElementById("email");
  const docTypeSelect = document.getElementById("doc_type");
  const levelSelect = document.getElementById("level");
  const directionSelect = document.getElementById("direction");

  if (!form || !fioInput || !birthInput || !emailInput || !docTypeSelect || !levelSelect || !directionSelect) {
    console.error("Не найдены какие-то элементы формы. Проверь id полей в HTML.");
    return;
  }

  // === ЛОГИКА ВЫБОРА УРОВНЯ В ЗАВИСИМОСТИ ОТ ДОКУМЕНТА ===
  // Пример:
  // - Аттестат / Диплом колледжа -> только Бакалавриат
  // - Диплом бакалавра -> Бакалавриат + Магистратура
  // - Диплом специалиста / магистра -> все три уровня

  const ALL_LEVEL_OPTIONS = [
    { value: "Бакалавриат", label: "Бакалавриат" },
    { value: "Магистратура", label: "Магистратура" },
    { value: "Аспирантура", label: "Аспирантура" },
  ];

  function updateLevelOptions() {
    const docType = docTypeSelect.value;

    let allowedLevels = [];

    if (docType === "Аттестат" || docType === "Диплом колледжа") {
      allowedLevels = ["Бакалавриат"];
    } else if (docType === "Диплом бакалавра") {
      allowedLevels = ["Бакалавриат", "Магистратура"];
    } else if (docType === "Диплом специалиста" || docType === "Диплом магистра") {
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    } else {
      // если что-то непонятное — даём все уровни
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }

    // Чистим select
    levelSelect.innerHTML = "";

    // Добавляем только разрешённые уровни
    ALL_LEVEL_OPTIONS.forEach((opt) => {
      if (allowedLevels.includes(opt.value)) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        levelSelect.appendChild(option);
      }
    });
  }

  // Обновляем уровни при смене типа документа
  docTypeSelect.addEventListener("change", updateLevelOptions);

  // Первый вызов при загрузке
  updateLevelOptions();

  // === ПРОСТАЯ ВАЛИДАЦИЯ ===

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

    // Простейшая проверка email
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

    console.log("Отправляем в бот:", payload);

    try {
      // КЛЮЧЕВАЯ СТРОКА: данные улетают в бота
      tg.sendData(JSON.stringify(payload));

      // Показываем пользователю сообщение
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");

      // Можно закрыть WebApp (по желанию)
      // tg.close();
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  });
});
