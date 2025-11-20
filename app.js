// app.js
document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

  if (!tg) {
    console.error(
      'Telegram WebApp API не найден. Убедись, что открыт мини-приложение через кнопку в боте, а в HTML подключен <script src="https://telegram.org/js/telegram-web-app.js"></script>.'
    );
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
    } else if (docType === "Диплом специалиста" || docType === "Диплом магистра") {
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    } else {
      allowedLevels = [];
    }

    levelSelect.innerHTML = "";

    allowedLevels.forEach((lvl) => {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = lvl;
      levelSelect.appendChild(opt);
    });

    if (allowedLevels.length > 0) {
      fillDirections(allowedLevels[0]);
    } else {
      directionSelect.innerHTML = "";
    }
  }

  docTypeSelect.addEventListener("change", () => {
    updateLevelOptions();
  });

  levelSelect.addEventListener("change", () => {
    const level = levelSelect.value;
    fillDirections(level);
  });

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

  form.addEventListener("submit", (e) => {
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
      tg.sendData(JSON.stringify(payload));
      tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
      // при желании можно закрыть:
      // tg.close();
    } catch (err) {
      console.error("Ошибка при отправке данных в бота:", err);
      tg.showAlert("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  });

  // первоначальная инициализация селектов
  updateLevelOptions();
});
