const BOARD_SIZE = 9;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const STORAGE_KEY = "progress-v1";
const MAX_HINTS = 3;

const baseStageDefinitions = [
  { id: 1, name: "北海道", neighbors: [2], position: { x: 58, y: 6 } },
  { id: 2, name: "青森県", neighbors: [3, 4], position: { x: 58, y: 18 } },
  { id: 3, name: "岩手県", neighbors: [5], position: { x: 64, y: 28 } },
  { id: 4, name: "秋田県", neighbors: [6], position: { x: 50, y: 30 } },
  { id: 5, name: "宮城県", neighbors: [7, 8], position: { x: 62, y: 38 } },
  { id: 6, name: "山形県", neighbors: [7, 11], position: { x: 54, y: 40 } },
  { id: 7, name: "福島県", neighbors: [9, 11], position: { x: 58, y: 48 } },
  { id: 8, name: "茨城県", neighbors: [9, 15], position: { x: 68, y: 52 } },
  { id: 9, name: "栃木県", neighbors: [10, 14], position: { x: 62, y: 54 } },
  { id: 10, name: "群馬県", neighbors: [11, 14], position: { x: 56, y: 54 } },
  { id: 11, name: "新潟県", neighbors: [12, 19], position: { x: 48, y: 50 } },
  { id: 12, name: "長野県", neighbors: [13, 22], position: { x: 50, y: 60 } },
  { id: 13, name: "山梨県", neighbors: [16, 18], position: { x: 54, y: 66 } },
  { id: 14, name: "埼玉県", neighbors: [16, 17], position: { x: 60, y: 62 } },
  { id: 15, name: "千葉県", neighbors: [16], position: { x: 70, y: 66 } },
  { id: 16, name: "東京都", neighbors: [17], position: { x: 64, y: 70 } },
  { id: 17, name: "神奈川県", neighbors: [18], position: { x: 60, y: 76 } },
  { id: 18, name: "静岡県", neighbors: [23], position: { x: 56, y: 82 } },
  { id: 19, name: "富山県", neighbors: [20, 22], position: { x: 42, y: 60 } },
  { id: 20, name: "石川県", neighbors: [21], position: { x: 36, y: 54 } },
  { id: 21, name: "福井県", neighbors: [22, 25], position: { x: 32, y: 64 } },
  { id: 22, name: "岐阜県", neighbors: [23, 25], position: { x: 44, y: 70 } },
  { id: 23, name: "愛知県", neighbors: [24, 29], position: { x: 48, y: 78 } },
  { id: 24, name: "三重県", neighbors: [25, 29], position: { x: 42, y: 82 } },
  { id: 25, name: "滋賀県", neighbors: [26], position: { x: 36, y: 74 } },
  { id: 26, name: "京都府", neighbors: [27, 28], position: { x: 32, y: 70 } },
  { id: 27, name: "大阪府", neighbors: [29], position: { x: 30, y: 78 } },
  { id: 28, name: "兵庫県", neighbors: [30, 35], position: { x: 24, y: 72 } },
  { id: 29, name: "和歌山県", neighbors: [35], position: { x: 34, y: 86 } },
  { id: 30, name: "鳥取県", neighbors: [31, 32], position: { x: 22, y: 76 } },
  { id: 31, name: "島根県", neighbors: [33], position: { x: 16, y: 70 } },
  { id: 32, name: "岡山県", neighbors: [33, 36], position: { x: 24, y: 80 } },
  { id: 33, name: "広島県", neighbors: [34, 37], position: { x: 18, y: 82 } },
  { id: 34, name: "山口県", neighbors: [39], position: { x: 12, y: 84 } },
  { id: 35, name: "徳島県", neighbors: [36, 38], position: { x: 30, y: 92 } },
  { id: 36, name: "香川県", neighbors: [37], position: { x: 24, y: 90 } },
  { id: 37, name: "愛媛県", neighbors: [39, 43], position: { x: 18, y: 88 } },
  { id: 38, name: "高知県", neighbors: [44], position: { x: 26, y: 92 } },
  { id: 39, name: "福岡県", neighbors: [40, 42], position: { x: 10, y: 84 } },
  { id: 40, name: "佐賀県", neighbors: [41], position: { x: 6, y: 86 } },
  { id: 41, name: "長崎県", neighbors: [45], position: { x: 6, y: 90 } },
  { id: 42, name: "熊本県", neighbors: [43, 44], position: { x: 12, y: 88 } },
  { id: 43, name: "大分県", neighbors: [44], position: { x: 8, y: 88 } },
  { id: 44, name: "宮崎県", neighbors: [45], position: { x: 14, y: 92 } },
  { id: 45, name: "鹿児島県", neighbors: [46], position: { x: 12, y: 94 } },
  { id: 46, name: "沖縄県", neighbors: [47], position: { x: 28, y: 92 } },
  { id: 47, name: "アメリカ", neighbors: [48], position: { x: 80, y: 34 } },
  { id: 48, name: "イギリス", neighbors: [49], position: { x: 86, y: 48 } },
  { id: 49, name: "月と太陽", neighbors: [50], position: { x: 82, y: 66 } },
  { id: 50, name: "奈良県", neighbors: [], position: { x: 88, y: 82 } },
];

const clueSchedule = [
  47, 47, 46, 46, 45, 44, 44, 43, 43, 42,
  41, 41, 40, 40, 39, 38, 38, 37, 37, 36,
  35, 35, 34, 34, 33, 32, 32, 31, 31, 30,
  29, 29, 28, 28, 27, 26, 26, 25, 25, 24,
  23, 23, 22, 21, 21, 20, 19, 18, 18, 17,
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

const START_STAGE_ID = stageConfigs[0]?.id ?? 1;

const elements = {
  board: document.getElementById("sudokuBoard"),
  stageSelect: document.getElementById("stageSelect"),
  resetProgress: document.getElementById("resetProgress"),
  stageNumber: document.getElementById("stageNumber"),
  stageName: document.getElementById("stageName"),
  stageDifficulty: document.getElementById("stageDifficulty"),
  currentTime: document.getElementById("currentTime"),
  bestTime: document.getElementById("bestTime"),
  progressFill: document.getElementById("progressFill"),
  progressLabel: document.getElementById("progressLabel"),
  notesToggle: document.getElementById("notesToggle"),
  autoCheckToggle: document.getElementById("autoCheckToggle"),
  highlightToggle: document.getElementById("highlightToggle"),
  hintButton: document.getElementById("hintButton"),
  checkButton: document.getElementById("checkButton"),
  undoButton: document.getElementById("undoButton"),
  redoButton: document.getElementById("redoButton"),
  restartButton: document.getElementById("restartButton"),
  numberPad: document.querySelector(".number-pad"),
  hintStatus: document.getElementById("hintStatus"),
  statusMessage: document.getElementById("statusMessage"),
  stageNodes: document.getElementById("stageNodes"),
  stageMapSvg: document.querySelector(".stage-map-path"),
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

const stageNodes = [];
const stagePositionCache = new Map();

init();

function init() {
  stageData = stageConfigs.map(generateStage);
  buildBoard();
  buildStageMap();
  populateStageSelect();
  const stageToLoad = ensureStageIsPlayable(progress.currentStage || 1);
  loadStageById(stageToLoad);
  attachEventListeners();
  updateProgressUI();
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

function attachEventListeners() {
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

  elements.numberPad.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button || selectedIndex === null) return;
    const value = Number(button.dataset.value);
    handleInputValue(value);
  });

  elements.notesToggle.addEventListener("change", () => {
    setStatus(elements.notesToggle.checked ? "メモモードをオン" : "メモモードをオフ", "info");
  });

  elements.autoCheckToggle.addEventListener("change", () => {
    updateValidation();
    setStatus(
      elements.autoCheckToggle.checked ? "自動ミスチェックをオン" : "自動ミスチェックをオフ",
      "info"
    );
  });

  elements.highlightToggle.addEventListener("change", () => {
    updateHighlights();
  });

  elements.hintButton.addEventListener("click", useHint);
  elements.checkButton.addEventListener("click", manualCheck);
  elements.undoButton.addEventListener("click", () => applyHistory("undo"));
  elements.redoButton.addEventListener("click", () => applyHistory("redo"));
  elements.restartButton.addEventListener("click", () => {
    if (confirm("このステージを最初からやり直しますか？")) {
      loadStage(currentStageIndex, true);
      setStatus("ステージを最初からやり直しました。", "info");
    }
  });

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
    cells.push(cell);
    fragment.appendChild(cell);
  }
  elements.board.appendChild(fragment);
}

function buildStageMap() {
  stageNodes.length = 0;
  stagePositionCache.clear();
  elements.stageNodes.innerHTML = "";
  elements.stageMapSvg.innerHTML = "";
  const drawnEdges = new Set();
  stageConfigs.forEach((stage) => {
    const position = computeStagePosition(stage.id);
    const node = document.createElement("button");
    node.type = "button";
    node.className = "stage-node";
    node.dataset.stageId = stage.id;
    node.style.setProperty("--x", `${position.x}%`);
    node.style.setProperty("--y", `${position.y}%`);
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
    elements.stageNodes.appendChild(node);
    stageNodes.push(node);

    stage.neighbors.forEach((neighborId) => {
      const neighbor = stageById.get(neighborId);
      if (!neighbor) return;
      const edgeKey = `${stage.id}-${neighborId}`;
      if (drawnEdges.has(edgeKey)) return;
      drawnEdges.add(edgeKey);
      const neighborPosition = computeStagePosition(neighborId);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.dataset.from = stage.id;
      line.dataset.to = neighborId;
      line.setAttribute("x1", position.x);
      line.setAttribute("y1", position.y);
      line.setAttribute("x2", neighborPosition.x);
      line.setAttribute("y2", neighborPosition.y);
      line.setAttribute("stroke", "currentColor");
      line.setAttribute("stroke-width", "1.6");
      line.setAttribute("stroke-linecap", "round");
      elements.stageMapSvg.appendChild(line);
    });
  });
  updateStageMap();
}

function updateStageMap() {
  const unlocked = getUnlockedStageIds();
  const available = getAvailableStageIds();
  const cleared = new Set(progress.clearedStages);
  const currentId = stageConfigs[currentStageIndex]?.id;
  stageNodes.forEach((node) => {
    const stageId = Number(node.dataset.stageId);
    node.classList.toggle("current", stageId === currentId);
    node.classList.toggle("cleared", cleared.has(stageId));
    node.classList.toggle("available", available.has(stageId));
    node.classList.toggle("locked", !unlocked.has(stageId));
  });
  const lines = elements.stageMapSvg.querySelectorAll("line");
  lines.forEach((line) => {
    const fromId = Number(line.dataset.from);
    const toId = Number(line.dataset.to);
    const active = cleared.has(fromId) || available.has(toId) || cleared.has(toId);
    line.classList.toggle("active", active);
  });
}

function computeStagePosition(stageId) {
  if (stagePositionCache.has(stageId)) {
    return stagePositionCache.get(stageId);
  }
  const stage = stageById.get(stageId);
  const position = stage?.position
    ? { x: stage.position.x, y: stage.position.y }
    : { x: 50, y: 50 };
  stagePositionCache.set(stageId, position);
  return position;
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
  updateHighlights();
}

function handleKeydown(event) {
  if (document.activeElement && document.activeElement.tagName === "INPUT") return;
  if (selectedIndex === null) {
    const firstEditable = values.findIndex((value, idx) => !cells[idx].classList.contains("locked"));
    if (firstEditable >= 0) selectCell(firstEditable);
  }
  const key = event.key;
  if (/^[1-9]$/.test(key)) {
    handleInputValue(Number(key));
    event.preventDefault();
  } else if (key === "0" || key === "Backspace" || key === "Delete") {
    handleInputValue(0);
    event.preventDefault();
  } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
    moveSelection(key);
    event.preventDefault();
  } else if (event.ctrlKey && !event.altKey && !event.metaKey && key.toLowerCase() === "o") {
    event.preventDefault();
    revealSolution();
  } else if (key.toLowerCase() === "h") {
    useHint();
    event.preventDefault();
  } else if (key.toLowerCase() === "n") {
    elements.notesToggle.checked = !elements.notesToggle.checked;
    setStatus(elements.notesToggle.checked ? "メモモードをオン" : "メモモードをオフ", "info");
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

function handleInputValue(value) {
  if (selectedIndex === null) return;
  if (cells[selectedIndex].classList.contains("locked")) return;
  if (elements.notesToggle.checked && value !== 0) {
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
  notes[index].clear();
  updateCellDisplay(index);
  if (!silent) {
    pushHistory({
      type: "value",
      index,
      previousValue,
      newValue: value,
      previousNotes,
      newNotes: [],
    });
  }
  updateValidation();
  updateHighlights();
  checkForCompletion();
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
  updateHighlights();
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
  updateHighlights();
}

function applyHistoryEntry(entry, undo) {
  if (entry.type === "value") {
    const targetValue = undo ? entry.previousValue : entry.newValue;
    const targetNotes = undo ? entry.previousNotes : entry.newNotes;
    values[entry.index] = targetValue;
    notes[entry.index] = new Set(targetNotes);
    updateCellDisplay(entry.index);
  } else if (entry.type === "notes") {
    notes[entry.index] = new Set(undo ? entry.previousNotes : entry.newNotes);
    updateCellDisplay(entry.index);
  }
}

function updateHistoryButtons() {
  elements.undoButton.disabled = historyPointer < 0;
  elements.redoButton.disabled = historyPointer >= history.length - 1;
}

function updateCellDisplay(index) {
  const cell = cells[index];
  const valueSpan = cell.querySelector(".value");
  const notesContainer = cell.querySelector(".notes");
  const value = values[index];
  valueSpan.textContent = value === 0 ? "" : value;
  notesContainer.innerHTML = "";
  if (value === 0) {
    [...notes[index]]
      .sort((a, b) => a - b)
      .forEach((note) => {
        const span = document.createElement("span");
        span.textContent = note;
        notesContainer.appendChild(span);
      });
  }
}

function updateValidation() {
  cells.forEach((cell) => cell.classList.remove("error"));
  if (!elements.autoCheckToggle.checked) return;
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

function updateHighlights() {
  cells.forEach((cell) => cell.classList.remove("same-value"));
  if (!elements.highlightToggle.checked) return;
  if (selectedIndex === null) return;
  const value = values[selectedIndex];
  if (value === 0) return;
  values.forEach((val, idx) => {
    if (val === value) {
      cells[idx].classList.add("same-value");
    }
  });
}

function manualCheck() {
  const incorrect = [];
  for (let index = 0; index < TOTAL_CELLS; index++) {
    if (values[index] !== 0 && values[index] !== solution[index]) {
      incorrect.push(index);
    }
  }
  if (incorrect.length === 0) {
    setStatus("現時点でミスはありません。引き続き頑張りましょう！", "success");
  } else {
    incorrect.forEach((idx) => cells[idx].classList.add("error"));
    setStatus(`${incorrect.length} 箇所のミスが見つかりました。赤く表示されています。`, "warning");
  }
}

function useHint() {
  if (hintsUsed >= MAX_HINTS) {
    setStatus("ヒントはこれ以上使えません。", "warning");
    return;
  }
  const candidates = [];
  for (let index = 0; index < TOTAL_CELLS; index++) {
    if (values[index] === solution[index]) continue;
    candidates.push(index);
  }
  if (candidates.length === 0) {
    setStatus("ヒントはありません。すでに完成しています！", "success");
    return;
  }
  candidates.sort((a, b) => countCandidates(a) - countCandidates(b));
  const targetIndex = candidates[0];
  setCellValue(targetIndex, solution[targetIndex]);
  hintsUsed += 1;
  updateHintUI();
  const remaining = MAX_HINTS - hintsUsed;
  setStatus(`ヒントを使用しました。残り${remaining}回です。`, remaining === 0 ? "warning" : "info");
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

function loadStage(stageIndex, restart = false) {
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
  elements.stageNumber.textContent = stageConfig.id.toString().padStart(2, "0");
  elements.stageName.textContent = stageConfig.name;
  elements.stageDifficulty.textContent = stageConfig.difficulty;
  populateStageSelect();
  for (let index = 0; index < TOTAL_CELLS; index++) {
    const cell = cells[index];
    cell.classList.remove("locked", "selected", "related", "same-value", "error");
    notes[index].clear();
    if (puzzle[index] !== 0) {
      values[index] = puzzle[index];
      cell.classList.add("locked");
    }
    updateCellDisplay(index);
  }
  updateRelatedHighlights();
  updateHighlights();
  updateValidation();
  resetTimer();
  startTimer();
  progress.currentStage = stageConfig.id;
  saveProgress();
  const best = progress.bestTimes[stageConfig.id];
  elements.bestTime.textContent = best ? formatTime(best) : "--";
  updateHintUI();
  updateStageMap();
  if (!restart) {
    setStatus(
      `${stageConfig.name}（ステージ${stageConfig.id.toString().padStart(2, "0")}｜${stageConfig.difficulty}）を開始しました。`,
      "info"
    );
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
  if (elements.hintStatus) {
    elements.hintStatus.textContent = `ヒント残り: ${remaining}`;
  }
  if (elements.hintButton) {
    const solved = values.length > 0 && values.every((value, index) => value === solution[index]);
    elements.hintButton.disabled = remaining === 0 || solved;
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
