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
    
    // Update active state for mode buttons
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      if (btn.dataset.mode === screenId.replace("-screen", "")) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    
    // 特殊处理阅读模式
    if (screenId === 'reading-screen') {
      // 确保单词定义弹窗被隐藏
      const popup = document.getElementById('word-definition-popup');
      if (popup) {
        popup.style.display = 'none';
      }
    }
  }

  showFeedback(message, type = "success") {
    // If first parameter is a DOM element, use the old signature
    if (typeof message === "object" && message.tagName) {
      const element = message;
      const msg = type;
      const isCorrect = arguments[2];

      if (!element) return;

      element.textContent = msg;
      element.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
      element.style.display = "block";
      return;
    }

    // New signature for tests
    let feedbackElement = document.querySelector(".feedback-message");
    if (!feedbackElement) {
      feedbackElement = document.createElement("div");
      feedbackElement.className = "feedback-message";
      document.body.appendChild(feedbackElement);
    }

    feedbackElement.textContent = message;
    feedbackElement.className = `feedback-message ${type}`;
    feedbackElement.style.display = "block";
  }

  updateScore(score) {
    let scoreElement = document.querySelector(".score-display");
    if (!scoreElement) {
      scoreElement = document.createElement("div");
      scoreElement.className = "score-display";
      document.body.appendChild(scoreElement);
    }
    scoreElement.textContent = score.toString();
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
        btn.addEventListener("click", () => {
          this.showScreen("welcome-screen");
          // Reset any ongoing game states when returning to welcome
          if (window.app) {
            window.app.gameManager.resetGame();
          }
        });
      });

    // Settings
    document.getElementById("settings-btn")?.addEventListener("click", () => {
      this.showScreen("settings-screen");
    });

    // Mode buttons
    document.querySelectorAll(".mode-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;

        // Always reset modes when switching - ensure fresh start every time
        if (window.app) {
          window.app.enterMode(mode);
        }

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
