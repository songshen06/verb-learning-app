/**
 * 成绩管理器 - 负责学生成绩的记录和同步
 */
class ScoreManager {
  constructor() {
    this.scores = this.loadScores();
    this.currentStudent = this.getCurrentStudent();
  }

  /**
   * 从本地存储加载成绩
   */
  loadScores() {
    try {
      const saved = localStorage.getItem("verbLearningScores");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading scores:", error);
      return {};
    }
  }

  /**
   * 保存成绩到本地存储
   */
  saveScores() {
    try {
      localStorage.setItem("verbLearningScores", JSON.stringify(this.scores));
    } catch (error) {
      console.error("Error saving scores:", error);
    }
  }

  /**
   * 获取当前学生ID
   */
  getCurrentStudent() {
    const saved = localStorage.getItem("currentStudent");
    if (!saved) {
      // 如果没有保存的学生ID，返回null等待用户登录
      return null;
    }
    return saved;
  }

  /**
   * 生成学生ID（作为备用方案）
   */
  generateStudentId() {
    return (
      "student_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * 设置当前学生ID
   */
  setCurrentStudent(studentId) {
    if (!studentId || studentId.trim() === "") {
      throw new Error("学生ID不能为空");
    }

    // 清理和验证学生ID
    const cleanId = this.sanitizeStudentId(studentId.trim());
    this.currentStudent = cleanId;
    localStorage.setItem("currentStudent", cleanId);

    // 初始化学生档案（如果不存在）
    this.initializeStudentProfile(cleanId);
  }

  /**
   * 清理学生ID（移除特殊字符，保留中英文和数字）
   */
  sanitizeStudentId(studentId) {
    // 允许中文、英文字母、数字、下划线和连字符
    return studentId.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]/g, "");
  }

  /**
   * 初始化学生档案
   */
  initializeStudentProfile(studentId) {
    if (!this.scores[studentId]) {
      this.scores[studentId] = {
        profile: {
          id: studentId,
          displayName: studentId,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
        activities: {},
      };
      this.saveScores();
    }
  }

  /**
   * 检查是否有学生登录
   */
  isStudentLoggedIn() {
    return this.currentStudent !== null && this.currentStudent !== undefined;
  }

  /**
   * 学生登出
   */
  logoutStudent() {
    this.currentStudent = null;
    localStorage.removeItem("currentStudent");
  }

  /**
   * 获取所有学生ID列表
   */
  getAllStudentIds() {
    return Object.keys(this.scores);
  }

  /**
   * 切换到指定学生
   */
  switchToStudent(studentId) {
    if (this.scores[studentId]) {
      this.setCurrentStudent(studentId);
      return true;
    }
    return false;
  }

  /**
   * 记录练习成绩
   */
  recordScore(activity, score, details = {}) {
    const studentId = this.currentStudent;

    if (!studentId) {
      console.warn("没有登录的学生，无法记录成绩");
      return null;
    }

    if (!this.scores[studentId]) {
      this.scores[studentId] = {
        profile: {
          id: studentId,
          displayName: studentId,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
        activities: {},
      };
    }

    if (!this.scores[studentId].activities[activity]) {
      this.scores[studentId].activities[activity] = {
        totalSessions: 0,
        bestScore: 0,
        averageScore: 0,
        totalScore: 0,
        sessions: [],
      };
    }

    const activityData = this.scores[studentId].activities[activity];
    const sessionData = {
      score: score,
      timestamp: new Date().toISOString(),
      details: details,
    };

    // 更新统计数据
    activityData.sessions.push(sessionData);
    activityData.totalSessions++;
    activityData.totalScore += score;
    activityData.averageScore = Math.round(
      activityData.totalScore / activityData.totalSessions
    );
    activityData.bestScore = Math.max(activityData.bestScore, score);

    // 更新学生档案
    this.scores[studentId].profile.lastActive = new Date().toISOString();

    this.saveScores();

    // 触发 Firebase 同步
    if (window.firebaseSync) {
      window.firebaseSync.onScoreRecorded();
    }

    return sessionData;
  }

  /**
   * 获取学生的所有成绩
   */
  getStudentScores(studentId = this.currentStudent) {
    return this.scores[studentId] || null;
  }

  /**
   * 获取学生的特定活动成绩
   */
  getActivityScores(activity, studentId = this.currentStudent) {
    const studentScores = this.getStudentScores(studentId);
    return studentScores ? studentScores.activities[activity] || null : null;
  }

  /**
   * 获取学生总体统计
   */
  getOverallStats(studentId = this.currentStudent) {
    const studentScores = this.getStudentScores(studentId);
    if (!studentScores) return null;

    const activities = studentScores.activities;
    let totalSessions = 0;
    let totalScore = 0;
    let bestOverallScore = 0;

    for (const activity in activities) {
      const activityData = activities[activity];
      totalSessions += activityData.totalSessions;
      totalScore += activityData.totalScore;
      bestOverallScore = Math.max(bestOverallScore, activityData.bestScore);
    }

    return {
      totalSessions,
      averageScore:
        totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0,
      bestScore: bestOverallScore,
      activitiesCompleted: Object.keys(activities).length,
      profile: studentScores.profile,
    };
  }

  /**
   * 导出成绩数据
   */
  exportScores() {
    const data = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      scores: this.scores,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verb-learning-scores-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 导入成绩数据
   */
  async importScores(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.scores && typeof data.scores === "object") {
        // 合并导入的数据
        this.scores = { ...this.scores, ...data.scores };
        this.saveScores();
        return { success: true, message: "成绩导入成功！" };
      } else {
        return { success: false, message: "无效的成绩文件格式" };
      }
    } catch (error) {
      console.error("Import error:", error);
      return { success: false, message: "导入失败：" + error.message };
    }
  }

  /**
   * 清除所有成绩数据
   */
  clearAllScores() {
    if (confirm("确定要清除所有成绩数据吗？此操作不可撤销。")) {
      this.scores = {};
      this.saveScores();
      return true;
    }
    return false;
  }

  /**
   * 获取学习进度建议
   */
  getLearningRecommendations(studentId = this.currentStudent) {
    const stats = this.getOverallStats(studentId);
    if (!stats) return [];

    const recommendations = [];

    if (stats.totalSessions < 5) {
      recommendations.push("继续练习基础动词，建议每天练习10-15分钟");
    }

    if (stats.averageScore < 60) {
      recommendations.push("重点练习错误率高的动词，可以使用学习模式复习");
    } else if (stats.averageScore > 80) {
      recommendations.push("表现优秀！可以尝试挑战模式提高难度");
    }

    if (stats.activitiesCompleted < 3) {
      recommendations.push("尝试不同的练习模式，全面提升技能");
    }

    return recommendations;
  }
}

// 创建全局实例
window.scoreManager = new ScoreManager();
