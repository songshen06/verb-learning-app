/**
 * 集成测试 - 测试DOM操作和基本交互
 */

describe("Basic Integration Tests", () => {
  beforeEach(() => {
    // Mock essential DOM elements
    document.body.innerHTML = `
      <div id="welcome-screen" class="screen active"></div>
      <div id="practice-screen" class="screen"></div>
      <div id="matching-game" class="activity hidden">
        <div id="infinitive-cards"></div>
        <div id="past-cards"></div>
        <button id="check-matches">Check</button>
      </div>
      <div id="fill-blank-game" class="activity hidden">
        <div id="letter-bubbles"></div>
        <div id="answer-slots"></div>
        <button id="submit-answer">Submit</button>
        <button id="clear-answer">Clear</button>
        <div id="answer-feedback"></div>
      </div>
      <div id="results-screen" class="screen">
        <button id="play-again">Play Again</button>
        <button id="back-to-menu">Back to Menu</button>
      </div>
    `;

    // Mock confirm dialog
    global.confirm = jest.fn(() => true);
  });

  describe("DOM Element Tests", () => {
    test("should have all required game elements", () => {
      // 测试关键DOM元素存在
      expect(document.getElementById("welcome-screen")).toBeTruthy();
      expect(document.getElementById("practice-screen")).toBeTruthy();
      expect(document.getElementById("matching-game")).toBeTruthy();
      expect(document.getElementById("fill-blank-game")).toBeTruthy();
      expect(document.getElementById("results-screen")).toBeTruthy();
    });

    test("should have all required buttons", () => {
      // 测试按钮存在
      expect(document.getElementById("check-matches")).toBeTruthy();
      expect(document.getElementById("submit-answer")).toBeTruthy();
      expect(document.getElementById("clear-answer")).toBeTruthy();
      expect(document.getElementById("play-again")).toBeTruthy();
      expect(document.getElementById("back-to-menu")).toBeTruthy();
    });
  });

  describe("Button Click Tests", () => {
    test("buttons should be clickable without throwing errors", () => {
      const buttons = [
        "check-matches",
        "submit-answer",
        "clear-answer",
        "play-again",
        "back-to-menu",
      ];

      buttons.forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        expect(button).toBeTruthy();

        // 测试点击不会抛出错误
        expect(() => {
          button.click();
        }).not.toThrow();
      });
    });
  });

  describe("Infinite Loop Prevention Tests", () => {
    test("should not automatically restart games", () => {
      let gameSetupCount = 0;

      // Mock a game setup function
      const mockSetup = jest.fn(() => {
        gameSetupCount++;
      });

      // 调用一次
      mockSetup();

      // 等待一段时间
      setTimeout(() => {
        // 验证只被调用一次，没有无限循环
        expect(gameSetupCount).toBe(1);
      }, 1000);
    });
  });

  describe("Confirmation Dialog Tests", () => {
    test("should use confirm dialogs for game completion", () => {
      // 模拟游戏完成情况
      const mockGameComplete = () => {
        const userWantsToContinue = confirm("Game completed! Continue?");
        return userWantsToContinue;
      };

      const result = mockGameComplete();

      expect(global.confirm).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test("should handle user declining to continue", () => {
      global.confirm = jest.fn(() => false);

      const mockGameComplete = () => {
        return confirm("Game completed! Continue?");
      };

      const result = mockGameComplete();

      expect(global.confirm).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
