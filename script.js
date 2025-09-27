const BOARD_SIZE = 9;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const STORAGE_KEY = "progress-v1";
const MAX_HINTS = 3;
const NOTES_MODE_STORAGE_KEY = "preference-notes-mode";

const baseStageDefinitions = [
  { id: 1, name: "北海道", neighbors: [2], mapGrid: { col: 8, row: 1, colSpan: 3, rowSpan: 2 } },
  { id: 2, name: "青森県", neighbors: [3, 4], mapGrid: { col: 9, row: 3 } },
  { id: 3, name: "岩手県", neighbors: [5], mapGrid: { col: 9, row: 4 } },
  { id: 4, name: "秋田県", neighbors: [6], mapGrid: { col: 8, row: 4 } },
  { id: 5, name: "宮城県", neighbors: [7, 8], mapGrid: { col: 9, row: 5 } },
  { id: 6, name: "山形県", neighbors: [7, 11], mapGrid: { col: 8, row: 5 } },
  { id: 7, name: "福島県", neighbors: [9, 11], mapGrid: { col: 9, row: 6 } },
  { id: 8, name: "茨城県", neighbors: [9, 15], mapGrid: { col: 10, row: 7 } },
  { id: 9, name: "栃木県", neighbors: [10, 14], mapGrid: { col: 9, row: 7 } },
  { id: 10, name: "群馬県", neighbors: [11, 14], mapGrid: { col: 8, row: 7 } },
  { id: 11, name: "新潟県", neighbors: [12, 19], mapGrid: { col: 7, row: 6 } },
  { id: 12, name: "長野県", neighbors: [13, 22], mapGrid: { col: 8, row: 8 } },
  { id: 13, name: "山梨県", neighbors: [16, 18], mapGrid: { col: 8, row: 9 } },
  { id: 14, name: "埼玉県", neighbors: [16, 17], mapGrid: { col: 9, row: 8 } },
  { id: 15, name: "千葉県", neighbors: [16], mapGrid: { col: 10, row: 8 } },
  { id: 16, name: "東京都", neighbors: [17], mapGrid: { col: 9, row: 9 } },
  { id: 17, name: "神奈川県", neighbors: [18], mapGrid: { col: 9, row: 10 } },
  { id: 18, name: "静岡県", neighbors: [23], mapGrid: { col: 8, row: 10 } },
  { id: 19, name: "富山県", neighbors: [20, 22], mapGrid: { col: 7, row: 7 } },
  { id: 20, name: "石川県", neighbors: [21], mapGrid: { col: 6, row: 7 } },
  { id: 21, name: "福井県", neighbors: [22, 25], mapGrid: { col: 6, row: 8 } },
  { id: 22, name: "岐阜県", neighbors: [23, 25], mapGrid: { col: 7, row: 8 } },
  { id: 23, name: "愛知県", neighbors: [24, 29], mapGrid: { col: 7, row: 9 } },
  { id: 24, name: "三重県", neighbors: [25, 29], mapGrid: { col: 7, row: 11 } },
  { id: 25, name: "滋賀県", neighbors: [26], mapGrid: { col: 6, row: 9 } },
  { id: 26, name: "京都府", neighbors: [27, 28], mapGrid: { col: 6, row: 11 } },
  { id: 27, name: "大阪府", neighbors: [29], mapGrid: { col: 7, row: 12 } },
  { id: 28, name: "兵庫県", neighbors: [30, 35], mapGrid: { col: 5, row: 12 } },
  { id: 29, name: "和歌山県", neighbors: [35], mapGrid: { col: 7, row: 13 } },
  { id: 30, name: "鳥取県", neighbors: [31, 32], mapGrid: { col: 5, row: 13 } },
  { id: 31, name: "島根県", neighbors: [33], mapGrid: { col: 4, row: 13 } },
  { id: 32, name: "岡山県", neighbors: [33, 36], mapGrid: { col: 5, row: 14 } },
  { id: 33, name: "広島県", neighbors: [34, 37], mapGrid: { col: 5, row: 15 } },
  { id: 34, name: "山口県", neighbors: [39], mapGrid: { col: 4, row: 16 } },
  { id: 35, name: "徳島県", neighbors: [36, 38], mapGrid: { col: 8, row: 13 } },
  { id: 36, name: "香川県", neighbors: [37], mapGrid: { col: 8, row: 12 } },
  { id: 37, name: "愛媛県", neighbors: [39, 43], mapGrid: { col: 6, row: 14 } },
  { id: 38, name: "高知県", neighbors: [44], mapGrid: { col: 8, row: 14 } },
  { id: 39, name: "福岡県", neighbors: [40, 42], mapGrid: { col: 3, row: 15 } },
  { id: 40, name: "佐賀県", neighbors: [41], mapGrid: { col: 3, row: 16 } },
  { id: 41, name: "長崎県", neighbors: [45], mapGrid: { col: 2, row: 16 } },
  { id: 42, name: "熊本県", neighbors: [43, 44], mapGrid: { col: 4, row: 16 } },
  { id: 43, name: "大分県", neighbors: [44], mapGrid: { col: 4, row: 15 } },
  { id: 44, name: "宮崎県", neighbors: [45], mapGrid: { col: 4, row: 17 } },
  { id: 45, name: "鹿児島県", neighbors: [46], mapGrid: { col: 4, row: 18 } },
  { id: 46, name: "沖縄県", neighbors: [47, 48], mapGrid: { col: 7, row: 18 } },
  { id: 47, name: "アメリカ", neighbors: [49, 50], position: { x: 80, y: 34 } },
  { id: 48, name: "イギリス", neighbors: [49, 51], position: { x: 86, y: 48 } },
  { id: 49, name: "フランス", neighbors: [52], position: { x: 84, y: 56 } },
  { id: 50, name: "ドイツ", neighbors: [52, 53], position: { x: 88, y: 62 } },
  { id: 51, name: "中国", neighbors: [53], position: { x: 78, y: 44 } },
  { id: 52, name: "オーストラリア", neighbors: [54], position: { x: 92, y: 74 } },
  { id: 53, name: "インド", neighbors: [54, 55], position: { x: 82, y: 66 } },
  { id: 54, name: "月", neighbors: [55], position: { x: 88, y: 76 } },
  { id: 55, name: "太陽", neighbors: [56], position: { x: 90, y: 84 } },
  { id: 56, name: "奈良県", neighbors: [], position: { x: 94, y: 90 } },
];

const clueSchedule = [
  47, 47, 46, 46, 45, 44, 44, 43, 43, 42,
  41, 41, 40, 40, 39, 38, 38, 37, 37, 36,
  35, 35, 34, 34, 33, 32, 32, 31, 31, 30,
  29, 29, 28, 28, 27, 26, 26, 25, 25, 24,
  23, 23, 22, 21, 21, 20, 19, 18, 18, 17,
  17, 16, 16, 15, 15, 14,
];

function getDifficultyLabel(clues) {
  if (clues >= 40) return "初級";
  if (clues >= 35) return "初級+";
  if (clues >= 30) return "初中級";
  if (clues >= 24) return "中級";
  return "中級+";
}

const stageConfigs = baseStageDefinitions.map((definition, index) => {
  const clues = clueSchedule[index] ?? clueSchedule[clueSchedule.length - 1];
  return {
    ...definition,
    seed: 24601 + definition.id * 73,
    clues,
    difficulty: getDifficultyLabel(clues),
    parents: [],
  };
});

const stageById = new Map(stageConfigs.map((stage) => [stage.id, stage]));
stageConfigs.forEach((stage) => {
  stage.neighbors.forEach((neighborId) => {
    const neighbor = stageById.get(neighborId);
    if (neighbor) {
      neighbor.parents.push(stage.id);
    }
  });
});

const PREFECTURE_STAGE_LIMIT = 46;

const START_STAGE_ID = stageConfigs[0]?.id ?? 1;

const elements = {
  board: document.getElementById("sudokuBoard"),
  stageSelect: document.getElementById("stageSelect"),
  resetProgress: document.getElementById("resetProgress"),
  resetStage: document.getElementById("resetStage"),
  stageNumber: document.getElementById("stageNumber"),
  stageName: document.getElementById("stageName"),
  stageDifficulty: document.getElementById("stageDifficulty"),
  currentTime: document.getElementById("currentTime"),
  bestTime: document.getElementById("bestTime"),
  progressFill: document.getElementById("progressFill"),
  progressLabel: document.getElementById("progressLabel"),
  notesToggle: document.getElementById("notesToggle"),
  hintButton: document.getElementById("hintButton"),
  numberPad: document.querySelector(".number-pad"),
  checkSolutionButton: document.getElementById("checkSolution"),
  hintCount: document.getElementById("hintCount"),
  statusMessage: document.getElementById("statusMessage"),
  japanMap: document.getElementById("japanMap"),
  worldStageList: document.getElementById("worldStageList"),
  worldUnlockMessage: document.getElementById("worldUnlockMessage"),
  openStageModalButton: document.getElementById("openStageModal"),
  stageModal: document.getElementById("stageModal"),
  stageModalContent: document.querySelector(".stage-modal__content"),
  closeStageModalButton: document.getElementById("closeStageModal"),
  stageModalSubtitle: document.getElementById("stageModalSubtitle"),
  currentStageBadge: document.getElementById("currentStageBadge"),
  celebrationOverlay: document.getElementById("celebrationOverlay"),
  celebrationOverlayBackdrop: document.getElementById("celebrationOverlayBackdrop"),
  celebrationContent: document.getElementById("celebrationContent"),
  celebrationStage: document.getElementById("celebrationStage"),
  celebrationTitle: document.getElementById("celebrationTitle"),
  celebrationMessage: document.getElementById("celebrationMessage"),
  celebrationTime: document.getElementById("celebrationTime"),
  celebrationBest: document.getElementById("celebrationBest"),
  celebrationMapButton: document.getElementById("celebrationMapButton"),
  celebrationCloseButton: document.getElementById("celebrationCloseButton"),
};

const cellTemplate = document.getElementById("cellTemplate");
const cells = [];

let stageData = [];
let currentStageIndex = 0;
let puzzle = [];
let solution = [];
let values = [];
let notes = [];
let selectedIndex = null;
let timerInterval = null;
let timerStart = null;
let lastElapsedSeconds = 0;
const history = [];
let historyPointer = -1;
let progress = loadProgress();
let hintsUsed = 0;
let lastFocusedElementBeforeStageModal = null;
let stageModalOpen = false;
let celebrationOverlayOpen = false;
let lastFocusedBeforeCelebration = null;
let validationActive = false;

const stageNodeElements = new Map();
const worldStageElements = new Map();

init();

function init() {
  stageData = stageConfigs.map(generateStage);
  buildBoard();
  buildStageMap();
  populateStageSelect();
  applySavedTogglePreferences();
  const stageToLoad = ensureStageIsPlayable(progress.currentStage || 1);
  loadStageById(stageToLoad);
  attachEventListeners();
  updateProgressUI();
  registerServiceWorker();
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        currentStage: START_STAGE_ID,
        clearedStages: [],
        bestTimes: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      currentStage: parsed.currentStage ?? START_STAGE_ID,
      clearedStages: Array.isArray(parsed.clearedStages) ? parsed.clearedStages : [],
      bestTimes: parsed.bestTimes ?? {},
    };
  } catch (error) {
    console.error("Failed to parse progress", error);
    return {
      currentStage: START_STAGE_ID,
      clearedStages: [],
      bestTimes: {},
    };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadBooleanPreference(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === "true";
  } catch (error) {
    console.warn(`Failed to load preference for ${key}`, error);
    return defaultValue;
  }
}

function saveBooleanPreference(key, value) {
  try {
    localStorage.setItem(key, value ? "true" : "false");
  } catch (error) {
    console.warn(`Failed to save preference for ${key}`, error);
  }
}

function applySavedTogglePreferences() {
  if (elements.notesToggle) {
    elements.notesToggle.checked = loadBooleanPreference(NOTES_MODE_STORAGE_KEY, false);
  }
}

function getAvailableStageIds() {
  const unlocked = getUnlockedStageIds();
  const cleared = new Set(progress.clearedStages);
  const available = new Set();
  unlocked.forEach((stageId) => {
    if (!cleared.has(stageId)) {
      available.add(stageId);
    }
  });
  return available;
}

function getUnlockedStageIds() {
  const cleared = new Set(progress.clearedStages);
  const unlocked = new Set(progress.clearedStages);
  const startStageId = stageConfigs[0]?.id;
  if (startStageId) {
    unlocked.add(startStageId);
  }
  stageConfigs.forEach((stage) => {
    if (stage.parents.length === 0) {
      unlocked.add(stage.id);
      return;
    }
    const anyParentCleared = stage.parents.some((parentId) => cleared.has(parentId));
    if (anyParentCleared) {
      unlocked.add(stage.id);
    }
  });
  return unlocked;
}

function ensureStageIsPlayable(stageId) {
  const unlocked = getUnlockedStageIds();
  if (unlocked.has(stageId)) {
    return stageId;
  }
  const available = Array.from(getAvailableStageIds()).sort((a, b) => a - b);
  if (available.length > 0) {
    return available[0];
  }
  return START_STAGE_ID;
}

function toggleNotesMode({ announce = true } = {}) {
  elements.notesToggle.checked = !elements.notesToggle.checked;
  saveBooleanPreference(NOTES_MODE_STORAGE_KEY, elements.notesToggle.checked);
  if (announce) {
    setStatus(elements.notesToggle.checked ? "メモモードをオン" : "メモモードをオフ", "info");
  }
}

function isStageModalCurrentlyOpen() {
  return stageModalOpen;
}

function getStageModalFocusableElements() {
  if (!elements.stageModal) return [];
  return Array.from(
    elements.stageModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((node) => !node.hasAttribute("disabled"));
}

function formatStageLabel(stage) {
  if (!stage) return "";
  return `ステージ${stage.id.toString().padStart(2, "0")}｜${stage.name}`;
}

function isCelebrationOverlayOpen() {
  return celebrationOverlayOpen;
}

function getCelebrationFocusableElements() {
  if (!elements.celebrationOverlay) return [];
  return Array.from(
    elements.celebrationOverlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((node) => !node.hasAttribute("disabled"));
}

function openCelebrationOverlay({ stage, elapsedSeconds, bestUpdated }) {
  if (!elements.celebrationOverlay || !elements.celebrationContent) {
    openStageModal({ celebrate: true });
    return;
  }
  celebrationOverlayOpen = true;
  lastFocusedBeforeCelebration =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const stageLabel = formatStageLabel(stage);
  if (elements.celebrationStage) {
    elements.celebrationStage.textContent = stageLabel;
  }
  if (elements.celebrationMessage) {
    const timeText = formatTime(elapsedSeconds);
    elements.celebrationMessage.textContent = bestUpdated
      ? `${stage?.name ?? "ステージ"}を ${timeText} でクリア！ベストを更新しました。`
      : `${stage?.name ?? "ステージ"}を ${timeText} でクリアしました！`;
  }
  if (elements.celebrationTime) {
    elements.celebrationTime.textContent = formatTime(elapsedSeconds);
  }
  if (elements.celebrationBest) {
    const best = stage ? progress.bestTimes[stage.id] : null;
    const bestText = best ? formatTime(best) : "--:--";
    elements.celebrationBest.textContent = bestUpdated && best ? `NEW! ${bestText}` : bestText;
    elements.celebrationBest.classList.toggle("celebration-overlay__value--new", bestUpdated && Boolean(best));
  }
  elements.celebrationOverlay.hidden = false;
  elements.celebrationOverlay.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    const focusable = getCelebrationFocusableElements();
    const target = focusable[0] || elements.celebrationContent;
    target?.focus({ preventScroll: true });
  });
}

function closeCelebrationOverlay({ openStageModalAfter = false } = {}) {
  if (!celebrationOverlayOpen || !elements.celebrationOverlay) {
    if (openStageModalAfter) {
      openStageModal({ celebrate: true });
    }
    return;
  }
  celebrationOverlayOpen = false;
  elements.celebrationOverlay.hidden = true;
  elements.celebrationOverlay.setAttribute("aria-hidden", "true");
  elements.celebrationBest?.classList.remove("celebration-overlay__value--new");
  const previousFocus = lastFocusedBeforeCelebration;
  lastFocusedBeforeCelebration = null;
  if (openStageModalAfter) {
    requestAnimationFrame(() => openStageModal({ celebrate: true }));
    return;
  }
  if (previousFocus instanceof HTMLElement) {
    previousFocus.focus({ preventScroll: true });
  }
}

function handleCelebrationKeydown(event) {
  if (!isCelebrationOverlayOpen()) return;
  if (event.key === "Escape" || event.key === "Esc") {
    closeCelebrationOverlay();
    event.preventDefault();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = getCelebrationFocusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const currentIndex = focusable.indexOf(document.activeElement);
  let nextIndex = currentIndex;
  if (event.shiftKey) {
    nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
  }
  focusable[nextIndex].focus();
  event.preventDefault();
}

function updateStageModalSubtitle({ celebrate = false } = {}) {
  if (!elements.stageModalSubtitle) return;
  const available = Array.from(getAvailableStageIds()).sort((a, b) => a - b);
  if (available.length === 0) {
    elements.stageModalSubtitle.textContent = celebrate
      ? "全ステージクリアおめでとうございます！奈良県も征服しました。"
      : "挑戦可能なステージはすべて制覇しました。お疲れさまでした！";
    return;
  }
  const choiceNames = available
    .map((id) => stageById.get(id))
    .filter(Boolean)
    .slice(0, 3)
    .map((stage) => formatStageLabel(stage));
  let choiceText = choiceNames.join(" / ");
  if (choiceNames.length === 2) {
    choiceText = `${choiceNames[0]} と ${choiceNames[1]}`;
  } else if (choiceNames.length >= 3) {
    const head = choiceNames.slice(0, -1).join("、");
    choiceText = `${head}、そして ${choiceNames[choiceNames.length - 1]}`;
  }
  elements.stageModalSubtitle.textContent = celebrate
    ? `おめでとう！次は ${choiceText} から選べます。ワクワクするルートを選んでください。`
    : `挑戦したいステージを選びましょう。今は ${choiceText} が挑戦可能です。`;
}

function openStageModal({ celebrate = false } = {}) {
  if (!elements.stageModal || !elements.stageModalContent) return;
  if (!elements.stageModal.hidden) {
    elements.stageModalContent.classList.toggle("stage-modal__content--celebrate", celebrate);
    updateStageModalSubtitle({ celebrate });
    return;
  }
  updateStageModalSubtitle({ celebrate });
  stageModalOpen = true;
  lastFocusedElementBeforeStageModal =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  elements.stageModal.hidden = false;
  elements.stageModal.setAttribute("aria-hidden", "false");
  elements.stageModalContent.classList.toggle("stage-modal__content--celebrate", celebrate);
  document.body.classList.add("stage-modal-open");
  const focusable = getStageModalFocusableElements();
  const target = focusable[0] || elements.stageModalContent;
  target.focus({ preventScroll: true });
}

function closeStageModal({ restoreFocus = true } = {}) {
  if (!elements.stageModal || !stageModalOpen) return;
  stageModalOpen = false;
  elements.stageModal.hidden = true;
  elements.stageModal.setAttribute("aria-hidden", "true");
  elements.stageModalContent?.classList.remove("stage-modal__content--celebrate");
  document.body.classList.remove("stage-modal-open");
  if (restoreFocus && lastFocusedElementBeforeStageModal instanceof HTMLElement) {
    lastFocusedElementBeforeStageModal.focus({ preventScroll: true });
  }
  lastFocusedElementBeforeStageModal = null;
}

function handleStageModalKeydown(event) {
  if (!isStageModalCurrentlyOpen()) return;
  if (event.key === "Escape" || event.key === "Esc") {
    closeStageModal();
    event.preventDefault();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = getStageModalFocusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const currentIndex = focusable.indexOf(document.activeElement);
  let nextIndex = currentIndex;
  if (event.shiftKey) {
    nextIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
  }
  focusable[nextIndex].focus();
  event.preventDefault();
}

function attachEventListeners() {
  elements.openStageModalButton?.addEventListener("click", () => openStageModal());
  elements.closeStageModalButton?.addEventListener("click", () => closeStageModal());
  elements.stageModal?.addEventListener("click", (event) => {
    if (event.target === elements.stageModal) {
      closeStageModal();
    }
  });
  elements.stageModal?.addEventListener("keydown", handleStageModalKeydown);

  elements.celebrationMapButton?.addEventListener("click", () =>
    closeCelebrationOverlay({ openStageModalAfter: true })
  );
  elements.celebrationCloseButton?.addEventListener("click", () => closeCelebrationOverlay());
  elements.celebrationOverlay?.addEventListener("click", (event) => {
    if (
      event.target === elements.celebrationOverlay ||
      event.target === elements.celebrationOverlayBackdrop
    ) {
      closeCelebrationOverlay();
    }
  });
  elements.celebrationOverlay?.addEventListener("keydown", handleCelebrationKeydown);

  elements.stageSelect.addEventListener("change", (event) => {
    const stageNumber = Number(event.target.value);
    const targetStage = stageById.get(stageNumber);
    if (isStageLocked(stageNumber)) {
      elements.stageSelect.value = stageConfigs[currentStageIndex].id;
      const stageLabel = targetStage ? targetStage.name : `ステージ${stageNumber}`;
      setStatus(`${stageLabel}はまだ解放されていません。`, "warning");
      return;
    }
    loadStageById(stageNumber);
  });

  elements.resetStage?.addEventListener("click", () => {
    if (
      confirm(
        "このステージを最初からやり直しますか？現在の盤面とメモは失われます。"
      )
    ) {
      resetCurrentStage();
    }
  });

  elements.resetProgress.addEventListener("click", () => {
    if (confirm("進行状況をリセットしますか？すべてのベストタイムも消去されます。")) {
      progress = { currentStage: START_STAGE_ID, clearedStages: [], bestTimes: {} };
      saveProgress();
      populateStageSelect();
      updateStageMap();
      loadStageById(START_STAGE_ID);
      setStatus("進行状況をリセットしました。", "info");
    }
  });

  elements.numberPad.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("button[data-value]");
    if (!button || selectedIndex === null) return;
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      event.preventDefault();
      button.dataset.touchHandled = "true";
      const value = Number(button.dataset.value);
      const useNotes = elements.notesToggle.checked && value !== 0;
      handleInputValue(value, { useNotes });
    }
  });

  elements.numberPad.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button || selectedIndex === null) return;
    if (button.dataset.touchHandled === "true") {
      button.dataset.touchHandled = "";
      return;
    }
    const value = Number(button.dataset.value);
    const useNotes =
      (elements.notesToggle.checked || event.shiftKey || event.altKey || event.metaKey) && value !== 0;
    handleInputValue(value, { useNotes });
  });

  elements.notesToggle.addEventListener("change", () => {
    setStatus(elements.notesToggle.checked ? "メモモードをオン" : "メモモードをオフ", "info");
    saveBooleanPreference(NOTES_MODE_STORAGE_KEY, elements.notesToggle.checked);
  });

  elements.hintButton.addEventListener("click", useHint);
  elements.checkSolutionButton?.addEventListener("click", attemptSubmitSolution);

  document.addEventListener("keydown", handleKeydown);
}

function buildBoard() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < TOTAL_CELLS; index++) {
    const cell = cellTemplate.content.firstElementChild.cloneNode(true);
    cell.dataset.index = index;
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.addEventListener("click", () => selectCell(index));
    cell.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        event.preventDefault();
        selectCell(index);
      }
    });
    cells.push(cell);
    fragment.appendChild(cell);
  }
  elements.board.appendChild(fragment);
}

function buildStageMap() {
  stageNodeElements.clear();
  worldStageElements.clear();
  elements.japanMap.innerHTML = "";
  elements.worldStageList.innerHTML = "";
  const japanFragment = document.createDocumentFragment();
  const worldFragment = document.createDocumentFragment();
  stageConfigs.forEach((stage) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "stage-node";
    node.dataset.stageId = stage.id;
    node.innerHTML = `
      <span class="stage-index">${stage.id.toString().padStart(2, "0")}</span>
      <span class="stage-label">${stage.name}</span>
    `;
    node.title = `${stage.name}｜${stage.difficulty}`;
    node.setAttribute("aria-label", `${stage.name}（${stage.difficulty}）`);
    node.addEventListener("click", () => {
      if (isStageLocked(stage.id)) {
        setStatus(`${stage.name}はまだ解放されていません。`, "warning");
        return;
      }
      loadStageById(stage.id);
    });
    if (stage.id <= PREFECTURE_STAGE_LIMIT) {
      node.classList.add("prefecture-node");
      const { mapGrid } = stage;
      if (mapGrid) {
        const { col, row, colSpan = 1, rowSpan = 1 } = mapGrid;
        node.style.gridColumn = `${col} / span ${colSpan}`;
        node.style.gridRow = `${row} / span ${rowSpan}`;
      }
      japanFragment.appendChild(node);
      stageNodeElements.set(stage.id, node);
    } else {
      node.classList.add("world-node");
      worldFragment.appendChild(node);
      worldStageElements.set(stage.id, node);
    }
  });
  elements.japanMap.appendChild(japanFragment);
  elements.worldStageList.appendChild(worldFragment);
  updateStageMap();
}

function updateStageMap() {
  const unlocked = getUnlockedStageIds();
  const available = getAvailableStageIds();
  const cleared = new Set(progress.clearedStages);
  const currentId = stageConfigs[currentStageIndex]?.id;
  stageNodeElements.forEach((node, stageId) => {
    const isLocked = !unlocked.has(stageId);
    node.classList.toggle("current", stageId === currentId);
    node.classList.toggle("cleared", cleared.has(stageId));
    node.classList.toggle("available", available.has(stageId));
    node.classList.toggle("locked", isLocked);
    node.toggleAttribute("aria-disabled", isLocked);
  });
  worldStageElements.forEach((node, stageId) => {
    const isLocked = !unlocked.has(stageId);
    node.classList.toggle("current", stageId === currentId);
    node.classList.toggle("cleared", cleared.has(stageId));
    node.classList.toggle("available", available.has(stageId));
    node.classList.toggle("locked", isLocked);
    node.toggleAttribute("aria-disabled", isLocked);
  });
  const japanCleared = stageConfigs
    .filter((stage) => stage.id <= PREFECTURE_STAGE_LIMIT)
    .every((stage) => cleared.has(stage.id));
  elements.worldUnlockMessage.hidden = japanCleared;
  elements.worldStageList.classList.toggle("locked", !japanCleared);
  elements.worldStageList.setAttribute("aria-hidden", japanCleared ? "false" : "true");
}

function populateStageSelect() {
  const unlocked = getUnlockedStageIds();
  elements.stageSelect.innerHTML = "";
  stageConfigs.forEach((stage) => {
    const option = document.createElement("option");
    option.value = stage.id;
    option.textContent = `ステージ ${stage.id.toString().padStart(2, "0")}｜${stage.name}｜${stage.difficulty}`;
    if (stage.id === stageConfigs[currentStageIndex]?.id) {
      option.selected = true;
    }
    if (!unlocked.has(stage.id)) {
      option.disabled = true;
    }
    elements.stageSelect.appendChild(option);
  });
}

function selectCell(index) {
  if (cells[index].classList.contains("locked")) return;
  if (selectedIndex !== null) {
    cells[selectedIndex].classList.remove("selected");
  }
  selectedIndex = index;
  cells[selectedIndex].classList.add("selected");
  updateRelatedHighlights();
}

function handleKeydown(event) {
  if (document.activeElement && document.activeElement.tagName === "INPUT") return;
  const key = event.key;

  if (isCelebrationOverlayOpen()) {
    if (key === "Escape" || key === "Esc") {
      closeCelebrationOverlay();
      event.preventDefault();
    }
    return;
  }

  if (isStageModalCurrentlyOpen()) {
    if (key === "Escape" || key === "Esc") {
      closeStageModal();
      event.preventDefault();
    }
    return;
  }

  if (selectedIndex === null) {
    const firstEditable = values.findIndex((value, idx) => !cells[idx].classList.contains("locked"));
    if (firstEditable >= 0) selectCell(firstEditable);
  }

  if (key === "Escape") {
    return;
  }

  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  if (/^[1-9]$/.test(key)) {
    const useNotes = elements.notesToggle.checked || event.shiftKey || event.altKey || event.metaKey;
    handleInputValue(Number(key), { useNotes });
    event.preventDefault();
  } else if (key === "0" || key === "Backspace" || key === "Delete") {
    handleInputValue(0);
    event.preventDefault();
  } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
    moveSelection(key);
    event.preventDefault();
  } else if (["w", "a", "s", "d", "W", "A", "S", "D"].includes(key)) {
    const mapping = {
      w: "ArrowUp",
      W: "ArrowUp",
      a: "ArrowLeft",
      A: "ArrowLeft",
      s: "ArrowDown",
      S: "ArrowDown",
      d: "ArrowRight",
      D: "ArrowRight",
    };
    moveSelection(mapping[key]);
    event.preventDefault();
  } else if (ctrlOrMeta && !event.altKey && key.toLowerCase() === "z") {
    applyHistory(event.shiftKey ? "redo" : "undo");
    event.preventDefault();
  } else if (ctrlOrMeta && !event.altKey && key.toLowerCase() === "y") {
    applyHistory("redo");
    event.preventDefault();
  } else if (event.ctrlKey && !event.altKey && !event.metaKey && key.toLowerCase() === "o") {
    event.preventDefault();
    revealSolution();
  } else if ((ctrlOrMeta && !event.altKey && key.toLowerCase() === "h") || key.toLowerCase() === "h") {
    useHint();
    event.preventDefault();
  } else if (key === " " || key === "Spacebar") {
    toggleNotesMode();
    event.preventDefault();
  } else if (key.toLowerCase() === "n") {
    toggleNotesMode();
    event.preventDefault();
  } else if (key === "Enter") {
    attemptSubmitSolution();
    event.preventDefault();
  }
}

function moveSelection(direction) {
  if (selectedIndex === null) return;
  const row = Math.floor(selectedIndex / BOARD_SIZE);
  const col = selectedIndex % BOARD_SIZE;
  let targetRow = row;
  let targetCol = col;
  switch (direction) {
    case "ArrowUp":
      targetRow = (row + BOARD_SIZE - 1) % BOARD_SIZE;
      break;
    case "ArrowDown":
      targetRow = (row + 1) % BOARD_SIZE;
      break;
    case "ArrowLeft":
      targetCol = (col + BOARD_SIZE - 1) % BOARD_SIZE;
      break;
    case "ArrowRight":
      targetCol = (col + 1) % BOARD_SIZE;
      break;
  }
  const nextIndex = targetRow * BOARD_SIZE + targetCol;
  if (cells[nextIndex].classList.contains("locked")) {
    selectedIndex = nextIndex;
    moveSelection(direction);
    return;
  }
  selectCell(nextIndex);
}

function handleInputValue(value, { useNotes = false } = {}) {
  if (selectedIndex === null) return;
  if (cells[selectedIndex].classList.contains("locked")) return;
  if (useNotes && value !== 0) {
    toggleNote(selectedIndex, value);
  } else {
    setCellValue(selectedIndex, value);
  }
}

function setCellValue(index, value, { silent = false } = {}) {
  const previousValue = values[index];
  const previousNotes = Array.from(notes[index]);
  if (previousValue === value) return;
  values[index] = value;
  updateCellDisplay(index);
  const peerNoteChanges = value !== 0 ? clearNotesWithValue(index, value) : [];
  const newNotes = Array.from(notes[index]);
  if (!silent) {
    pushHistory({
      type: "value",
      index,
      previousValue,
      newValue: value,
      previousNotes,
      newNotes,
      peerNoteChanges,
    });
  }
  updateValidation();
}

function revealSolution() {
  if (!solution.length) return;
  let anyChanged = false;
  for (let index = 0; index < TOTAL_CELLS; index++) {
    if (cells[index].classList.contains("locked")) continue;
    notes[index].clear();
    if (values[index] !== solution[index]) {
      values[index] = solution[index];
      anyChanged = true;
    }
    updateCellDisplay(index);
  }
  if (anyChanged) {
    history.length = 0;
    historyPointer = -1;
    updateHistoryButtons();
  }
  updateValidation();
  checkForCompletion();
}

function toggleNote(index, value, { silent = false } = {}) {
  const noteSet = notes[index];
  const previousNotes = Array.from(noteSet);
  if (noteSet.has(value)) {
    noteSet.delete(value);
  } else {
    noteSet.add(value);
  }
  updateCellDisplay(index);
  if (!silent) {
    pushHistory({
      type: "notes",
      index,
      previousNotes,
      newNotes: Array.from(noteSet),
    });
  }
}

function autoFillNotes(scope = "selection") {
  const targets = resolveNoteTargets(scope, { includeFilled: false });
  if (targets.length === 0) {
    setStatus(scope === "all" ? "候補を入れられるマスがありません。" : "候補を入れたいマスを選択してください。", "warning");
    return;
  }
  const changes = [];
  targets.forEach((index) => {
    if (cells[index].classList.contains("locked")) return;
    if (values[index] !== 0) return;
    const candidates = getCandidates(values, index);
    const previousNotes = Array.from(notes[index]);
    if (areNotesEqual(notes[index], candidates)) return;
    notes[index] = new Set(candidates);
    updateCellDisplay(index);
    changes.push({ index, previousNotes, newNotes: candidates });
  });
  if (changes.length === 0) {
    setStatus("候補に変更はありませんでした。", "info");
    return;
  }
  pushHistory({ type: "bulkNotes", changes });
  const message = scope === "all" ? "空きマスの候補を一括生成しました。" : "選択マスの候補を自動入力しました。";
  setStatus(message, "info");
}

function clearNotes(scope = "selection") {
  const targets = resolveNoteTargets(scope, { includeFilled: true });
  if (targets.length === 0) {
    setStatus("候補を消したいマスを選択してください。", "warning");
    return;
  }
  const changes = [];
  targets.forEach((index) => {
    if (notes[index].size === 0) return;
    const previousNotes = Array.from(notes[index]);
    notes[index].clear();
    updateCellDisplay(index);
    changes.push({ index, previousNotes, newNotes: [] });
  });
  if (changes.length === 0) {
    setStatus("消去できる候補はありませんでした。", "info");
    return;
  }
  pushHistory({ type: "bulkNotes", changes });
  const message = scope === "all" ? "全マスの候補をリセットしました。" : "選択マスの候補を消去しました。";
  setStatus(message, "info");
}

function resolveNoteTargets(scope, { includeFilled }) {
  if (scope === "selection") {
    if (selectedIndex === null) return [];
    if (cells[selectedIndex].classList.contains("locked")) return [];
    if (!includeFilled && values[selectedIndex] !== 0) return [];
    return [selectedIndex];
  }
  const indices = [];
  for (let index = 0; index < TOTAL_CELLS; index++) {
    if (cells[index].classList.contains("locked")) continue;
    if (!includeFilled && values[index] !== 0) continue;
    indices.push(index);
  }
  return indices;
}

function areNotesEqual(noteSet, candidates) {
  if (noteSet.size !== candidates.length) return false;
  return candidates.every((value) => noteSet.has(value));
}

function getPeerIndices(index) {
  const peers = new Set();
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  for (let i = 0; i < BOARD_SIZE; i++) {
    peers.add(row * BOARD_SIZE + i);
    peers.add(i * BOARD_SIZE + col);
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      peers.add((startRow + r) * BOARD_SIZE + (startCol + c));
    }
  }
  peers.delete(index);
  return Array.from(peers);
}

function clearNotesWithValue(index, value) {
  if (value === 0) return [];
  const peers = getPeerIndices(index);
  const changes = [];
  peers.forEach((peerIndex) => {
    if (!notes[peerIndex].has(value)) return;
    const previousNotes = Array.from(notes[peerIndex]);
    notes[peerIndex].delete(value);
    updateCellDisplay(peerIndex);
    changes.push({ index: peerIndex, previousNotes, newNotes: Array.from(notes[peerIndex]) });
  });
  return changes;
}

function applyPeerNoteChanges(changes, undo) {
  if (!Array.isArray(changes)) return;
  changes.forEach((change) => {
    const targetNotes = undo ? change.previousNotes : change.newNotes;
    notes[change.index] = new Set(targetNotes);
    updateCellDisplay(change.index);
  });
}

function pushHistory(entry) {
  history.splice(historyPointer + 1);
  history.push(entry);
  historyPointer = history.length - 1;
  updateHistoryButtons();
}

function applyHistory(direction) {
  if (direction === "undo") {
    if (historyPointer < 0) return;
    const entry = history[historyPointer];
    historyPointer--;
    applyHistoryEntry(entry, true);
  } else {
    if (historyPointer >= history.length - 1) return;
    historyPointer++;
    const entry = history[historyPointer];
    applyHistoryEntry(entry, false);
  }
  updateHistoryButtons();
  updateValidation();
}

function applyHistoryEntry(entry, undo) {
  if (entry.type === "value") {
    const targetValue = undo ? entry.previousValue : entry.newValue;
    const targetNotes = undo ? entry.previousNotes : entry.newNotes;
    values[entry.index] = targetValue;
    notes[entry.index] = new Set(targetNotes);
    updateCellDisplay(entry.index);
    if (entry.peerNoteChanges && entry.peerNoteChanges.length > 0) {
      applyPeerNoteChanges(entry.peerNoteChanges, undo);
    }
  } else if (entry.type === "notes") {
    notes[entry.index] = new Set(undo ? entry.previousNotes : entry.newNotes);
    updateCellDisplay(entry.index);
  } else if (entry.type === "bulkNotes") {
    entry.changes.forEach((change) => {
      const targetNotes = undo ? change.previousNotes : change.newNotes;
      notes[change.index] = new Set(targetNotes);
      updateCellDisplay(change.index);
    });
  }
}

function updateHistoryButtons() {
  if (elements.undoButton) {
    elements.undoButton.disabled = historyPointer < 0;
  }
  if (elements.redoButton) {
    elements.redoButton.disabled = historyPointer >= history.length - 1;
  }
}

function updateCellDisplay(index) {
  const cell = cells[index];
  const valueSpan = cell.querySelector(".value");
  const notesContainer = cell.querySelector(".notes");
  const value = values[index];
  valueSpan.textContent = value === 0 ? "" : value;
  notesContainer.innerHTML = "";
  const noteValues = [...notes[index]].sort((a, b) => a - b);
  noteValues.forEach((note) => {
    const span = document.createElement("span");
    span.textContent = note;
    notesContainer.appendChild(span);
  });
  cell.classList.toggle("has-value", value !== 0);
  cell.classList.toggle("has-notes", noteValues.length > 0);
}

function clearValidationState() {
  validationActive = false;
  cells.forEach((cell) => cell.classList.remove("error"));
}

function updateValidation({ force = false } = {}) {
  cells.forEach((cell) => cell.classList.remove("error"));
  const shouldValidate = force || validationActive;
  if (!shouldValidate) {
    return;
  }
  for (let index = 0; index < TOTAL_CELLS; index++) {
    const value = values[index];
    if (value === 0) continue;
    if (value !== solution[index]) {
      cells[index].classList.add("error");
    }
  }
}

function updateRelatedHighlights() {
  cells.forEach((cell) => cell.classList.remove("related"));
  if (selectedIndex === null) return;
  const row = Math.floor(selectedIndex / BOARD_SIZE);
  const col = selectedIndex % BOARD_SIZE;
  for (let c = 0; c < BOARD_SIZE; c++) {
    const idx = row * BOARD_SIZE + c;
    cells[idx].classList.add("related");
  }
  for (let r = 0; r < BOARD_SIZE; r++) {
    const idx = r * BOARD_SIZE + col;
    cells[idx].classList.add("related");
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = (startRow + r) * BOARD_SIZE + (startCol + c);
      cells[idx].classList.add("related");
    }
  }
}

function useHint() {
  if (hintsUsed >= MAX_HINTS) {
    setStatus("ヒントはこれ以上使えません。", "warning");
    return;
  }
  if (selectedIndex === null) {
    setStatus("ヒントを使うマスを選択してください。", "warning");
    return;
  }
  const index = selectedIndex;
  const cell = cells[index];
  if (cell.classList.contains("locked")) {
    setStatus("このマスにはヒントを使えません。", "warning");
    return;
  }
  if (values[index] !== 0 && values[index] === solution[index]) {
    setStatus("すでに正しい数字が入っています。", "info");
    return;
  }
  setCellValue(index, solution[index], { silent: true });
  cell.classList.add("locked", "hint-filled");
  hintsUsed += 1;
  updateHintUI();
  const remaining = MAX_HINTS - hintsUsed;
  setStatus(`ヒントを使いました。このマスは固定されました。（残り${remaining}回）`, remaining === 0 ? "warning" : "info");
  updateCellDisplay(index);
}

function attemptSubmitSolution() {
  if (!values || values.length === 0) {
    return;
  }
  if (values.some((value) => value === 0)) {
    clearValidationState();
    setStatus("まだ空いているマスがあります。", "warning");
    return;
  }
  validationActive = true;
  updateValidation({ force: true });
  const solved = values.every((value, index) => value === solution[index]);
  if (solved) {
    checkForCompletion();
  } else {
    setStatus("誤りがあります。見直してみましょう。", "warning");
  }
}

function countCandidates(index) {
  if (values[index] !== 0) return 10;
  const used = new Set();
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  for (let i = 0; i < BOARD_SIZE; i++) {
    used.add(values[row * BOARD_SIZE + i]);
    used.add(values[i * BOARD_SIZE + col]);
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      used.add(values[(startRow + r) * BOARD_SIZE + (startCol + c)]);
    }
  }
  let count = 0;
  for (let num = 1; num <= 9; num++) {
    if (!used.has(num)) count++;
  }
  return count;
}

function checkForCompletion() {
  if (!values.every((value, index) => value === solution[index])) return;
  stopTimer();
  const elapsed = lastElapsedSeconds;
  const stageId = stageConfigs[currentStageIndex].id;
  if (!progress.clearedStages.includes(stageId)) {
    progress.clearedStages.push(stageId);
  }
  const previousBest = progress.bestTimes[stageId];
  if (!previousBest || elapsed < previousBest) {
    progress.bestTimes[stageId] = elapsed;
  }
  const nextCandidates = Array.from(getAvailableStageIds()).sort((a, b) => a - b);
  progress.currentStage = nextCandidates[0] ?? stageId;
  saveProgress();
  populateStageSelect();
  updateProgressUI();
  updateStageMap();
  updateHintUI();
  const bestTime = progress.bestTimes[stageId];
  elements.bestTime.textContent = bestTime ? formatTime(bestTime) : "--";
  const bestUpdated = !previousBest || elapsed < previousBest;
  const stageInfo = stageById.get(stageId);
  const stageLabel = stageInfo ? stageInfo.name : `ステージ${stageId}`;
  setStatus(
    `${stageLabel}をクリア！タイム: ${formatTime(elapsed)}${
      bestUpdated ? "（ベスト更新！）" : ""
    }`,
    "success"
  );
  openCelebrationOverlay({ stage: stageInfo, elapsedSeconds: elapsed, bestUpdated });
}

function updateProgressUI() {
  const clearedCount = progress.clearedStages.length;
  const percent = Math.min(100, Math.round((clearedCount / stageConfigs.length) * 100));
  elements.progressFill.style.width = `${percent}%`;
  elements.progressLabel.textContent = `${clearedCount} / ${stageConfigs.length} ステージクリア`;
}

function isStageLocked(stageNumber) {
  return !getUnlockedStageIds().has(stageNumber);
}

function loadStageById(stageId, restart = false) {
  const index = stageConfigs.findIndex((stage) => stage.id === stageId);
  const targetIndex = index >= 0 ? index : 0;
  loadStage(targetIndex, restart);
}

function resetCurrentStage() {
  loadStage(currentStageIndex, true);
  setStatus("盤面をリセットしました。", "info");
}

function loadStage(stageIndex, restart = false) {
  closeStageModal({ restoreFocus: false });
  currentStageIndex = stageIndex;
  const stage = stageData[stageIndex];
  puzzle = stage.puzzle.slice();
  solution = stage.solution.slice();
  values = puzzle.slice();
  notes = Array.from({ length: TOTAL_CELLS }, () => new Set());
  selectedIndex = null;
  history.length = 0;
  historyPointer = -1;
  hintsUsed = 0;
  updateHistoryButtons();
  const stageConfig = stageConfigs[stageIndex];
  updateStageSummary(stageConfig);
  elements.stageNumber.textContent = stageConfig.id.toString().padStart(2, "0");
  elements.stageName.textContent = stageConfig.name;
  elements.stageDifficulty.textContent = stageConfig.difficulty;
  populateStageSelect();
  clearValidationState();
  for (let index = 0; index < TOTAL_CELLS; index++) {
    const cell = cells[index];
    cell.classList.remove("locked", "selected", "related", "error", "hint-filled");
    notes[index].clear();
    if (puzzle[index] !== 0) {
      values[index] = puzzle[index];
      cell.classList.add("locked");
    }
    updateCellDisplay(index);
  }
  updateRelatedHighlights();
  updateValidation();
  resetTimer();
  startTimer();
  progress.currentStage = stageConfig.id;
  saveProgress();
  const best = progress.bestTimes[stageConfig.id];
  elements.bestTime.textContent = best ? formatTime(best) : "--";
  updateHintUI();
  updateStageMap();
  updateStageModalSubtitle();
  if (!restart) {
    setStatus(
      `${stageConfig.name}（ステージ${stageConfig.id.toString().padStart(2, "0")}｜${stageConfig.difficulty}）を開始しました。`,
      "info"
    );
  }
}

function updateStageSummary(stageConfig) {
  if (!stageConfig) return;
  if (elements.currentStageBadge) {
    elements.currentStageBadge.textContent = formatStageLabel(stageConfig);
  }
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerStart = null;
  lastElapsedSeconds = 0;
  elements.currentTime.textContent = "00:00";
}

function startTimer() {
  timerStart = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    lastElapsedSeconds = Math.floor((Date.now() - timerStart) / 1000);
    elements.currentTime.textContent = formatTime(lastElapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (timerStart) {
    lastElapsedSeconds = Math.floor((Date.now() - timerStart) / 1000);
    elements.currentTime.textContent = formatTime(lastElapsedSeconds);
  }
}

function formatTime(seconds) {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) return "--";
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function setStatus(message, tone = "info") {
  if (!elements.statusMessage) return;
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.remove("info", "success", "warning");
  if (message) {
    if (!["info", "success", "warning"].includes(tone)) {
      tone = "info";
    }
    elements.statusMessage.classList.add(tone);
  }
}

function updateHintUI() {
  const remaining = Math.max(0, MAX_HINTS - hintsUsed);
  if (elements.hintButton) {
    const solved = values.length > 0 && values.every((value, index) => value === solution[index]);
    elements.hintButton.disabled = remaining === 0 || solved;
  }
  if (elements.hintCount) {
    elements.hintCount.textContent = `残り ${remaining} 回`;
  }
}

function generateStage(config) {
  const prng = createPrng(config.seed);
  const solved = generateSolvedBoard(prng);
  const puzzle = carvePuzzle(solved, config.clues, prng);
  return { puzzle, solution: solved };
}

function createPrng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function generateSolvedBoard(random) {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffle(digits, random);
  const rowOrder = shuffledIndices(random);
  const colOrder = shuffledIndices(random);
  const solved = new Array(TOTAL_CELLS);
  for (let rIndex = 0; rIndex < BOARD_SIZE; rIndex++) {
    const row = rowOrder[rIndex];
    for (let cIndex = 0; cIndex < BOARD_SIZE; cIndex++) {
      const col = colOrder[cIndex];
      const value = digits[pattern(row, col)];
      solved[rIndex * BOARD_SIZE + cIndex] = value;
    }
  }
  return solved;
}

function pattern(row, col) {
  return (row * 3 + Math.floor(row / 3) + col) % BOARD_SIZE;
}

function shuffledIndices(random) {
  const baseGroups = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
  shuffle(baseGroups, random);
  return baseGroups.flatMap((group) => {
    const copy = group.slice();
    shuffle(copy, random);
    return copy;
  });
}

function shuffle(array, random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker
    .register("./service-worker.js")
    .catch((error) => console.warn("Service worker registration failed", error));
}

function carvePuzzle(solved, clues, random) {
  const puzzle = solved.slice();
  const indices = Array.from({ length: TOTAL_CELLS }, (_, idx) => idx);
  shuffle(indices, random);
  let filled = TOTAL_CELLS;
  for (const index of indices) {
    if (filled <= clues) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    if (!hasUniqueSolution(puzzle)) {
      puzzle[index] = backup;
    } else {
      filled--;
    }
  }
  return puzzle;
}

function hasUniqueSolution(puzzle) {
  const board = puzzle.slice();
  let solutions = 0;

  function backtrack() {
    if (solutions > 1) return;
    const index = findBestEmptyCell(board);
    if (index === -1) {
      solutions++;
      return;
    }
    const candidates = getCandidates(board, index);
    for (const value of candidates) {
      board[index] = value;
      backtrack();
      if (solutions > 1) return;
      board[index] = 0;
    }
  }

  backtrack();
  return solutions === 1;
}

function findBestEmptyCell(board) {
  let bestIndex = -1;
  let bestCount = Infinity;
  for (let index = 0; index < TOTAL_CELLS; index++) {
    if (board[index] !== 0) continue;
    const candidates = getCandidates(board, index);
    if (candidates.length === 0) return index;
    if (candidates.length < bestCount) {
      bestCount = candidates.length;
      bestIndex = index;
      if (bestCount === 1) break;
    }
  }
  return bestIndex;
}

function getCandidates(board, index) {
  if (board[index] !== 0) return [];
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  const used = new Set();
  for (let i = 0; i < BOARD_SIZE; i++) {
    used.add(board[row * BOARD_SIZE + i]);
    used.add(board[i * BOARD_SIZE + col]);
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      used.add(board[(startRow + r) * BOARD_SIZE + (startCol + c)]);
    }
  }
  const candidates = [];
  for (let value = 1; value <= 9; value++) {
    if (!used.has(value)) {
      candidates.push(value);
    }
  }
  return candidates;
}
