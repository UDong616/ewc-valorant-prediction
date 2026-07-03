(function () {
  const config = window.EVENT_CONFIG;
  const state = {
    qf: {},
    sf: {},
    thirdPlace: "",
    champion: ""
  };

  const elements = {
    deadlineText: document.querySelector("#deadlineText"),
    countdownText: document.querySelector("#countdownText"),
    scheduleList: document.querySelector("#scheduleList"),
    form: document.querySelector("#predictionForm"),
    formMount: document.querySelector("#formMount"),
    finalScore: document.querySelector("#finalScore"),
    formMessage: document.querySelector("#formMessage"),
    submitButton: document.querySelector("#submitButton"),
    leaderboardBody: document.querySelector("#leaderboardBody"),
    refreshLeaderboard: document.querySelector("#refreshLeaderboard")
  };

  const serverMessages = {
    CLOSED: "제출 마감 이후에는 제출할 수 없습니다.",
    DUPLICATE: "이미 같은 닉네임 또는 디시 식별번호로 제출된 기록이 있습니다.",
    EMPTY_PAYLOAD: "제출 데이터가 비어 있습니다.",
    INVALID_NICKNAME: "닉네임은 2~20자로 입력해 주세요.",
    INVALID_CODE: "참가 확인코드는 영문/숫자 4~12자로 입력해 주세요.",
    INVALID_IDENTIFIER: "디시 식별번호는 2~80자로 입력해 주세요.",
    INVALID_QF: "8강 예측값이 올바르지 않습니다.",
    INVALID_SF: "4강 예측값이 8강 예측과 맞지 않습니다.",
    INVALID_FINALISTS: "결승 진출팀 값이 4강 예측과 맞지 않습니다.",
    INVALID_THIRD_PLACE: "3위 결정전 예측값이 4강 예측과 맞지 않습니다.",
    INVALID_CHAMPION: "우승팀 예측값이 결승 진출팀과 맞지 않습니다.",
    INVALID_SCORE: "결승 스코어 예측값이 올바르지 않습니다.",
    SERVER_ERROR: "서버 처리 중 오류가 발생했습니다."
  };

  function formatDateTime(value) {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isWebAppConfigured() {
    return config.webAppUrl && !config.webAppUrl.startsWith("TODO_");
  }

  function setMessage(text, type) {
    elements.formMessage.textContent = text;
    elements.formMessage.className = `message ${type || ""}`.trim();
  }

  function getServerMessage(result, fallback) {
    if (result && result.message) return result.message;
    if (result && result.code && serverMessages[result.code]) return serverMessages[result.code];
    return fallback || serverMessages.SERVER_ERROR;
  }

  function getNetworkErrorMessage(error) {
    if (error instanceof TypeError) {
      return "네트워크 연결 또는 배포 권한 문제로 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }
    return error && error.message ? error.message : "네트워크 오류가 발생했습니다.";
  }

  function getScheduleMatchup(match) {
    const quarterfinal = config.quarterfinals.find((item) => item.id === match.id);
    if (quarterfinal && quarterfinal.teams) return quarterfinal.teams.join(" vs ");
    if (match.matchup) return match.matchup;
    if (match.teams) return match.teams.join(" vs ");
    return "대진 미정";
  }

  function getQuarterfinalWinner(matchId) {
    return state.qf[matchId] || "";
  }

  function getSemifinalOptions(pair) {
    return pair.from.map(getQuarterfinalWinner).filter(Boolean);
  }

  function getSemifinalLosers() {
    return config.semifinalPairs
      .map((pair) => {
        const options = getSemifinalOptions(pair);
        const winner = state.sf[pair.id];
        return options.find((team) => team !== winner) || "";
      })
      .filter(Boolean);
  }

  function renderDeadline() {
    const deadline = new Date(config.submissionDeadline);
    elements.deadlineText.textContent = `${formatDateTime(deadline)} ${config.timezoneLabel}`;

    function tick() {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) {
        elements.countdownText.textContent = "제출 마감";
        elements.submitButton.disabled = true;
        return;
      }

      const totalMinutes = Math.floor(diff / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      elements.countdownText.textContent = `${days}일 ${hours}시간 ${minutes}분 남음`;
    }

    tick();
    window.setInterval(tick, 30000);
  }

  function renderSchedule() {
    const matches = config.schedule || config.quarterfinals;
    const scheduleItems = matches
      .map(
        (match) => {
          const matchup = getScheduleMatchup(match);
          return `
            <article class="schedule-item">
              <div>
                <strong>${escapeHtml(match.title)}</strong>
                <span>${escapeHtml(matchup)}</span>
              </div>
              <time datetime="${escapeHtml(match.startsAt)}">${escapeHtml(match.displayTime || formatDateTime(match.startsAt))}</time>
            </article>
          `;
        }
      )
      .join("");

    elements.scheduleList.innerHTML = scheduleItems;
  }

  function renderFinalScoreOptions() {
    elements.finalScore.innerHTML = [
      '<option value="">스코어 선택</option>',
      ...config.finalScoreOptions.map(
        (score) => `<option value="${escapeHtml(score)}">${escapeHtml(score)}</option>`
      )
    ].join("");
  }

  function renderPredictionForm() {
    const qfHtml = config.quarterfinals
      .map(
        (match) => `
          <fieldset class="match-card">
            <legend>${escapeHtml(match.title)}</legend>
            <p>${escapeHtml(match.teams.join(" vs "))}</p>
            <div class="choice-row">
              ${match.teams
                .map(
                  (team) => `
                    <label>
                      <input type="radio" name="${escapeHtml(match.id)}" value="${escapeHtml(team)}" required>
                      <span>${escapeHtml(team)}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </fieldset>
        `
      )
      .join("");

    const sfHtml = config.semifinalPairs
      .map(
        (pair) => `
          <label class="field match-card">
            <span>${escapeHtml(pair.title)}</span>
            <select name="${escapeHtml(pair.id)}" data-semifinal="${escapeHtml(pair.id)}" required disabled>
              <option value="">8강 승자를 먼저 선택</option>
            </select>
          </label>
        `
      )
      .join("");

    const finalsHtml = `
      <label class="field match-card">
        <span>3위 결정전 승자</span>
        <select name="thirdPlace" data-third-place required disabled>
          <option value="">4강 승자를 먼저 선택</option>
        </select>
      </label>
      <label class="field match-card">
        <span>우승팀</span>
        <select name="champion" data-champion required disabled>
          <option value="">4강 승자를 먼저 선택</option>
        </select>
      </label>
    `;

    elements.formMount.innerHTML = qfHtml + sfHtml + finalsHtml;
  }

  function updateSelect(select, options, placeholder, currentValue) {
    const selected = options.includes(currentValue) ? currentValue : "";
    select.disabled = options.length === 0;
    select.innerHTML = [
      `<option value="">${escapeHtml(placeholder)}</option>`,
      ...options.map(
        (team) =>
          `<option value="${escapeHtml(team)}" ${team === selected ? "selected" : ""}>${escapeHtml(team)}</option>`
      )
    ].join("");
  }

  function updateDerivedFields() {
    config.semifinalPairs.forEach((pair) => {
      const select = elements.form.querySelector(`[data-semifinal="${pair.id}"]`);
      const options = getSemifinalOptions(pair);
      updateSelect(select, options, "승자 선택", state.sf[pair.id]);
      state.sf[pair.id] = select.value;
    });

    const finalists = config.semifinalPairs.map((pair) => state.sf[pair.id]).filter(Boolean);
    const thirdPlaceOptions = getSemifinalLosers();

    updateSelect(
      elements.form.querySelector("[data-third-place]"),
      thirdPlaceOptions,
      "3위 결정전 승자 선택",
      state.thirdPlace
    );
    updateSelect(
      elements.form.querySelector("[data-champion]"),
      finalists,
      "우승팀 선택",
      state.champion
    );
  }

  function bindFormEvents() {
    elements.form.addEventListener("change", (event) => {
      const target = event.target;
      if (target.name && target.name.startsWith("qf")) {
        state.qf[target.name] = target.value;
        config.semifinalPairs.forEach((pair) => {
          if (pair.from.includes(target.name)) {
            state.sf[pair.id] = "";
          }
        });
        state.thirdPlace = "";
        state.champion = "";
        updateDerivedFields();
      }

      if (target.dataset.semifinal) {
        state.sf[target.dataset.semifinal] = target.value;
        state.thirdPlace = "";
        state.champion = "";
        updateDerivedFields();
      }

      if (target.dataset.thirdPlace !== undefined) {
        state.thirdPlace = target.value;
      }

      if (target.dataset.champion !== undefined) {
        state.champion = target.value;
      }
    });

    elements.form.addEventListener("submit", handleSubmit);
  }

  function collectPayload() {
    const formData = new FormData(elements.form);
    const predictions = {};

    config.quarterfinals.forEach((match) => {
      predictions[match.id] = formData.get(match.id);
    });
    config.semifinalPairs.forEach((pair) => {
      predictions[pair.id] = formData.get(pair.id);
    });

    predictions.finalists = config.semifinalPairs.map((pair) => formData.get(pair.id));
    predictions.thirdPlace = formData.get("thirdPlace");
    predictions.champion = formData.get("champion");
    predictions.finalScore = formData.get("finalScore");

    return {
      nickname: formData.get("nickname"),
      participantCode: formData.get("participantCode"),
      dcIdentifier: formData.get("dcIdentifier"),
      predictions
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("", "");

    if (!isWebAppConfigured()) {
      setMessage("config.js의 webAppUrl을 Apps Script Web App URL로 교체해야 제출할 수 있습니다.", "error");
      return;
    }

    const payload = collectPayload();
    elements.submitButton.disabled = true;
    elements.submitButton.textContent = "제출 중";

    try {
      const response = await fetch(config.webAppUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!result.ok) {
        throw new Error(getServerMessage(result, "제출에 실패했습니다."));
      }

      setMessage("제출이 완료되었습니다. 수정은 불가하며, 중복 제출은 최초 제출만 인정됩니다.", "success");
      elements.form.reset();
      elements.submitButton.disabled = true;
      await loadLeaderboard();
    } catch (error) {
      setMessage(getNetworkErrorMessage(error), "error");
      elements.submitButton.disabled = false;
    } finally {
      elements.submitButton.textContent = "제출하기";
    }
  }

  async function loadLeaderboard() {
    if (!isWebAppConfigured()) {
      elements.leaderboardBody.innerHTML = `
        <tr>
          <td>1</td>
          <td>예시닉</td>
          <td>0</td>
          <td>0</td>
          <td>Web App URL 설정 전</td>
        </tr>
      `;
      return;
    }

    try {
      const response = await fetch(`${config.webAppUrl}?action=leaderboard&_=${Date.now()}`);
      const result = await response.json();
      const rows = result.rows || [];

      if (rows.length === 0) {
        elements.leaderboardBody.innerHTML = '<tr><td colspan="5">아직 공개된 순위가 없습니다.</td></tr>';
        return;
      }

      elements.leaderboardBody.innerHTML = rows
        .map(
          (row) => `
            <tr>
              <td>${escapeHtml(row.rank)}</td>
              <td>${escapeHtml(row.nickname)}</td>
              <td>${escapeHtml(row.score)}</td>
              <td>${escapeHtml(row.hits)}</td>
              <td>${escapeHtml(row.submittedAt)}</td>
            </tr>
          `
        )
        .join("");
    } catch (error) {
      elements.leaderboardBody.innerHTML =
        '<tr><td colspan="5">순위표를 불러오지 못했습니다.</td></tr>';
    }
  }

  function init() {
    document.title = config.eventName;
    renderDeadline();
    renderSchedule();
    renderPredictionForm();
    renderFinalScoreOptions();
    updateDerivedFields();
    bindFormEvents();
    elements.refreshLeaderboard.addEventListener("click", loadLeaderboard);
    loadLeaderboard();
  }

  init();
})();
