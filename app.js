let currentStreak = parseInt(localStorage.getItem("currentStreak")) || 0;
let longestStreak = parseInt(localStorage.getItem("longestStreak")) || 0;
let lastDate = localStorage.getItem("lastGymDate");
let workoutLogs = JSON.parse(localStorage.getItem("workoutLogs")) || [];

function updateStreakDisplay() {
  document.getElementById("current-streak").innerText = currentStreak;
  document.getElementById("longest-streak").innerText = longestStreak;
}

function isToday(dateStr) {
  const today = new Date().toDateString();
  return today === new Date(dateStr).toDateString();
}

function markToday() {
  const today = new Date();
  if (!lastDate || new Date(lastDate).toDateString() !== today.toDateString()) {
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (lastDate && new Date(lastDate).toDateString() === yesterday.toDateString()) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    lastDate = today.toString();

    localStorage.setItem("currentStreak", currentStreak);
    localStorage.setItem("longestStreak", longestStreak);
    localStorage.setItem("lastGymDate", lastDate);

    updateStreakDisplay();
    alert("Marked today as a gym day 💪");
  } else {
    alert("You already marked today!");
  }
}

function logWorkout() {
  const exercise = document.getElementById("exercise").value;
  const sets = document.getElementById("sets").value;
  const reps = document.getElementById("reps").value;
  const notes = document.getElementById("notes").value;

  if (!exercise || !sets || !reps) {
    alert("Please fill in all fields!");
    return;
  }

  const workout = {
    date: new Date().toLocaleString(),
    exercise,
    sets,
    reps,
    notes,
  };

  workoutLogs.unshift(workout);
  localStorage.setItem("workoutLogs", JSON.stringify(workoutLogs));
  displayWorkouts();

  document.getElementById("exercise").value = "";
  document.getElementById("sets").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("notes").value = "";
}

function displayWorkouts() {
  const list = document.getElementById("workout-list");
  list.innerHTML = "";

  workoutLogs.slice(0, 10).forEach((w) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${w.exercise}</strong> (${w.sets}x${w.reps}) - ${w.date}<br><em>${w.notes}</em>`;
    list.appendChild(li);
  });
}

// On page load
updateStreakDisplay();
displayWorkouts();



function downloadBackup() {
    const backup = {
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      lastGymDate: lastDate,
      workoutLogs: workoutLogs
    };
  
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "gym-tracker-backup.json";
    a.click();
  
    URL.revokeObjectURL(url);
  }
  
  function importBackup() {
    const fileInput = document.getElementById("import-file");
    const file = fileInput.files[0];
  
    if (!file) {
      alert("Please choose a .json file to import.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
  
        if (!data || typeof data !== "object") {
          throw new Error("Invalid file format");
        }
  
        // Restore values
        currentStreak = parseInt(data.currentStreak) || 0;
        longestStreak = parseInt(data.longestStreak) || 0;
        lastDate = data.lastGymDate || null;
        workoutLogs = data.workoutLogs || [];
  
        // Save to localStorage
        localStorage.setItem("currentStreak", currentStreak);
        localStorage.setItem("longestStreak", longestStreak);
        localStorage.setItem("lastGymDate", lastDate);
        localStorage.setItem("workoutLogs", JSON.stringify(workoutLogs));
  
        // Refresh UI
        updateStreakDisplay();
        displayWorkouts();
  
        alert("Backup imported successfully!");
      } catch (error) {
        alert("Failed to import backup. Please check the file.");
      }
    };
  
    reader.readAsText(file);
  }

  
  function downloadCSV() {
    if (workoutLogs.length === 0) {
      alert("No workout logs to export.");
      return;
    }
  
    const headers = ["Date", "Exercise", "Sets", "Reps", "Notes"];
    const rows = workoutLogs.map(log => [
      log.date,
      log.exercise,
      log.sets,
      log.reps,
      `"${log.notes?.replace(/"/g, '""') || ""}"`
    ]);
  
    let csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "workout-logs.csv";
    a.click();
  
    URL.revokeObjectURL(url);
  }
// Initialize weight tracking chart
const weightData = JSON.parse(localStorage.getItem('weightData')) || [];
const weightChartCtx = document.getElementById('weightChart').getContext('2d');

const weightChart = new Chart(weightChartCtx, {
  type: 'line',
  data: {
    labels: weightData.map(entry => entry.date), // Dates from the logs
    datasets: [{
      label: 'Weight (kg)',
      data: weightData.map(entry => entry.weight), // Weight values
      fill: false,
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.1,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Weight (kg)',
        },
        min: 0
      }
    }
  }
});

// Add weight log function (to log weight and update the chart)
function logWeight() {
  const weight = parseFloat(prompt("Enter your weight (kg):"));
  if (!isNaN(weight)) {
    const date = new Date().toLocaleDateString();
    weightData.push({ date, weight });

    // Save to localStorage
    localStorage.setItem('weightData', JSON.stringify(weightData));

    // Update the weight chart
    weightChart.data.labels.push(date);
    weightChart.data.datasets[0].data.push(weight);
    weightChart.update();
  }
}

// Initialize workout performance chart
const workoutData = JSON.parse(localStorage.getItem('workoutData')) || [];
const performanceChartCtx = document.getElementById('performanceChart').getContext('2d');

const performanceChart = new Chart(performanceChartCtx, {
  type: 'line',
  data: {
    labels: workoutData.map(entry => entry.date), // Dates from the logs
    datasets: [{
      label: 'Weight Lifted (kg)',
      data: workoutData.map(entry => entry.weight), // Weight values lifted
      fill: false,
      borderColor: 'rgba(54, 162, 235, 1)',
      tension: 0.1,
    },
    {
      label: 'Reps',
      data: workoutData.map(entry => entry.reps), // Reps performed
      fill: false,
      borderColor: 'rgba(153, 102, 255, 1)',
      tension: 0.1,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Reps / Weight (kg)',
        },
        min: 0
      }
    }
  }
});

// Update workout performance (log weight lifted and reps performed)
function logWorkout() {
  const exercise = document.getElementById('exercise').value;
  const sets = parseInt(document.getElementById('sets').value);
  const reps = parseInt(document.getElementById('reps').value);
  const weight = parseInt(prompt("Enter the weight lifted (kg):"));
  const notes = document.getElementById('notes').value;
  
  if (exercise && sets && reps && weight) {
    const date = new Date().toLocaleDateString();
    workoutData.push({ date, exercise, sets, reps, weight, notes });

    // Save to localStorage
    localStorage.setItem('workoutData', JSON.stringify(workoutData));

    // Update performance chart
    performanceChart.data.labels.push(date);
    performanceChart.data.datasets[0].data.push(weight);
    performanceChart.data.datasets[1].data.push(reps);
    performanceChart.update();
  }
}


//GALLERY

