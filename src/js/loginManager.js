/**
 * 登录管理器 - 处理学生登录和身份管理
 */
class LoginManager {
  constructor() {
    this.initializeEventListeners();
    this.checkLoginStatus();
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 登录按钮
    document.getElementById("login-btn")?.addEventListener("click", () => {
      this.handleLogin();
    });

    // 切换学生按钮
    document
      .getElementById("switch-student-btn")
      ?.addEventListener("click", () => {
        this.showLoginScreen();
      });

    // 输入框回车键登录
    document
      .getElementById("student-id-input")
      ?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleLogin();
        }
      });

    // 输入框变化时更新界面
    document
      .getElementById("student-id-input")
      ?.addEventListener("input", () => {
        this.updateExistingStudentsList();
      });
  }

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    if (window.scoreManager.isStudentLoggedIn()) {
      this.showWelcomeScreen();
      this.updateCurrentStudentDisplay();
    } else {
      this.showLoginScreen();
    }
    this.updateExistingStudentsList();
  }

  /**
   * 处理登录
   */
  handleLogin() {
    const studentIdInput = document.getElementById("student-id-input");
    const studentId = studentIdInput.value.trim();

    if (!studentId) {
      this.showMessage("请输入学生ID", "error");
      studentIdInput.focus();
      return;
    }

    try {
      // 设置当前学生
      window.scoreManager.setCurrentStudent(studentId);

      // 更新界面
      this.showWelcomeScreen();
      this.updateCurrentStudentDisplay();

      // 清空输入框
      studentIdInput.value = "";

      // 显示欢迎消息
      const isNewStudent = !window.scoreManager
        .getAllStudentIds()
        .includes(studentId);
      const message = isNewStudent
        ? `欢迎新同学 ${studentId}！开始你的学习之旅吧 🎉`
        : `欢迎回来，${studentId}！继续你的学习进度 📚`;

      this.showMessage(message, "success");
    } catch (error) {
      this.showMessage(error.message, "error");
    }
  }

  /**
   * 显示登录页面
   */
  showLoginScreen() {
    // 隐藏所有其他页面
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // 显示登录页面
    document.getElementById("login-screen").classList.add("active");

    // 聚焦到输入框
    setTimeout(() => {
      document.getElementById("student-id-input")?.focus();
    }, 100);

    // 更新已有学生列表
    this.updateExistingStudentsList();
  }

  /**
   * 显示欢迎页面
   */
  showWelcomeScreen() {
    // 隐藏所有其他页面
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // 显示欢迎页面
    document.getElementById("welcome-screen").classList.add("active");
  }

  /**
   * 更新当前学生显示
   */
  updateCurrentStudentDisplay() {
    const currentStudentElement = document.getElementById(
      "current-student-display"
    );
    if (currentStudentElement && window.scoreManager.isStudentLoggedIn()) {
      currentStudentElement.textContent = window.scoreManager.currentStudent;
    }
  }

  /**
   * 更新已有学生列表
   */
  updateExistingStudentsList() {
    const existingStudents = window.scoreManager.getAllStudentIds();
    const container = document.getElementById("existing-students");
    const list = document.getElementById("student-list");

    if (existingStudents.length > 0) {
      container.style.display = "block";
      list.innerHTML = "";

      existingStudents.forEach((studentId) => {
        const studentElement = document.createElement("div");
        studentElement.className = "student-item";
        studentElement.textContent = studentId;

        // 添加点击事件
        studentElement.addEventListener("click", () => {
          this.selectExistingStudent(studentId);
        });

        list.appendChild(studentElement);
      });
    } else {
      container.style.display = "none";
    }
  }

  /**
   * 选择已有学生
   */
  selectExistingStudent(studentId) {
    document.getElementById("student-id-input").value = studentId;
    this.handleLogin();
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = "info") {
    // 移除已有的消息
    const existingMessage = document.querySelector(".login-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // 创建消息元素
    const messageElement = document.createElement("div");
    messageElement.className = `login-message login-message-${type}`;
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
   * 获取学生档案摘要
   */
  getStudentSummary(studentId) {
    const stats = window.scoreManager.getOverallStats(studentId);
    if (!stats) {
      return "新学生";
    }

    return `练习 ${stats.totalSessions} 次，平均分 ${stats.averageScore}`;
  }

  /**
   * 注销当前学生
   */
  logout() {
    window.scoreManager.logoutStudent();
    this.showLoginScreen();
    this.showMessage("已成功注销", "info");
  }
}

// 创建全局实例
window.loginManager = new LoginManager();
