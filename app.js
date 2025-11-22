document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (!tg) {
    console.error("Telegram WebApp API не найден.");
    return;
  }
  tg.ready();
  tg.expand();

  const fioInput = document.getElementById("fio");
  const birthInput = document.getElementById("birth");
  const emailInput = document.getElementById("email");
  const docTypeSelect = document.getElementById("doc_type");
  const levelSelect = document.getElementById("level");
  const directionSelect = document.getElementById("direction");
  const form = document.getElementById("exam-form");

  const directions = {
    "Бакалавриат": [
      "Юриспруденция",
      "Менеджмент",
      "Государственное и муниципальное управление",
      "Экономика",
      "Управление персоналом",
      "Дизайн",
      "Бизнес‑информатика",
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

  function updateLevelOptions() {
    const doc = docTypeSelect.value;
    let allowedLevels = [];
    if (doc === "Аттестат" || doc === "Диплом колледжа") {
      allowedLevels = ["Бакалавриат"];
    } else if (doc === "Диплом бакалавра") {
      allowedLevels = ["Бакалавриат", "Магистратура"];
    } else if (doc === "Диплом специалиста" || doc === "Диплом магистра") {
      allowedLevels = ["Бакалавриат", "Магистратура", "Аспирантура"];
    }
    levelSelect.innerHTML = "";
    allowedLevels.forEach(lvl => {
      const opt = document.createElement("option");
      opt.value = lvl;
      opt.textContent = lvl;
      levelSelect.appendChild(opt);
    });
    // сразу заполняем направления для первого уровня
    if (allowedLevels.length > 0) {
      fillDirections(allowedLevels[0]);
    }
  }

  function fillDirections(level) {
    directionSelect.innerHTML = "";
    (directions[level] || []).forEach(dir => {
      const opt = document.createElement("option");
      opt.value = dir;
      opt.textContent = dir;
      directionSelect.appendChild(opt);
    });
  }

  docTypeSelect.addEventListener("change", updateLevelOptions);
  levelSelect.addEventListener("change", () => {
    fillDirections(levelSelect.value);
  });

  function validateForm() {
    const fio = fioInput.value.trim();
    const birth = birthInput.value;
    const email = emailInput.value.trim();
    const doc = docTypeSelect.value;
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tg.showAlert("Похоже, email указан неверно.");
      return false;
    }
    if (!doc) {
      tg.showAlert("Выберите документ об образовании.");
      return false;
    }
    if (!level) {
      tg.showAlert("Выберите уровень образования.");
      return false;
    }
    if (!direction) {
      tg.showAlert("Выберите направление подготовки.");
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
    tg.sendData(JSON.stringify(payload));
    tg.showAlert("Заявка отправлена, ожидайте ответ в чате бота.");
    // tg.close(); // можно закрыть веб‑апп здесь, если нужно
  });

  // Первичная инициализация списка уровней (если выбран первый пункт)
  updateLevelOptions();
});
