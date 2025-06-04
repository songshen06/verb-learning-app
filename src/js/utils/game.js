// Game utility functions
export class GameManager {
  constructor() {
    this.currentScore = 0;
    this.currentStreak = 0;
    this.highScore = this.loadHighScore();
  }

  updateScore(points) {
    this.currentScore += points;
    this.currentStreak = points > 0 ? this.currentStreak + 1 : 0;

    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore();
    }

    return {
      score: this.currentScore,
      streak: this.currentStreak,
      highScore: this.highScore,
    };
  }

  resetGame() {
    this.currentScore = 0;
    this.currentStreak = 0;
  }

  loadHighScore() {
    return parseInt(localStorage.getItem("highScore")) || 0;
  }

  saveHighScore() {
    localStorage.setItem("highScore", this.highScore.toString());
  }

  shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  generateAchievements(score, totalPossible, streak) {
    const achievements = [];
    const percentage = Math.round((score / totalPossible) * 100);

    if (percentage >= 90) achievements.push("🏆 Perfect Master");
    if (percentage >= 80) achievements.push("⭐ Excellent Student");
    if (percentage >= 70) achievements.push("👍 Great Job");
    if (percentage >= 50) achievements.push("📚 Good Effort");
    if (streak >= 5) achievements.push("🔥 Streak Master");

    return achievements;
  }
}
