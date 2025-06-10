/**
 * 成绩UI管理器 - 负责成绩统计页面的显示和交互
 */
class ScoreUI {
  constructor() {
    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 查看成绩按钮
    document.getElementById("view-scores")?.addEventListener("click", () => {
      this.showScoresScreen();
    });

    // 导出成绩按钮
    document.getElementById("export-scores")?.addEventListener("click", () => {
      this.exportScores();
    });

    // 导入成绩按钮
    document.getElementById("import-scores")?.addEventListener("click", () => {
      document.getElementById("score-file-input").click();
    });

    // 文件输入处理
    document
      .getElementById("score-file-input")
      ?.addEventListener("change", (e) => {
        this.handleScoreFileImport(e);
      });

    // 返回设置按钮
    document.getElementById("scores-back")?.addEventListener("click", () => {
      this.hideScoresScreen();
    });

    // 注销按钮
    document.getElementById("logout-btn")?.addEventListener("click", () => {
      this.handleLogout();
    });

    // 监听页面切换，更新设置页面中的学生信息
    document.getElementById("settings-btn")?.addEventListener("click", () => {
      this.updateSettingsStudentInfo();
    });
  }

  /**
   * 显示成绩统计页面
   */
  showScoresScreen() {
    // 隐藏设置页面
    document.getElementById("settings-screen").classList.remove("active");

    // 显示成绩页面
    document.getElementById("scores-screen").classList.add("active");

    // 更新成绩数据
    this.updateScoresDisplay();
  }

  /**
   * 隐藏成绩统计页面
   */
  hideScoresScreen() {
    // 隐藏成绩页面
    document.getElementById("scores-screen").classList.remove("active");

    // 显示设置页面
    document.getElementById("settings-screen").classList.add("active");
  }

  /**
   * 更新成绩显示
   */
  updateScoresDisplay() {
    const stats = window.scoreManager.getOverallStats();

    if (!stats) {
      this.showEmptyState();
      return;
    }

    // 更新总体统计
    this.updateOverallStats(stats);

    // 更新分项成绩
    this.updateActivityStats();

    // 更新学习建议
    this.updateRecommendations();

    // 更新最近练习
    this.updateRecentSessions();
  }

  /**
   * 更新总体统计数据
   */
  updateOverallStats(stats) {
    document.getElementById("total-sessions").textContent = stats.totalSessions;
    document.getElementById("average-score").textContent = stats.averageScore;
    document.getElementById("best-score").textContent = stats.bestScore;
    document.getElementById("activities-completed").textContent =
      stats.activitiesCompleted;
  }

  /**
   * 更新分项成绩
   */
  updateActivityStats() {
    const studentScores = window.scoreManager.getStudentScores();
    const container = document.getElementById("activity-stats-list");

    if (!studentScores || !studentScores.activities) {
      container.innerHTML = '<div class="empty-state">暂无练习记录</div>';
      return;
    }

    const activities = studentScores.activities;
    const activityNames = {
      matching: "🎯 配对游戏",
      "fill-blank": "📝 填空练习",
      "letter-choice": "🔤 字母选择",
      pronunciation: "🎤 发音练习",
    };

    container.innerHTML = "";

    for (const [activityKey, activityData] of Object.entries(activities)) {
      const activityElement = document.createElement("div");
      activityElement.className = "activity-item";

      activityElement.innerHTML = `
                <div class="activity-name">${
                  activityNames[activityKey] || activityKey
                }</div>
                <div class="activity-stats-row">
                    <div class="activity-stat">
                        <span class="activity-stat-value">${
                          activityData.totalSessions
                        }</span>
                        <span class="activity-stat-label">练习次数</span>
                    </div>
                    <div class="activity-stat">
                        <span class="activity-stat-value">${
                          activityData.averageScore
                        }</span>
                        <span class="activity-stat-label">平均分数</span>
                    </div>
                    <div class="activity-stat">
                        <span class="activity-stat-value">${
                          activityData.bestScore
                        }</span>
                        <span class="activity-stat-label">最高分数</span>
                    </div>
                </div>
            `;

      container.appendChild(activityElement);
    }
  }

  /**
   * 更新学习建议
   */
  updateRecommendations() {
    const recommendations = window.scoreManager.getLearningRecommendations();
    const container = document.getElementById("recommendations-list");

    if (!recommendations || recommendations.length === 0) {
      container.innerHTML =
        '<div class="empty-state">继续努力学习，加油！🌟</div>';
      return;
    }

    container.innerHTML = "";

    recommendations.forEach((recommendation) => {
      const recommendationElement = document.createElement("div");
      recommendationElement.className = "recommendation-item";
      recommendationElement.textContent = recommendation;
      container.appendChild(recommendationElement);
    });
  }

  /**
   * 更新最近练习记录
   */
  updateRecentSessions() {
    const studentScores = window.scoreManager.getStudentScores();
    const container = document.getElementById("recent-sessions-list");

    if (!studentScores || !studentScores.activities) {
      container.innerHTML = '<div class="empty-state">暂无练习记录</div>';
      return;
    }

    // 收集所有练习记录
    const allSessions = [];
    const activityNames = {
      matching: "配对游戏",
      "fill-blank": "填空练习",
      "letter-choice": "字母选择",
      pronunciation: "发音练习",
    };

    for (const [activityKey, activityData] of Object.entries(
      studentScores.activities
    )) {
      activityData.sessions.forEach((session) => {
        allSessions.push({
          ...session,
          activity: activityNames[activityKey] || activityKey,
        });
      });
    }

    // 按时间排序，最新的在前
    allSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 只显示最近10次
    const recentSessions = allSessions.slice(0, 10);

    if (recentSessions.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无练习记录</div>';
      return;
    }

    container.innerHTML = "";

    recentSessions.forEach((session) => {
      const sessionElement = document.createElement("div");
      sessionElement.className = "session-item";

      const timeStr = this.formatTimeAgo(session.timestamp);

      sessionElement.innerHTML = `
                <div class="session-info">
                    <div class="session-activity">${session.activity}</div>
                    <div class="session-time">${timeStr}</div>
                </div>
                <div class="session-score">${session.score}</div>
            `;

      container.appendChild(sessionElement);
    });
  }

  /**
   * 格式化时间显示
   */
  formatTimeAgo(timestamp) {
    const now = new Date();
    const sessionTime = new Date(timestamp);
    const diffMs = now - sessionTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "刚刚";
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return sessionTime.toLocaleDateString("zh-CN");
    }
  }

  /**
   * 显示空状态
   */
  showEmptyState() {
    const container = document.querySelector(".stats-container");
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-text">还没有练习记录</div>
                <div class="empty-state-subtitle">开始练习来记录你的学习进度吧！</div>
            </div>
        `;
  }

  /**
   * 导出成绩
   */
  exportScores() {
    try {
      window.scoreManager.exportScores();
      this.showMessage("成绩导出成功！", "success");
    } catch (error) {
      console.error("Export error:", error);
      this.showMessage("导出失败：" + error.message, "error");
    }
  }

  /**
   * 处理成绩文件导入
   */
  async handleScoreFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await window.scoreManager.importScores(file);
      if (result.success) {
        this.showMessage(result.message, "success");
        this.updateScoresDisplay();
      } else {
        this.showMessage(result.message, "error");
      }
    } catch (error) {
      console.error("Import error:", error);
      this.showMessage("导入失败：" + error.message, "error");
    }

    // 清空文件输入
    event.target.value = "";
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = "info") {
    // 创建消息元素
    const messageElement = document.createElement("div");
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;

    // 添加样式
    Object.assign(messageElement.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 16px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "500",
      zIndex: "10000",
      transition: "opacity 0.3s ease",
    });

    // 根据类型设置颜色
    const colors = {
      success: "#4CAF50",
      error: "#f44336",
      info: "#2196F3",
    };
    messageElement.style.backgroundColor = colors[type] || colors.info;

    // 添加到页面
    document.body.appendChild(messageElement);

    // 3秒后自动移除
    setTimeout(() => {
      messageElement.style.opacity = "0";
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 3000);
  }

  /**
   * 处理注销
   */
  handleLogout() {
    if (confirm("确定要切换学生账户吗？")) {
      window.loginManager.showLoginScreen();
    }
  }

  /**
   * 更新设置页面中的学生信息
   */
  updateSettingsStudentInfo() {
    const settingsStudentElement = document.getElementById(
      "settings-current-student"
    );
    if (settingsStudentElement && window.scoreManager.isStudentLoggedIn()) {
      settingsStudentElement.textContent = window.scoreManager.currentStudent;
    }
  }
}

// 创建全局实例
window.scoreUI = new ScoreUI();
