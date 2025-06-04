// UI management module
export class UIManager {
  constructor() {
    this.currentScreen = "welcome-screen";
    this.initializeEventListeners();
  }

  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add("active");
      this.currentScreen = screenId;
    }
  }

  showFeedback(element, message, isCorrect) {
    if (!element) return;

    element.textContent = message;
    element.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
    element.style.display = "block";
  }

  updateProgress(current, total) {
    const progressElement = document.getElementById("learn-progress");
    if (progressElement) {
      const progress = ((current + 1) / total) * 100;
      progressElement.style.width = `${progress}%`;
    }
  }

  updateScoreDisplay(score, streak) {
    const scoreElement = document.getElementById("current-score");
    const streakElement = document.getElementById("current-streak");

    if (scoreElement) scoreElement.textContent = score;
    if (streakElement) streakElement.textContent = streak;
  }

  initializeEventListeners() {
    // Back buttons - handle all types of back buttons
    document
      .querySelectorAll(".back-btn, #back-to-welcome, #back-to-menu")
      .forEach((btn) => {
        btn.addEventListener("click", () => this.showScreen("welcome-screen"));
      });

    // Settings
    document.getElementById("settings-btn")?.addEventListener("click", () => {
      this.showScreen("settings-screen");
    });

    // Mode buttons
    document.querySelectorAll(".mode-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;
        this.showScreen(`${mode}-screen`);
      });
    });
  }

  // Theme management
  setTheme(theme) {
    document.documentElement.setAttribute("data-color-scheme", theme);
    localStorage.setItem("theme", theme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    this.setTheme(savedTheme);
    return savedTheme;
  }
}
