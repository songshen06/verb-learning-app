// Main application file
import { verbData } from "./config/verbs.js";
import { DEFAULT_SETTINGS, GAME_SETTINGS } from "./config/settings.js";
import { SpeechManager } from "./utils/speech.js";
import { GameManager } from "./utils/game.js";
import { UIManager } from "./modules/ui.js";

class VerbLearningApp {
  constructor() {
    this.speechManager = new SpeechManager();
    this.gameManager = new GameManager();
    this.uiManager = new UIManager();
    this.settings = { ...DEFAULT_SETTINGS };
    this.currentVerbIndex = 0;
    this.challengeQuestions = [];
    this.matchingPairs = {};

    this.initializeApp();
  }

  initializeApp() {
    // Load saved settings
    this.loadSettings();

    // Initialize game modes
    this.initializeLearnMode();
    this.initializePracticeMode();
    this.initializeChallengeMode();

    // Load theme
    this.uiManager.loadTheme();
  }

  loadSettings() {
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
  }

  saveSettings() {
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }

  // Learn Mode
  initializeLearnMode() {
    this.displayCurrentVerb();

    // Navigation buttons
    document.getElementById("prev-verb")?.addEventListener("click", () => {
      if (this.currentVerbIndex > 0) {
        this.currentVerbIndex--;
        this.displayCurrentVerb();
      }
    });

    document.getElementById("next-verb")?.addEventListener("click", () => {
      if (this.currentVerbIndex < verbData.length - 1) {
        this.currentVerbIndex++;
        this.displayCurrentVerb();
      }
    });

    // Audio buttons
    document
      .getElementById("play-infinitive")
      ?.addEventListener("click", () => {
        const verb = verbData[this.currentVerbIndex];
        this.speechManager.speak(verb.infinitive, this.settings);
      });

    document.getElementById("play-past")?.addEventListener("click", () => {
      const verb = verbData[this.currentVerbIndex];
      this.speechManager.speak(verb.past, this.settings);
    });

    document
      .getElementById("play-definition")
      ?.addEventListener("click", () => {
        const verb = verbData[this.currentVerbIndex];
        this.speechManager.speak(verb.definition, this.settings);
      });

    document.getElementById("play-example")?.addEventListener("click", () => {
      const verb = verbData[this.currentVerbIndex];
      this.speechManager.speak(verb.example, this.settings);
    });

    document
      .getElementById("play-past-example")
      ?.addEventListener("click", () => {
        const verb = verbData[this.currentVerbIndex];
        this.speechManager.speak(verb.past_example, this.settings);
      });

    // Settings
    document.getElementById("speech-speed")?.addEventListener("change", (e) => {
      this.settings.speechSpeed = parseFloat(e.target.value);
      this.saveSettings();
    });

    document.getElementById("voice-volume")?.addEventListener("input", (e) => {
      this.settings.voiceVolume = parseFloat(e.target.value);
      this.saveSettings();
    });

    document
      .getElementById("auto-play-audio")
      ?.addEventListener("change", (e) => {
        this.settings.autoPlayAudio = e.target.checked;
        this.saveSettings();
      });
  }

  displayCurrentVerb() {
    const verb = verbData[this.currentVerbIndex];

    // Update content
    document.getElementById("current-infinitive").textContent = verb.infinitive;
    document.getElementById("current-past").textContent = verb.past;
    document.getElementById("current-definition").textContent = verb.definition;
    document.getElementById("current-example").textContent = verb.example;
    document.getElementById("current-past-example").textContent =
      verb.past_example;

    // Update progress
    const currentElement = document.getElementById("learn-current");
    const totalElement = document.getElementById("learn-total");
    const progressElement = document.getElementById("learn-progress");

    if (currentElement)
      currentElement.textContent = (this.currentVerbIndex + 1).toString();
    if (totalElement) totalElement.textContent = verbData.length.toString();
    if (progressElement) {
      const progress = ((this.currentVerbIndex + 1) / verbData.length) * 100;
      progressElement.style.width = `${progress}%`;
    }

    // Update navigation buttons
    const prevButton = document.getElementById("prev-verb");
    const nextButton = document.getElementById("next-verb");
    if (prevButton) prevButton.disabled = this.currentVerbIndex === 0;
    if (nextButton)
      nextButton.disabled = this.currentVerbIndex === verbData.length - 1;

    // Auto-play audio if enabled
    if (this.settings.autoPlayAudio) {
      setTimeout(
        () => this.speechManager.speak(verb.infinitive, this.settings),
        500
      );
    }
  }

  // Practice Mode
  initializePracticeMode() {
    this.gameManager.resetGame();
    this.uiManager.updateScoreDisplay(0, 0);

    // Activity selection buttons
    document.querySelectorAll(".activity-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const activity = button.dataset.activity;
        this.showActivity(activity);
      });
    });

    // Initialize practice activities
    this.initializeMatchingGame();
    this.initializeFillBlankGame();
    this.initializePronunciationGame();
  }

  showActivity(activityType) {
    // Hide all activities
    document.querySelectorAll(".activity").forEach((activity) => {
      activity.classList.add("hidden");
    });

    // Show selected activity
    const activityElement = document.getElementById(`${activityType}-game`);
    if (activityElement) {
      activityElement.classList.remove("hidden");
    }
  }

  // Matching Game
  initializeMatchingGame() {
    document
      .getElementById("check-matches")
      ?.addEventListener("click", () => this.checkMatches());
    this.setupMatchingGame();
  }

  setupMatchingGame() {
    const selectedVerbs = this.gameManager
      .shuffle(verbData)
      .slice(0, GAME_SETTINGS.matchingGameVerbs);
    const infinitiveContainer = document.getElementById("infinitive-cards");
    const pastContainer = document.getElementById("past-cards");

    if (!infinitiveContainer || !pastContainer) return;

    infinitiveContainer.innerHTML = "";
    pastContainer.innerHTML = "";
    this.matchingPairs = {};

    // Create infinitive cards (draggable)
    selectedVerbs.forEach((verb) => {
      const card = document.createElement("div");
      card.className = "verb-card-small";
      card.textContent = verb.infinitive;
      card.dataset.verbId = verb.id;
      card.draggable = true;
      infinitiveContainer.appendChild(card);

      // Drag events
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", verb.id);
        e.dataTransfer.setData("text/infinitive", verb.infinitive);
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });
    });

    // Create past form drop zones
    this.gameManager.shuffle(selectedVerbs).forEach((verb) => {
      const dropZone = document.createElement("div");
      dropZone.className = "drop-zone";
      dropZone.innerHTML = `<strong>${verb.past}</strong>`;
      dropZone.dataset.verbId = verb.id;
      dropZone.dataset.pastForm = verb.past;
      pastContainer.appendChild(dropZone);

      // Drop events
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
      });

      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");

        const draggedId = e.dataTransfer.getData("text/plain");
        const draggedInfinitive = e.dataTransfer.getData("text/infinitive");

        dropZone.innerHTML = `<strong>${dropZone.dataset.pastForm}</strong> ← ${draggedInfinitive}`;
        dropZone.dataset.droppedId = draggedId;

        this.matchingPairs[dropZone.dataset.verbId] = draggedId;
      });
    });
  }

  checkMatches() {
    const dropZones = document.querySelectorAll(".drop-zone");
    let correctMatches = 0;
    const totalMatches = dropZones.length;

    dropZones.forEach((zone) => {
      const expectedId = zone.dataset.verbId;
      const droppedId = zone.dataset.droppedId;

      if (expectedId === droppedId) {
        zone.classList.add("matched");
        const infinitiveCard = document.querySelector(
          `[data-verb-id="${expectedId}"]`
        );
        if (infinitiveCard) infinitiveCard.classList.add("matched");
        correctMatches++;
      } else if (droppedId) {
        zone.classList.add("incorrect");
        const infinitiveCard = document.querySelector(
          `[data-verb-id="${droppedId}"]`
        );
        if (infinitiveCard) infinitiveCard.classList.add("incorrect");
      }
    });

    const points = correctMatches * GAME_SETTINGS.pointsPerCorrect;
    const result = this.gameManager.updateScore(points);
    this.uiManager.updateScoreDisplay(result.score, result.streak);

    if (correctMatches === totalMatches) {
      this.speechManager.speak(
        "Excellent! All matches are correct!",
        this.settings
      );
      setTimeout(() => this.setupMatchingGame(), 3000);
    } else {
      this.speechManager.speak(
        `Good try! You got ${correctMatches} out of ${totalMatches} correct.`,
        this.settings
      );
      setTimeout(() => this.setupMatchingGame(), 4000);
    }
  }

  // Fill in the Blank Game
  initializeFillBlankGame() {
    document
      .getElementById("submit-answer")
      ?.addEventListener("click", () => this.checkBlankAnswer());
    document.getElementById("hear-question")?.addEventListener("click", () => {
      const questionText =
        document.getElementById("blank-question")?.textContent;
      if (questionText) {
        this.speechManager.speak(questionText, this.settings);
      }
    });

    document
      .getElementById("blank-answer")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.checkBlankAnswer();
        }
      });

    this.setupFillBlankGame();
  }

  setupFillBlankGame() {
    const randomVerb = verbData[Math.floor(Math.random() * verbData.length)];
    const questionText = `Yesterday, I _____ ${randomVerb.past_example
      .split(" ")
      .slice(3)
      .join(" ")} (${randomVerb.infinitive})`;

    const questionElement = document.getElementById("blank-question");
    const answerInput = document.getElementById("blank-answer");
    const feedback = document.getElementById("answer-feedback");

    if (questionElement && answerInput && feedback) {
      questionElement.textContent = questionText;
      answerInput.value = "";
      answerInput.dataset.correctAnswer = randomVerb.past;
      feedback.style.display = "none";
    }

    if (this.settings.autoPlayAudio) {
      setTimeout(
        () => this.speechManager.speak(questionText, this.settings),
        500
      );
    }
  }

  checkBlankAnswer() {
    const answerInput = document.getElementById("blank-answer");
    const feedback = document.getElementById("answer-feedback");

    if (!answerInput || !feedback) return;

    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = answerInput.dataset.correctAnswer.toLowerCase();

    if (userAnswer === correctAnswer) {
      this.uiManager.showFeedback(feedback, "🎉 Correct! Well done!", true);
      const result = this.gameManager.updateScore(
        GAME_SETTINGS.pointsPerCorrect
      );
      this.uiManager.updateScoreDisplay(result.score, result.streak);
      this.speechManager.speak("Correct! Well done!", this.settings);
      setTimeout(() => this.setupFillBlankGame(), 2000);
    } else {
      this.uiManager.showFeedback(
        feedback,
        `Not quite right. The correct answer is "${correctAnswer}". Try again!`,
        false
      );
      const result = this.gameManager.updateScore(
        GAME_SETTINGS.pointsPerIncorrect
      );
      this.uiManager.updateScoreDisplay(result.score, result.streak);
      this.speechManager.speak(
        `Not quite right. The correct answer is ${correctAnswer}`,
        this.settings
      );
    }
  }

  // Pronunciation Game
  initializePronunciationGame() {
    if (!this.speechManager.recognition) {
      const pronunciationGame = document.getElementById("pronunciation-game");
      if (pronunciationGame) {
        pronunciationGame.innerHTML =
          "<p>Speech recognition is not available in your browser. Please try a different browser or use the other activities.</p>";
      }
      return;
    }

    document
      .getElementById("start-recording")
      ?.addEventListener("click", () => this.startRecording());
    document
      .getElementById("stop-recording")
      ?.addEventListener("click", () => this.stopRecording());
    document
      .getElementById("play-target-word")
      ?.addEventListener("click", () => {
        const targetWord = document.getElementById(
          "target-pronunciation"
        )?.textContent;
        if (targetWord) {
          this.speechManager.speak(targetWord, this.settings);
        }
      });

    // 添加重试按钮
    const retryButton = document.createElement("button");
    retryButton.id = "retry-pronunciation";
    retryButton.className = "btn btn--outline";
    retryButton.textContent = "Try Again";
    retryButton.addEventListener("click", () => this.setupPronunciationGame());

    const pronunciationGame = document.getElementById("pronunciation-game");
    if (pronunciationGame) {
      const feedbackContainer = document.getElementById(
        "pronunciation-feedback"
      );
      if (feedbackContainer) {
        feedbackContainer.parentNode.insertBefore(
          retryButton,
          feedbackContainer.nextSibling
        );
      }
    }

    this.setupPronunciationGame();
  }

  setupPronunciationGame() {
    const randomVerb = verbData[Math.floor(Math.random() * verbData.length)];
    const wordToSay =
      Math.random() > 0.5 ? randomVerb.infinitive : randomVerb.past;

    const targetWord = document.getElementById("target-pronunciation");
    const feedback = document.getElementById("pronunciation-feedback");
    const retryButton = document.getElementById("retry-pronunciation");

    if (targetWord && feedback) {
      targetWord.textContent = wordToSay;
      feedback.style.display = "none";
      feedback.innerHTML = `
        <div class="pronunciation-instructions">
          <p>Please pronounce the word: <strong>${wordToSay}</strong></p>
          <p>Click the microphone button to start recording</p>
        </div>
      `;
    }

    if (retryButton) {
      retryButton.style.display = "none";
    }

    // 重置录音按钮状态
    const startBtn = document.getElementById("start-recording");
    const stopBtn = document.getElementById("stop-recording");
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;

    if (this.settings.autoPlayAudio) {
      setTimeout(() => this.speechManager.speak(wordToSay, this.settings), 500);
    }
  }

  startRecording() {
    const startBtn = document.getElementById("start-recording");
    const stopBtn = document.getElementById("stop-recording");
    const feedback = document.getElementById("pronunciation-feedback");

    if (startBtn && stopBtn) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
    }

    if (feedback) {
      feedback.innerHTML =
        '<p class="recording-status">🎤 Recording... Please speak now</p>';
      feedback.style.display = "block";
    }

    this.speechManager.startRecording(
      (speechResult) => {
        const targetWord = document
          .getElementById("target-pronunciation")
          ?.textContent.toLowerCase();
        const feedback = document.getElementById("pronunciation-feedback");
        const retryButton = document.getElementById("retry-pronunciation");

        if (targetWord && feedback) {
          const normalizedResult = speechResult.toLowerCase().trim();
          const normalizedTarget = targetWord.toLowerCase().trim();

          if (normalizedResult === normalizedTarget) {
            feedback.innerHTML = `
              <div class="pronunciation-result correct">
                <p>🎉 Perfect pronunciation!</p>
                <p>You said: "${speechResult}"</p>
                <p>Target word: "${targetWord}"</p>
              </div>
            `;
            const scoreResult = this.gameManager.updateScore(
              GAME_SETTINGS.pointsPerCorrect
            );
            this.uiManager.updateScoreDisplay(
              scoreResult.score,
              scoreResult.streak
            );
            this.speechManager.speak("Perfect pronunciation!", this.settings);

            // 2秒后自动进入下一题
            setTimeout(() => this.setupPronunciationGame(), 2000);
          } else {
            feedback.innerHTML = `
              <div class="pronunciation-result incorrect">
                <p>Not quite right. Let's try again!</p>
                <p>You said: "${speechResult}"</p>
                <p>Target word: "${targetWord}"</p>
                <p>Tips: Listen to the correct pronunciation and try again</p>
              </div>
            `;
            this.speechManager.speak(
              `You said ${speechResult}. The correct word is ${targetWord}. Please try again.`,
              this.settings
            );

            // 显示重试按钮
            if (retryButton) {
              retryButton.style.display = "block";
            }
          }
          feedback.style.display = "block";
        }
      },
      (error) => {
        const feedback = document.getElementById("pronunciation-feedback");
        if (feedback) {
          feedback.innerHTML = `
            <div class="pronunciation-error">
              <p>Could not recognize speech. Please try again.</p>
              <p>Error: ${error}</p>
            </div>
          `;
          feedback.style.display = "block";
        }
      }
    );
  }

  stopRecording() {
    const startBtn = document.getElementById("start-recording");
    const stopBtn = document.getElementById("stop-recording");
    const feedback = document.getElementById("pronunciation-feedback");

    if (startBtn && stopBtn) {
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    if (feedback) {
      feedback.innerHTML =
        '<p class="processing-status">Processing your pronunciation...</p>';
    }

    this.speechManager.stopRecording();
  }

  // Challenge Mode
  initializeChallengeMode() {
    this.challengeQuestions = this.generateChallengeQuestions();
    this.displayChallengeQuestion();

    // Initialize challenge buttons
    document
      .getElementById("next-challenge")
      ?.addEventListener("click", () => this.nextChallengeQuestion());
    document
      .getElementById("finish-challenge")
      ?.addEventListener("click", () => this.showResults());
  }

  generateChallengeQuestions() {
    const questions = [];
    const shuffledVerbs = this.gameManager.shuffle(verbData);

    // 使用所有动词生成问题
    shuffledVerbs.forEach((verb) => {
      // Create wrong answers
      const otherVerbs = verbData.filter((v) => v.id !== verb.id);
      const wrongAnswers = this.gameManager
        .shuffle(otherVerbs)
        .slice(0, 3)
        .map((v) => v.past);
      const allOptions = this.gameManager.shuffle([verb.past, ...wrongAnswers]);

      questions.push({
        question: `What is the past form of "${verb.infinitive}"?`,
        options: allOptions,
        correct: verb.past,
        verb: verb,
      });
    });

    // 返回所有问题，不再限制数量
    return questions;
  }

  displayChallengeQuestion() {
    const question = this.challengeQuestions[this.currentVerbIndex];
    if (!question) return;

    // Update question text
    const questionText = document.getElementById("challenge-question-text");
    if (questionText) {
      questionText.textContent = question.question;
    }

    // Update options
    const optionsContainer = document.getElementById("challenge-options");
    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "btn btn--outline option-btn";
        button.textContent = option;
        button.dataset.answer = option;
        button.addEventListener("click", () =>
          this.selectChallengeAnswer(option)
        );
        optionsContainer.appendChild(button);
      });
    }

    // Reset feedback and buttons
    const feedback = document.getElementById("challenge-feedback");
    if (feedback) {
      feedback.style.display = "none";
      feedback.className = "challenge-feedback";
    }

    const nextBtn = document.getElementById("next-challenge");
    const finishBtn = document.getElementById("finish-challenge");
    if (nextBtn) nextBtn.classList.add("hidden");
    if (finishBtn) finishBtn.classList.add("hidden");

    // Update progress
    const currentElement = document.getElementById("challenge-current");
    const totalElement = document.getElementById("challenge-total");
    if (currentElement)
      currentElement.textContent = (this.currentVerbIndex + 1).toString();
    if (totalElement)
      totalElement.textContent = this.challengeQuestions.length.toString();

    // Auto-play audio if enabled
    if (this.settings.autoPlayAudio) {
      setTimeout(
        () => this.speechManager.speak(question.question, this.settings),
        500
      );
    }
  }

  selectChallengeAnswer(selectedAnswer) {
    const question = this.challengeQuestions[this.currentVerbIndex];
    if (!question) return;

    // 确保答案比较时都转换为小写并去除空格
    const normalizedSelectedAnswer = selectedAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = question.correct.toLowerCase().trim();
    const isCorrect = normalizedSelectedAnswer === normalizedCorrectAnswer;

    const feedback = document.getElementById("challenge-feedback");

    // Disable all option buttons and add visual feedback
    document.querySelectorAll(".option-btn").forEach((button) => {
      button.disabled = true;
      button.classList.remove("correct", "incorrect");

      const buttonAnswer = button.dataset.answer.toLowerCase().trim();
      if (buttonAnswer === normalizedCorrectAnswer) {
        button.classList.add("correct");
      } else if (buttonAnswer === normalizedSelectedAnswer && !isCorrect) {
        button.classList.add("incorrect");
      }
    });

    if (isCorrect) {
      this.uiManager.showFeedback(feedback, "🎉 Correct! Well done!", true);
      const result = this.gameManager.updateScore(
        GAME_SETTINGS.pointsPerCorrect
      );
      this.uiManager.updateScoreDisplay(result.score, result.streak);
      this.speechManager.speak("Correct! Well done!", this.settings);
    } else {
      this.uiManager.showFeedback(
        feedback,
        `Incorrect. The correct answer is "${question.correct}".`,
        false
      );
      this.speechManager.speak(
        `Incorrect. The correct answer is ${question.correct}`,
        this.settings
      );
    }

    // Show appropriate next button
    setTimeout(() => {
      const nextBtn = document.getElementById("next-challenge");
      const finishBtn = document.getElementById("finish-challenge");

      if (this.currentVerbIndex < this.challengeQuestions.length - 1) {
        if (nextBtn) nextBtn.classList.remove("hidden");
      } else {
        if (finishBtn) finishBtn.classList.remove("hidden");
      }
    }, 1000);
  }

  nextChallengeQuestion() {
    this.currentVerbIndex++;
    this.displayChallengeQuestion();
  }

  showResults() {
    const finalScore = this.gameManager.currentScore;
    const totalPossible =
      this.challengeQuestions.length * GAME_SETTINGS.pointsPerCorrect;
    const percentage = Math.round((finalScore / totalPossible) * 100);

    const finalScoreElement = document.getElementById("final-score");
    if (finalScoreElement) {
      finalScoreElement.textContent = `${finalScore} out of ${totalPossible} (${percentage}%)`;
    }

    // Generate achievements
    const achievements = this.gameManager.generateAchievements(
      finalScore,
      totalPossible,
      this.gameManager.currentStreak
    );

    const achievementsContainer = document.getElementById("achievements");
    if (achievementsContainer) {
      achievementsContainer.innerHTML = "";
      achievements.forEach((achievement) => {
        const badge = document.createElement("span");
        badge.className = "achievement-badge";
        badge.textContent = achievement;
        achievementsContainer.appendChild(badge);
      });
    }

    this.uiManager.showScreen("results-screen");

    // Speak results
    this.speechManager.speak(
      `Congratulations! You scored ${finalScore} out of ${totalPossible} points. That's ${percentage} percent!`,
      this.settings
    );
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  window.app = new VerbLearningApp();
});
