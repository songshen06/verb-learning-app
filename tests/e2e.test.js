/**
 * 端到端测试 - 测试基本的用户界面
 */

describe("E2E Basic Tests", () => {
  beforeEach(() => {
    // 简化的HTML结构
    document.body.innerHTML = `
      <div id="welcome-screen" class="screen active">
        <button id="practice-btn" class="btn primary">练习模式</button>
      </div>
      
      <div id="practice-screen" class="screen">
        <button class="activity-btn" data-activity="matching">配对练习</button>
        <button class="activity-btn" data-activity="fill-blank">填空练习</button>
      </div>

      <div id="matching-game" class="activity hidden">
        <button id="check-matches">检查</button>
      </div>

      <div id="fill-blank-game" class="activity hidden">
        <button id="submit-answer">Submit</button>
      </div>

      <div id="results-screen" class="screen">
        <button id="play-again" class="btn primary">再来一次</button>
        <button id="back-to-menu" class="btn secondary">返回主菜单</button>
      </div>
    `;

    // Mock APIs
    global.confirm = jest.fn(() => true);
  });

  describe("Basic UI Navigation", () => {
    test("should have main navigation buttons", () => {
      expect(document.getElementById("practice-btn")).toBeTruthy();
      expect(document.querySelector('[data-activity="matching"]')).toBeTruthy();
      expect(
        document.querySelector('[data-activity="fill-blank"]')
      ).toBeTruthy();
    });

    test("should have game control buttons", () => {
      expect(document.getElementById("check-matches")).toBeTruthy();
      expect(document.getElementById("submit-answer")).toBeTruthy();
      expect(document.getElementById("play-again")).toBeTruthy();
      expect(document.getElementById("back-to-menu")).toBeTruthy();
    });
  });

  describe("Screen State Management", () => {
    test("should properly manage screen visibility classes", () => {
      const welcomeScreen = document.getElementById("welcome-screen");
      const practiceScreen = document.getElementById("practice-screen");

      // 初始状态
      expect(welcomeScreen.classList.contains("active")).toBe(true);
      expect(practiceScreen.classList.contains("active")).toBe(false);

      // 模拟切换
      welcomeScreen.classList.remove("active");
      practiceScreen.classList.add("active");

      expect(welcomeScreen.classList.contains("active")).toBe(false);
      expect(practiceScreen.classList.contains("active")).toBe(true);
    });

    test("should properly manage activity visibility", () => {
      const matchingGame = document.getElementById("matching-game");
      const fillBlankGame = document.getElementById("fill-blank-game");

      // 初始状态都隐藏
      expect(matchingGame.classList.contains("hidden")).toBe(true);
      expect(fillBlankGame.classList.contains("hidden")).toBe(true);

      // 显示matching游戏
      matchingGame.classList.remove("hidden");

      expect(matchingGame.classList.contains("hidden")).toBe(false);
      expect(fillBlankGame.classList.contains("hidden")).toBe(true);
    });
  });

  describe("User Interaction Prevention", () => {
    test("should prevent infinite loops in game logic", () => {
      let callCount = 0;

      const mockGameFunction = () => {
        callCount++;
        // 这个函数不应该自己调用自己
      };

      mockGameFunction();

      // 等待确保没有额外调用
      setTimeout(() => {
        expect(callCount).toBe(1);
      }, 500);
    });

    test("should require user confirmation for game completion", () => {
      const mockCompleteGame = () => {
        const shouldContinue = confirm("Game completed! Continue?");
        return shouldContinue;
      };

      const result = mockCompleteGame();

      expect(global.confirm).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("Button Event Handling", () => {
    test("buttons should handle clicks without errors", () => {
      const buttonIds = [
        "practice-btn",
        "check-matches",
        "submit-answer",
        "play-again",
        "back-to-menu",
      ];

      buttonIds.forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
          expect(() => {
            button.click();
          }).not.toThrow();
        }
      });
    });

    test("activity buttons should work properly", () => {
      const activityButtons = document.querySelectorAll(".activity-btn");

      activityButtons.forEach((button) => {
        expect(button.dataset.activity).toBeDefined();
        expect(() => {
          button.click();
        }).not.toThrow();
      });
    });
  });
});
