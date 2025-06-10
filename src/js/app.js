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
    this.currentVerbIndex = 0; // For learn mode
    this.currentChallengeIndex = 0; // For challenge mode
    this.challengeQuestions = [];
    this.matchingPairs = {};
    // Fill blank game state
    this.currentFillBlankVerb = null;
    this.userAnswer = [];
    // Letter choice game state
    this.currentLetterChoiceVerb = null;
    this.missingLetterIndex = 0;
    this.correctLetter = "";

    this.initializeApp();
  }

  initializeApp() {
    // Load saved settings
    this.loadSettings();

    // Initialize game modes
    this.initializeLearnMode();
    this.initializePracticeMode();
    this.initializeChallengeMode();
    this.initializeResultsScreen();

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
        // Regenerate the specific activity when selected
        this.refreshActivity(activity);
      });
    });

    // Initialize practice activities
    this.initializeMatchingGame();
    this.initializeFillBlankGame();
    this.initializeLetterChoiceGame();
    this.initializePronunciationGame();
  }

  // Refresh specific activity
  refreshActivity(activityType) {
    switch (activityType) {
      case "matching":
        this.setupMatchingGame();
        break;
      case "fill-blank":
        this.setupFillBlankGame();
        break;
      case "letter-choice":
        this.setupLetterChoiceGame();
        break;
      case "pronunciation":
        this.setupPronunciationGame();
        break;
    }
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
    // Always generate fresh verbs for matching
    const selectedVerbs = this.gameManager
      .shuffle(verbData)
      .slice(0, GAME_SETTINGS.matchingGameVerbs);
    const infinitiveContainer = document.getElementById("infinitive-cards");
    const pastContainer = document.getElementById("past-cards");

    if (!infinitiveContainer || !pastContainer) return;

    // Clear previous game state
    infinitiveContainer.innerHTML = "";
    pastContainer.innerHTML = "";
    this.matchingPairs = {};

    // Remove any previous styling
    document
      .querySelectorAll(".verb-card-small, .drop-zone")
      .forEach((element) => {
        element.classList.remove(
          "matched",
          "incorrect",
          "selected",
          "dragging",
          "drag-over"
        );
      });

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

        // 移除之前选中的单词的 selected 类
        const previouslySelected = document.querySelector(
          `.verb-card-small.selected[data-verb-id="${dropZone.dataset.droppedId}"]`
        );
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }

        // 为当前选中的单词添加 selected 类
        const selectedCard = document.querySelector(
          `.verb-card-small[data-verb-id="${draggedId}"]`
        );
        if (selectedCard) {
          selectedCard.classList.add("selected");
        }

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
        if (infinitiveCard) {
          infinitiveCard.classList.add("matched");
          infinitiveCard.classList.remove("selected");
        }
        correctMatches++;
      } else if (droppedId) {
        zone.classList.add("incorrect");
        const infinitiveCard = document.querySelector(
          `[data-verb-id="${droppedId}"]`
        );
        if (infinitiveCard) {
          infinitiveCard.classList.add("incorrect");
          infinitiveCard.classList.remove("selected");
        }
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

      // Show completion message and ask if user wants to continue
      setTimeout(() => {
        const continueGame = confirm(
          "🎉 Well done! All matches are correct!\n\nWould you like to try another set of words?"
        );
        if (continueGame) {
          this.setupMatchingGame();
        } else {
          // Hide the activity and return to activity selector
          document.querySelectorAll(".activity").forEach((activity) => {
            activity.classList.add("hidden");
          });
        }
      }, 2000);
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
      // Play the complete sentence instead of the one with blanks
      if (this.currentFillBlankVerb) {
        this.speechManager.speak(
          this.currentFillBlankVerb.past_example,
          this.settings
        );
      }
    });

    document
      .getElementById("clear-answer")
      ?.addEventListener("click", () => this.clearAnswer());

    this.setupFillBlankGame();
  }

  setupFillBlankGame() {
    const randomVerb = verbData[Math.floor(Math.random() * verbData.length)];
    this.currentFillBlankVerb = randomVerb;
    this.userAnswer = new Array(randomVerb.past.length).fill(undefined);

    // Create question using the past example
    const pastExample = randomVerb.past_example;
    const questionText = pastExample.replace(randomVerb.past, "_____");
    const hintText = `(Hint: past form of "${randomVerb.infinitive}")`;

    // Set up question
    const questionElement = document.getElementById("blank-question");
    const hintElement = document.getElementById("hint-text");
    if (questionElement) questionElement.textContent = questionText;
    if (hintElement) hintElement.textContent = hintText;

    // Generate scrambled letters
    this.generateLetterBubbles(randomVerb.past);
    this.generateAnswerSlots(randomVerb.past.length);

    // Clear feedback
    const feedback = document.getElementById("answer-feedback");
    if (feedback) {
      feedback.style.display = "none";
      feedback.className = "feedback";
    }

    if (this.settings.autoPlayAudio) {
      setTimeout(
        () => this.speechManager.speak(randomVerb.past_example, this.settings),
        500
      );
    }
  }

  generateLetterBubbles(word) {
    const letters = word.toUpperCase().split("");
    const scrambledLetters = this.gameManager.shuffle([...letters]);

    const container = document.getElementById("letter-bubbles");
    if (!container) return;

    container.innerHTML = "";
    scrambledLetters.forEach((letter, index) => {
      const bubble = document.createElement("div");
      bubble.className = "letter-bubble";
      bubble.textContent = letter;
      bubble.dataset.letter = letter;
      bubble.dataset.originalIndex = index;

      bubble.addEventListener("click", () => this.selectLetter(bubble));
      container.appendChild(bubble);
    });
  }

  generateAnswerSlots(length) {
    const container = document.getElementById("answer-slots");
    if (!container) return;

    container.innerHTML = "";
    for (let i = 0; i < length; i++) {
      const slot = document.createElement("div");
      slot.className = "answer-slot";
      slot.dataset.position = i;

      slot.addEventListener("click", () => this.removeFromSlot(i));
      container.appendChild(slot);
    }
  }

  selectLetter(bubble) {
    if (bubble.classList.contains("used")) {
      return;
    }

    const letter = bubble.dataset.letter;
    const nextEmptySlot = this.findNextEmptySlot();

    if (nextEmptySlot !== -1) {
      // Add letter to answer
      this.userAnswer[nextEmptySlot] = letter;

      // Update slot visually
      const slot = document.querySelector(`[data-position="${nextEmptySlot}"]`);
      if (slot) {
        slot.textContent = letter;
        slot.classList.add("filled");
        slot.dataset.bubbleIndex = bubble.dataset.originalIndex;
      }

      // Mark bubble as used
      bubble.classList.add("used");
    }
  }

  removeFromSlot(position) {
    const slot = document.querySelector(`[data-position="${position}"]`);
    if (!slot || !slot.classList.contains("filled")) return;

    const bubbleIndex = slot.dataset.bubbleIndex;
    // Find the bubble by its original index
    const bubbles = document.querySelectorAll(".letter-bubble");
    let bubble = null;
    bubbles.forEach((b) => {
      if (b.dataset.originalIndex === bubbleIndex) {
        bubble = b;
      }
    });

    // Clear slot
    slot.textContent = "";
    slot.classList.remove("filled");
    delete slot.dataset.bubbleIndex;
    this.userAnswer[position] = undefined;

    // Make bubble available again
    if (bubble) {
      bubble.classList.remove("used");
    }
  }

  findNextEmptySlot() {
    // Initialize userAnswer if not done yet
    if (!this.userAnswer) {
      this.userAnswer = [];
    }

    // Find first empty slot
    for (let i = 0; i < this.currentFillBlankVerb.past.length; i++) {
      if (!this.userAnswer[i]) {
        return i;
      }
    }
    return -1;
  }

  clearAnswer() {
    // Clear all slots
    if (this.currentFillBlankVerb) {
      this.userAnswer = new Array(this.currentFillBlankVerb.past.length).fill(
        undefined
      );
    } else {
      this.userAnswer = [];
    }

    document.querySelectorAll(".answer-slot").forEach((slot) => {
      slot.textContent = "";
      slot.classList.remove("filled");
      delete slot.dataset.bubbleIndex;
    });

    // Make all bubbles available
    document.querySelectorAll(".letter-bubble").forEach((bubble) => {
      bubble.classList.remove("used");
    });
  }

  checkBlankAnswer() {
    if (!this.currentFillBlankVerb) return;

    const feedback = document.getElementById("answer-feedback");
    if (!feedback) return;

    // Get user's answer from slots
    const userAnswerText = this.userAnswer
      .filter(Boolean)
      .join("")
      .toLowerCase();
    const correctAnswer = this.currentFillBlankVerb.past.toLowerCase();

    // Check if answer is complete
    if (
      this.userAnswer.filter(Boolean).length !==
      this.currentFillBlankVerb.past.length
    ) {
      this.uiManager.showFeedback(
        feedback,
        "🤔 Please complete the word first!",
        false
      );
      this.speechManager.speak("Please complete the word first", this.settings);
      return;
    }

    if (userAnswerText === correctAnswer) {
      this.uiManager.showFeedback(
        feedback,
        "🎉 Excellent! You got it right! 🌟",
        true
      );
      const result = this.gameManager.updateScore(
        GAME_SETTINGS.pointsPerCorrect
      );
      this.uiManager.updateScoreDisplay(result.score, result.streak);
      this.speechManager.speak("Excellent! You got it right!", this.settings);

      // Add celebration effect
      this.addCelebrationEffect();

      // Ask if user wants to continue
      setTimeout(() => {
        const continueGame = confirm(
          "🌟 Perfect! You got it right!\n\nWould you like to try another word?"
        );
        if (continueGame) {
          this.setupFillBlankGame();
        } else {
          // Hide the activity and return to activity selector
          document.querySelectorAll(".activity").forEach((activity) => {
            activity.classList.add("hidden");
          });
        }
      }, 2500);
    } else {
      this.uiManager.showFeedback(
        feedback,
        `🌱 Not quite right. The correct answer is "${this.currentFillBlankVerb.past}". Try again!`,
        false
      );
      const result = this.gameManager.updateScore(
        GAME_SETTINGS.pointsPerIncorrect
      );
      this.uiManager.updateScoreDisplay(result.score, result.streak);
      this.speechManager.speak(
        `Not quite right. The correct answer is ${this.currentFillBlankVerb.past}`,
        this.settings
      );

      // Clear the answer for retry
      setTimeout(() => this.clearAnswer(), 1500);
    }
  }

  addCelebrationEffect() {
    // Add sparkling effect to correct answer slots
    document.querySelectorAll(".answer-slot.filled").forEach((slot, index) => {
      setTimeout(() => {
        slot.style.animation = "sparkle 0.6s ease-in-out";
        slot.addEventListener(
          "animationend",
          () => {
            slot.style.animation = "";
          },
          { once: true }
        );
      }, index * 100);
    });
  }

  // Letter Choice Game
  initializeLetterChoiceGame() {
    document
      .getElementById("hear-letter-question")
      ?.addEventListener("click", () => {
        if (this.currentLetterChoiceVerb) {
          this.speechManager.speak(
            this.currentLetterChoiceVerb.past_example,
            this.settings
          );
        }
      });

    document
      .getElementById("next-letter-word")
      ?.addEventListener("click", () => this.setupLetterChoiceGame());

    this.setupLetterChoiceGame();
  }

  setupLetterChoiceGame() {
    const randomVerb = verbData[Math.floor(Math.random() * verbData.length)];
    this.currentLetterChoiceVerb = randomVerb;

    // Choose which letter to remove (avoid first and last positions for better challenge)
    const word = randomVerb.past.toLowerCase();
    const availablePositions = [];
    for (let i = 1; i < word.length - 1; i++) {
      availablePositions.push(i);
    }

    // If word is too short, include all positions
    if (availablePositions.length === 0) {
      for (let i = 0; i < word.length; i++) {
        availablePositions.push(i);
      }
    }

    this.missingLetterIndex =
      availablePositions[Math.floor(Math.random() * availablePositions.length)];
    this.correctLetter = word[this.missingLetterIndex];

    // Create question using the past example
    const pastExample = randomVerb.past_example;
    const questionText = pastExample.replace(randomVerb.past, "_____");
    const hintText = `(Hint: past form of "${randomVerb.infinitive}")`;

    // Set up question
    const questionElement = document.getElementById("letter-choice-question");
    const hintElement = document.getElementById("letter-choice-hint");
    if (questionElement) questionElement.textContent = questionText;
    if (hintElement) hintElement.textContent = hintText;

    // Generate word display with missing letter
    this.generateWordDisplay(word);

    // Generate letter choices
    this.generateLetterChoices();

    // Clear feedback
    const feedback = document.getElementById("letter-choice-feedback");
    if (feedback) {
      feedback.style.display = "none";
      feedback.className = "feedback";
    }

    if (this.settings.autoPlayAudio) {
      setTimeout(
        () => this.speechManager.speak(randomVerb.past_example, this.settings),
        500
      );
    }
  }

  generateWordDisplay(word) {
    const container = document.getElementById("word-letters");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < word.length; i++) {
      const letterDiv = document.createElement("div");
      letterDiv.className = "word-letter";

      if (i === this.missingLetterIndex) {
        letterDiv.className += " blank";
        letterDiv.dataset.position = i;
      } else {
        letterDiv.textContent = word[i];
      }

      container.appendChild(letterDiv);
    }
  }

  generateLetterChoices() {
    const container = document.getElementById("letter-choices");
    if (!container) return;

    container.innerHTML = "";

    // Create array of letters including the correct one and 3 distractors
    const letters = [this.correctLetter];
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    // Add 3 random different letters as distractors
    while (letters.length < 4) {
      const randomLetter =
        alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!letters.includes(randomLetter)) {
        letters.push(randomLetter);
      }
    }

    // Shuffle the letters
    const shuffledLetters = this.gameManager.shuffle([...letters]);

    shuffledLetters.forEach((letter) => {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.textContent = letter;
      button.dataset.letter = letter;

      button.addEventListener("click", () => this.selectLetterChoice(button));
      container.appendChild(button);
    });
  }

  selectLetterChoice(button) {
    const selectedLetter = button.dataset.letter;
    const feedback = document.getElementById("letter-choice-feedback");
    const allChoices = document.querySelectorAll(".choice-btn");

    // Disable all choice buttons
    allChoices.forEach((btn) => (btn.disabled = true));

    if (selectedLetter === this.correctLetter) {
      // Correct answer
      button.classList.add("correct");

      // Fill in the blank letter
      const blankLetter = document.querySelector(".word-letter.blank");
      if (blankLetter) {
        blankLetter.textContent = selectedLetter;
        blankLetter.classList.remove("blank");
        blankLetter.classList.add("filled");
      }

      this.uiManager.showFeedback(
        feedback,
        "🎉 Correct! Well done!",
        "correct"
      );

      const scoreResult = this.gameManager.updateScore(
        GAME_SETTINGS.pointsPerCorrect
      );
      this.uiManager.updateScoreDisplay(scoreResult.score, scoreResult.streak);

      // Automatically generate new word after 2 seconds
      setTimeout(() => {
        this.setupLetterChoiceGame();
      }, 2000);
    } else {
      // Incorrect answer
      button.classList.add("incorrect");

      // Show the correct answer
      allChoices.forEach((btn) => {
        if (btn.dataset.letter === this.correctLetter) {
          btn.classList.add("correct");
        }
      });

      // Fill in the correct letter
      const blankLetter = document.querySelector(".word-letter.blank");
      if (blankLetter) {
        blankLetter.textContent = this.correctLetter;
        blankLetter.classList.remove("blank");
        blankLetter.classList.add("filled");
      }

      this.uiManager.showFeedback(
        feedback,
        `❌ Not quite right. The correct letter is "${this.correctLetter}".`,
        "incorrect"
      );

      this.gameManager.updateScore(0); // No points for incorrect answer
      const scoreResult = this.gameManager.getScore();
      this.uiManager.updateScoreDisplay(scoreResult.score, scoreResult.streak);

      // Automatically generate new word after 3 seconds
      setTimeout(() => {
        this.setupLetterChoiceGame();
      }, 3000);
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
      feedback.style.display = "block";
      feedback.className = "recording-feedback"; // Reset class
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
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = "🎤 Start Recording";
    }
    if (stopBtn) {
      stopBtn.disabled = true;
      stopBtn.textContent = "⏹️ Stop";
    }

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

            // Ask if user wants to continue
            setTimeout(() => {
              const continueGame = confirm(
                "🎤 Perfect pronunciation!\n\nWould you like to practice another word?"
              );
              if (continueGame) {
                this.setupPronunciationGame();
              } else {
                // Hide the activity and return to activity selector
                document.querySelectorAll(".activity").forEach((activity) => {
                  activity.classList.add("hidden");
                });
              }
            }, 2000);
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
    this.currentChallengeIndex = 0;
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
    const question = this.challengeQuestions[this.currentChallengeIndex];
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
      currentElement.textContent = (this.currentChallengeIndex + 1).toString();
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
    const question = this.challengeQuestions[this.currentChallengeIndex];
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
      // Update challenge score display
      const challengeScoreElement = document.getElementById("challenge-score");
      if (challengeScoreElement) {
        challengeScoreElement.textContent = result.score;
      }
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

      if (this.currentChallengeIndex < this.challengeQuestions.length - 1) {
        if (nextBtn) nextBtn.classList.remove("hidden");
      } else {
        if (finishBtn) finishBtn.classList.remove("hidden");
      }
    }, 1000);
  }

  nextChallengeQuestion() {
    this.currentChallengeIndex++;
    this.displayChallengeQuestion();
  }

  showResults() {
    const finalScore = this.gameManager.currentScore;
    const totalPossible =
      this.challengeQuestions.length * GAME_SETTINGS.pointsPerCorrect;
    const percentage =
      totalPossible > 0 ? Math.round((finalScore / totalPossible) * 100) : 0;

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

    // 记录成绩到 ScoreManager
    if (window.scoreManager) {
      window.scoreManager.recordScore("challenge", finalScore, {
        totalPossible,
        percentage,
      });
    }
  }

  // Initialize results screen
  initializeResultsScreen() {
    // Play again button
    document.getElementById("play-again")?.addEventListener("click", () => {
      this.resetChallengeMode();
      this.uiManager.showScreen("challenge-screen");
    });

    // Back to menu button
    document.getElementById("back-to-menu")?.addEventListener("click", () => {
      this.resetAllModes();
      this.uiManager.showScreen("welcome-screen");
    });
  }

  // Reset challenge mode
  resetChallengeMode() {
    this.currentChallengeIndex = 0;
    this.gameManager.resetGame();
    this.challengeQuestions = this.generateChallengeQuestions();
    this.displayChallengeQuestion();

    // Reset challenge score display
    const challengeScoreElement = document.getElementById("challenge-score");
    if (challengeScoreElement) {
      challengeScoreElement.textContent = "0";
    }
  }

  // Reset all modes
  resetAllModes() {
    this.currentVerbIndex = 0;
    this.currentChallengeIndex = 0;
    this.gameManager.resetGame();
    this.displayCurrentVerb();
    // Also reset practice mode components
    this.matchingPairs = {};
  }

  // Method called when entering specific modes to ensure proper reset
  enterMode(mode) {
    switch (mode) {
      case "learn":
        this.currentVerbIndex = 0;
        this.displayCurrentVerb();
        break;
      case "challenge":
        this.resetChallengeMode();
        break;
      case "practice":
        this.resetPracticeMode();
        break;
    }
  }

  // Reset practice mode
  resetPracticeMode() {
    // Reset game state
    this.gameManager.resetGame();
    this.uiManager.updateScoreDisplay(0, 0);

    // Hide all activities
    document.querySelectorAll(".activity").forEach((activity) => {
      activity.classList.add("hidden");
    });

    // Reset matching pairs
    this.matchingPairs = {};

    // Regenerate all games with fresh data
    this.setupMatchingGame();
    this.setupFillBlankGame();
    this.setupPronunciationGame();

    // Clear any feedback
    const feedbacks = document.querySelectorAll(".feedback");
    feedbacks.forEach((feedback) => {
      feedback.style.display = "none";
      feedback.textContent = "";
    });

    // Reset fill blank game state
    this.currentFillBlankVerb = null;
    this.userAnswer = [];
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  window.app = new VerbLearningApp();
});

// Export for testing
export { VerbLearningApp };
