const STORAGE_KEY = "workout-schedule-app";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_EXERCISES = ["Push-ups", "Squats", "Plank", "Running", "Deadlift", "Bench Press"];

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.exercises) && parsed.schedule) {
        return parsed;
      }
    } catch (err) {
      // fall through to default state
    }
  }
  return {
    exercises: DEFAULT_EXERCISES.map((name) => ({ id: crypto.randomUUID(), name })),
    schedule: Object.fromEntries(DAYS.map((day) => [day, []])),
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function findExercise(id) {
  return state.exercises.find((ex) => ex.id === id);
}

function addExercise(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  state.exercises.push({ id: crypto.randomUUID(), name: trimmed });
  saveState();
  render();
}

function removeExercise(id) {
  state.exercises = state.exercises.filter((ex) => ex.id !== id);
  for (const day of DAYS) {
    state.schedule[day] = state.schedule[day].filter((exId) => exId !== id);
  }
  saveState();
  render();
}

function addToDay(day, exerciseId) {
  if (!exerciseId) return;
  state.schedule[day].push(exerciseId);
  saveState();
  render();
}

function removeFromDay(day, index) {
  state.schedule[day].splice(index, 1);
  saveState();
  render();
}

function renderExerciseList() {
  const list = document.getElementById("exercise-list");
  list.innerHTML = "";

  if (state.exercises.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-hint";
    li.textContent = "No exercises yet — add one above.";
    list.appendChild(li);
    return;
  }

  for (const exercise of state.exercises) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = exercise.name;
    li.appendChild(label);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-exercise";
    removeBtn.type = "button";
    removeBtn.setAttribute("aria-label", `Remove ${exercise.name}`);
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => removeExercise(exercise.id));
    li.appendChild(removeBtn);

    list.appendChild(li);
  }
}

function renderScheduleGrid() {
  const grid = document.getElementById("schedule-grid");
  grid.innerHTML = "";

  for (const day of DAYS) {
    const card = document.createElement("div");
    card.className = "day-card";

    const heading = document.createElement("h3");
    heading.textContent = day;
    card.appendChild(heading);

    const dayList = document.createElement("ul");
    dayList.className = "day-exercise-list";

    state.schedule[day].forEach((exerciseId, index) => {
      const exercise = findExercise(exerciseId);
      if (!exercise) return;

      const li = document.createElement("li");

      const label = document.createElement("span");
      label.textContent = exercise.name;
      li.appendChild(label);

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-from-day";
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", `Remove ${exercise.name} from ${day}`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => removeFromDay(day, index));
      li.appendChild(removeBtn);

      dayList.appendChild(li);
    });

    card.appendChild(dayList);

    if (state.exercises.length === 0) {
      const note = document.createElement("p");
      note.className = "no-exercises-note";
      note.textContent = "Add exercises above to schedule them.";
      card.appendChild(note);
    } else {
      const picker = document.createElement("select");
      picker.className = "day-picker";

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "+ Add exercise";
      picker.appendChild(placeholder);

      for (const exercise of state.exercises) {
        const option = document.createElement("option");
        option.value = exercise.id;
        option.textContent = exercise.name;
        picker.appendChild(option);
      }

      picker.addEventListener("change", () => {
        addToDay(day, picker.value);
      });

      card.appendChild(picker);
    }

    grid.appendChild(card);
  }
}

function render() {
  renderExerciseList();
  renderScheduleGrid();
}

document.getElementById("add-exercise-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("new-exercise-input");
  addExercise(input.value);
  input.value = "";
  input.focus();
});

render();
