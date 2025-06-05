import { GameManager } from "../src/js/utils/game";

describe("GameManager", () => {
  let gameManager;

  beforeEach(() => {
    gameManager = new GameManager();
    localStorage.clear();
  });

  test("should initialize with zero score and streak", () => {
    expect(gameManager.currentScore).toBe(0);
    expect(gameManager.currentStreak).toBe(0);
  });

  test("should update score correctly", () => {
    const result = gameManager.updateScore(10);
    expect(result.score).toBe(10);
    expect(result.streak).toBe(1);
  });

  test("should reset streak on incorrect answer", () => {
    gameManager.updateScore(10); // Correct answer
    const result = gameManager.updateScore(-5); // Incorrect answer
    expect(result.streak).toBe(0);
  });

  test("should save and load high score", () => {
    gameManager.updateScore(100);
    const newGameManager = new GameManager();
    expect(newGameManager.highScore).toBe(100);
  });

  test("should generate achievements based on score and streak", () => {
    const achievements = gameManager.generateAchievements(90, 100, 5);
    expect(achievements).toContain("🏆 Perfect Master");
    expect(achievements).toContain("🔥 Streak Master");
  });
});
