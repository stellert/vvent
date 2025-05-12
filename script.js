let currentOneRm = 0;

function init() {
  M.FormSelect.init(document.querySelectorAll('select'));
  M.updateTextFields();

  document.getElementById('calcBtn').addEventListener('click', calculatePlan);
  document.getElementById('addExerciseBtn').addEventListener('click', addExercise);
  document.getElementById('clearBtn').addEventListener('click', clearAllData);

  document.getElementById('resultContent').addEventListener('click', onChartClick);
  document.getElementById('setsContainer').addEventListener('click', handleSetRowClick);
  document.getElementById('setsContainer').addEventListener('input', handleSetRowInput);

  restoreData();
}

document.addEventListener('DOMContentLoaded', init);

function calculatePlan() {
  const w = +document.getElementById('weight').value;
  const reps = +document.getElementById('reps').value;
  const bw = +document.getElementById('bodyweight').value;
  const ht = +document.getElementById('height').value;
  const type = document.getElementById('bodytype').value;
  const goal = document.getElementById('goal').value;

  if (!w || !reps || !bw || !ht || !type || !goal) {
    return M.toast({ html: 'Заполните все поля!' });
  }

  currentOneRm = w * (1 + reps / 30);
  const rc = document.getElementById('resultContent');
  rc.innerHTML = `<p><strong>Ваш 1RM:</strong> ${currentOneRm.toFixed(1)} кг</p>`;

  const percents = [60,65,70,75,80,85,90,95,100];
  let table = '<table class="striped result-table"><thead><tr>' +
    percents.map(p => `<th class="clickable">${Math.round(currentOneRm * p/100)} кг</th>`).join('') +
    '</tr></thead><tbody><tr>' +
    percents.map(p => `<td>${Math.floor(30 * (100 - p) / p)} повт.</td>`).join('') +
    '</tr></tbody></table>';

  rc.innerHTML += table;
  document.getElementById('result').style.display = 'block';
  localStorage.setItem('savedResult', rc.innerHTML);
}

function onChartClick(e) {
  const th = e.target.closest('th.clickable');
  if (!th) return;
  const idx = th.cellIndex;
  const percents = [60,65,70,75,80,85,90,95,100];
  const p = percents[idx];
  const weight = parseInt(th.textContent);
  const recReps = Math.floor(30 * (100 - p) / p);
  addApproachRow(weight, recReps);
}

function addExercise() {
  const container = document.getElementById('setsContainer');
  const block = document.createElement('div'); block.className = 'exercise-block';
  block.innerHTML = `
    <div class="exercise-header">
      <input type="text" class="exercise-name-input" placeholder="Название упражнения">
      <button class="accept-exercise">✓</button>
      <button class="remove-exercise">✕</button>
    </div>
    <div class="approaches-container"></div>
  `;
  container.prepend(block);
  saveSets();
}

function addApproachRow(weight, recReps) {
  const container = document.querySelector('.exercise-block:first-child .approaches-container');
  if (!container) return M.toast({ html: 'Сначала добавьте упражнение!' });
  const row = document.createElement('div'); row.className = 'set-row';
  row.innerHTML = `
    <label class="set-label">
      <input type="checkbox" class="set-checkbox"><span></span>
    </label>
    <span class="set-weight">${weight} кг</span>
    <input type="range" class="rep-slider" min="0" max="${recReps}" value="${recReps}">
    <span class="rep-value">${recReps}</span>
    <button class="remove-approach">✕</button>
    <div class="rest-timer hidden"></div>
  `;
  container.prepend(row);
  saveSets();
}

function handleSetRowClick(e) {
  const block = e.target.closest('.exercise-block');
  const row = e.target.closest('.set-row');
  if (e.target.matches('.remove-approach')) { row.remove(); saveSets(); }
  if (e.target.matches('.set-checkbox')) { startRestTimer(row); saveSets(); }
  if (e.target.matches('.accept-exercise')) {
    const header = e.target.closest('.exercise-header');
    const input = header.querySelector('.exercise-name-input');
    const name = input.value.trim(); if (!name) return M.toast({ html: 'Введите название!' });
    const span = document.createElement('span'); span.className = 'exercise-name'; span.textContent = name;
    input.replaceWith(span); e.target.remove(); header.querySelector('.remove-exercise').remove(); saveSets();
  }
  if (e.target.matches('.remove-exercise')) { block.remove(); saveSets(); }
}

function handleSetRowInput(e) {
  if (e.target.matches('.rep-slider')) {
    const row = e.target.closest('.set-row');
    row.querySelector('.rep-value').textContent = e.target.value; saveSets();
  }
}

function startRestTimer(row) {
  const timer = row.querySelector('.rest-timer'); timer.classList.remove('hidden');
  let remaining = 60; timer.textContent = remaining + ' ';
  row._timerId = setInterval(() => {
    remaining--; if (remaining <= 0) { clearInterval(row._timerId); timer.classList.add('hidden'); }
    else { timer.textContent = remaining + ' '; }
  }, 1000);
}

function saveSets() {
  localStorage.setItem('savedSets', document.getElementById('setsContainer').innerHTML);
}

function clearAllData() {
  if (confirm('Удалить все данные?')) {
    localStorage.clear(); document.getElementById('setsContainer').innerHTML = '';
    document.getElementById('result').style.display = 'none'; M.toast({ html: 'Данные удалены' });
  }
}

function restoreData() {
  const title = localStorage.getItem('currentWorkout') || 'Моё занятие';
  document.getElementById('workoutTitle').textContent = title;
  const res = localStorage.getItem('savedResult'); if (res) {
    document.getElementById('resultContent').innerHTML = res;
    document.getElementById('result').style.display = 'block';
  }
  const sets = localStorage.getItem('savedSets');
  if (sets) {
    document.getElementById('setsContainer').innerHTML = sets;
    showSetsSection();
  }
}

function showSetsSection() {
  document.getElementById('setsSection').style.display = 'block';
}