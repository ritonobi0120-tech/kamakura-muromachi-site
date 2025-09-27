const BOARD_SIZE = 9;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const STORAGE_KEY = "progress-v1";

const stageConfigs = Array.from({ length: 50 }, (_, index) => {
  const stageNumber = index + 1;
  const difficultySteps = [
    { label: "初級", clues: 47 },
    { label: "初級", clues: 46 },
    { label: "初級", clues: 45 },
    { label: "初級", clues: 44 },
    { label: "初級", clues: 43 },
    { label: "初級+", clues: 42 },
    { label: "初級+", clues: 41 },
    { label: "初級+", clues: 40 },
    { label: "初級+", clues: 39 },
    { label: "初級+", clues: 38 },
    { label: "初中級", clues: 38 },
    { label: "初中級", clues: 37 },
    { label: "初中級", clues: 36 },
    { label: "初中級", clues: 36 },
    { label: "初中級", clues: 35 },
    { label: "中級", clues: 35 },
    { label: "中級", clues: 34 },
    { label: "中級", clues: 34 },
    { label: "中級", clues: 33 },
    { label: "中級", clues: 33 },
    { label: "中級", clues: 32 },
    { label: "中級", clues: 32 },
    { label: "中級", clues: 31 },
    { label: "中級", clues: 31 },
    { label: "中級", clues: 30 },
    { label: "中級", clues: 30 },
    { label: "中級", clues: 30 },
    { label: "中級", clues: 29 },
    { label: "中級", clues: 29 },
    { label: "中級", clues: 29 },
    { label: "中級", clues: 29 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 28 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 27 },
    { label: "中級", clues: 26 },
    { label: "中級", clues: 26 },
  ];
  const config = difficultySteps[index] ?? difficultySteps[difficultySteps.length - 1];
  return {
    id: stageNumber,
    seed: 24601 + stageNumber * 73,
    difficulty: config.label,
    clues: config.clues,
  };
});

const elements = {
  board: document.getElementById("sudokuBoard"),
  stageSelect: document.getElementById("stageSelect"),
  resetProgress: document.getElementById("resetProgress"),
  stageNumber: document.getElementById("stageNumber"),
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
  log: document.getElementById("log"),
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

init();

function init() {
  stageData = stageConfigs.map(generateStage);
  buildBoard();
  populateStageSelect();
  const stageToLoad = clampStage(progress.currentStage || 1);
  loadStage(stageToLoad - 1);
  attachEventListeners();
  updateProgressUI();
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        currentStage: 1,
        clearedStages: [],
        bestTimes: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      currentStage: parsed.currentStage ?? 1,
      clearedStages: Array.isArray(parsed.clearedStages) ? parsed.clearedStages : [],
      bestTimes: parsed.bestTimes ?? {},
    };
  } catch (error) {
    console.error("Failed to parse progress", error);
    return {
      currentStage: 1,
      clearedStages: [],
      bestTimes: {},
    };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function clampStage(stageNumber) {
  return Math.min(Math.max(1, stageNumber), stageConfigs.length);
}

function attachEventListeners() {
  elements.stageSelect.addEventListener("change", (event) => {
    const stageNumber = Number(event.target.value);
    if (isStageLocked(stageNumber)) {
      appendLog(`ステージ${stageNumber}はまだ解放されていません。`);
      elements.stageSelect.value = stageConfigs[currentStageIndex].id;
      return;
    }
    loadStage(stageNumber - 1);
  });

  elements.resetProgress.addEventListener("click", () => {
    if (confirm("進行状況をリセットしますか？すべてのベストタイムも消去されます。")) {
      progress = { currentStage: 1, clearedStages: [], bestTimes: {} };
      saveProgress();
      populateStageSelect();
      loadStage(0);
      appendLog("進行状況をリセットしました。");
    }
  });

  elements.numberPad.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button || selectedIndex === null) return;
    const value = Number(button.dataset.value);
    handleInputValue(value);
  });

  elements.notesToggle.addEventListener("change", () => {
    appendLog(elements.notesToggle.checked ? "メモモードをオン" : "メモモードをオフ");
  });

  elements.autoCheckToggle.addEventListener("change", () => {
    appendLog(elements.autoCheckToggle.checked ? "自動ミスチェックをオン" : "自動ミスチェックをオフ");
    updateValidation();
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
      appendLog("ステージをリスタートしました。");
    }
  });

  document.addEventListener("keydown", handleKeydown);
}

function buildBoard() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < TOTAL_CELLS; index++) {
    const cell = cellTemplate.content.firstElementChild.cloneNode(true);
    cell.dataset.index = index;
    cell.addEventListener("click", () => selectCell(index));
    cells.push(cell);
    fragment.appendChild(cell);
  }
  elements.board.appendChild(fragment);
}

function populateStageSelect() {
  const maxUnlocked = getMaxUnlockedStage();
  elements.stageSelect.innerHTML = "";
  stageConfigs.forEach((stage) => {
    const option = document.createElement("option");
    option.value = stage.id;
    option.textContent = `ステージ ${stage.id.toString().padStart(2, "0")}｜${stage.difficulty}`;
    if (stage.id === stageConfigs[currentStageIndex]?.id) {
      option.selected = true;
    }
    if (stage.id > maxUnlocked) {
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
  } else if (key.toLowerCase() === "h") {
    useHint();
    event.preventDefault();
  } else if (key.toLowerCase() === "n") {
    elements.notesToggle.checked = !elements.notesToggle.checked;
    appendLog(elements.notesToggle.checked ? "メモモードをオン" : "メモモードをオフ");
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
  appendLog(`セル(${Math.floor(index / 9) + 1}, ${index % 9 + 1}) に${value === 0 ? "空白" : value}を入力`);
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
  appendLog(`セル(${Math.floor(index / 9) + 1}, ${index % 9 + 1}) のメモを更新`);
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
    appendLog("現時点でミスはありません。引き続き頑張りましょう！");
  } else {
    incorrect.forEach((idx) => cells[idx].classList.add("error"));
    appendLog(`${incorrect.length} 箇所のミスが見つかりました。赤く表示されています。`);
  }
}

function useHint() {
  const candidates = [];
  for (let index = 0; index < TOTAL_CELLS; index++) {
    if (values[index] === solution[index]) continue;
    candidates.push(index);
  }
  if (candidates.length === 0) {
    appendLog("ヒントはありません。すでに完成しています！");
    return;
  }
  candidates.sort((a, b) => countCandidates(a) - countCandidates(b));
  const targetIndex = candidates[0];
  setCellValue(targetIndex, solution[targetIndex]);
  appendLog("ヒントを使用しました。1マスを解答に更新しています。");
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
  appendLog(`ステージクリア！タイム: ${formatTime(elapsed)}。`);
  if (!progress.clearedStages.includes(stageConfigs[currentStageIndex].id)) {
    progress.clearedStages.push(stageConfigs[currentStageIndex].id);
  }
  const best = progress.bestTimes[stageConfigs[currentStageIndex].id];
  if (!best || elapsed < best) {
    progress.bestTimes[stageConfigs[currentStageIndex].id] = elapsed;
    appendLog("ベストタイムを更新しました！");
  }
  if (currentStageIndex < stageConfigs.length - 1) {
    progress.currentStage = stageConfigs[currentStageIndex + 1].id;
    appendLog("次のステージを解放しました。プルダウンから選択できます。");
  }
  saveProgress();
  populateStageSelect();
  updateProgressUI();
  elements.bestTime.textContent = formatTime(progress.bestTimes[stageConfigs[currentStageIndex].id]);
}

function updateProgressUI() {
  const clearedCount = progress.clearedStages.length;
  const percent = Math.min(100, Math.round((clearedCount / stageConfigs.length) * 100));
  elements.progressFill.style.width = `${percent}%`;
  elements.progressLabel.textContent = `${clearedCount} / ${stageConfigs.length} ステージクリア`;
}

function isStageLocked(stageNumber) {
  const maxUnlocked = getMaxUnlockedStage();
  return stageNumber > maxUnlocked;
}

function getMaxUnlockedStage() {
  if (progress.clearedStages.length === 0) return 1;
  const maxCleared = Math.max(...progress.clearedStages);
  return Math.min(stageConfigs.length, maxCleared + 1);
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
  updateHistoryButtons();
  elements.stageNumber.textContent = stageConfigs[stageIndex].id;
  elements.stageDifficulty.textContent = stageConfigs[stageIndex].difficulty;
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
  progress.currentStage = stageConfigs[stageIndex].id;
  saveProgress();
  const best = progress.bestTimes[stageConfigs[stageIndex].id];
  elements.bestTime.textContent = best ? formatTime(best) : "--";
  if (!restart) {
    appendLog(`ステージ${stageConfigs[stageIndex].id}（${stageConfigs[stageIndex].difficulty}）を開始しました。`);
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

function appendLog(message) {
  const time = new Date();
  const timeLabel = `${time.getHours().toString().padStart(2, "0")}:${time
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const entry = document.createElement("p");
  entry.textContent = `[${timeLabel}] ${message}`;
  elements.log.prepend(entry);
  while (elements.log.childElementCount > 20) {
    elements.log.lastElementChild.remove();
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
