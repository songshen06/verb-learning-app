/**
 * Firebase 云端同步管理器
 * 提供用户友好的实时数据同步功能
 */

// Firebase配置 - 请替换为你的真实配置
const firebaseConfig = {
  apiKey: "AIzaSyAgrMKhU3549bOZMJPDOfeg1I_KvxLbxo0",
  authDomain: "verb-learning-app.firebaseapp.com",
  // ❗️ 重要：请从 Firebase 控制台确认你的 databaseURL
  databaseURL:
    "https://verb-learning-app-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "verb-learning-app",
  storageBucket: "verb-learning-app.firebasestorage.app",
  messagingSenderId: "666572916494",
  appId: "1:666572916494:web:0ad9073ee0834a6900b95f",
};

// 配置说明：
// 1. 从 Firebase 控制台复制你的配置信息
// 2. 替换上面的占位符值
// 3. 保存文件即可使用

class FirebaseSyncManager {
  constructor() {
    this.isInitialized = false;
    this.user = null;
    this.database = null;
    this.userRef = null;

    this.initializeFirebase();
    this.setupUI();
  }

  /**
   * 初始化Firebase
   */
  async initializeFirebase() {
    try {
      // 检查Firebase SDK是否已加载
      if (typeof firebase === "undefined") {
        console.warn("Firebase SDK未加载，将使用本地存储");
        return;
      }

      // 检查配置是否已更新
      if (firebaseConfig.apiKey === "your-api-key") {
        console.warn("⚠️ 请先配置 Firebase！");
        console.warn("💡 请在 firebaseSync.js 中替换真实的 Firebase 配置");
        this.showMessage("请先配置 Firebase 连接信息", "warning");
        return;
      }

      // 初始化Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.database = firebase.database();

      // 启用匿名认证
      await this.signInAnonymously();

      // 初始状态设置，此时 user 可能还未完全准备好
      this.updateSyncStatus("连接中...");
    } catch (error) {
      console.error("Firebase初始化失败:", error);
      this.showMessage("云端同步初始化失败，将使用本地存储", "warning");
    }
  }

  /**
   * 匿名登录
   */
  async signInAnonymously() {
    try {
      // 监听认证状态变化 - 这是最可靠的方式
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          console.log("[FirebaseSync] 认证状态改变，用户已登录:", user.uid);
          this.user = user;
          this.userRef = this.database.ref(`users/${user.uid}/scores`);

          if (!this.isInitialized) {
            this.isInitialized = true;
            this.showMessage("云端同步已启用！", "success");

            // 首次连接成功，尝试自动下载一次数据
            await this.downloadFromFirebase();
          }

          this.updateSyncStatus("已连接");

          // 确保自动同步在用户准备好后启动
          if (localStorage.getItem("autoSyncEnabled") !== "false") {
            this.startAutoSync();
          }
        } else {
          console.log("[FirebaseSync] 认证状态改变，用户已登出。");
          this.user = null;
          this.userRef = null;
          this.isInitialized = false; // 需要重新初始化
          this.updateSyncStatus("未连接");
          this.stopAutoSync();
        }
      });

      // 触发匿名登录流程
      if (!firebase.auth().currentUser) {
        console.log("[FirebaseSync] 尝试进行匿名登录...");
        await firebase.auth().signInAnonymously();
      }
    } catch (error) {
      console.error("匿名登录失败:", error);
      throw error;
    }
  }

  /**
   * 设置同步UI
   */
  setupUI() {
    // 在设置页面添加Firebase同步选项
    const settingsContent = document.querySelector(".settings-content");
    if (!settingsContent) return;

    const syncSection = document.createElement("div");
    syncSection.className = "setting-group";
    syncSection.innerHTML = `
            <h3>☁️ 云端同步 (Firebase)</h3>
            <div class="firebase-status">
                <p>状态: <span id="firebase-status">初始化中...</span></p>
                <p class="sync-info">数据将自动在所有设备间同步</p>
            </div>
            
            <div class="firebase-actions">
                <button class="btn btn--primary" id="manual-upload" disabled>
                    ⬆️ 立即上传
                </button>
                <button class="btn btn--primary" id="manual-download" disabled>
                    ⬇️ 立即下载
                </button>
                <div class="auto-sync-toggle">
                    <label class="form-label">
                        <input type="checkbox" id="auto-sync-enabled" checked> 
                        启用自动同步
                    </label>
                </div>
            </div>

            <div class="sync-info-details">
                <details>
                    <summary>同步详情</summary>
                    <div class="sync-details">
                        <p>设备ID: <span id="device-id">--</span></p>
                        <p>上次同步: <span id="last-sync">从未</span></p>
                        <p>同步状态: <span id="sync-detailed-status">等待中</span></p>
                    </div>
                </details>
            </div>
        `;

    // 插入到合适位置
    const accountSection = settingsContent.querySelector("h3");
    if (accountSection) {
      accountSection.parentElement.parentNode.insertBefore(
        syncSection,
        accountSection.parentElement
      );
    } else {
      settingsContent.appendChild(syncSection);
    }

    this.bindEvents();
    this.updateSyncStatus("初始化中...");
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 手动上传
    document.getElementById("manual-upload")?.addEventListener("click", () => {
      this.uploadToFirebase();
    });

    // 手动下载
    document
      .getElementById("manual-download")
      ?.addEventListener("click", () => {
        this.downloadFromFirebase();
      });

    // 自动同步开关
    document
      .getElementById("auto-sync-enabled")
      ?.addEventListener("change", (e) => {
        this.setAutoSync(e.target.checked);
      });
  }

  /**
   * 上传数据到Firebase
   */
  async uploadToFirebase() {
    if (!this.isInitialized || !this.userRef) {
      this.showMessage("云端同步未准备就绪", "error");
      return;
    }

    try {
      this.updateSyncStatus("上传中...");

      const scoresToSync = window.scoreManager.scores;
      if (!scoresToSync || Object.keys(scoresToSync).length === 0) {
        this.showMessage("没有本地成绩可上传", "info");
        this.updateSyncStatus("已连接");
        return;
      }

      const syncData = {
        scores: scoresToSync,
        metadata: {
          deviceId: this.getDeviceId(),
          lastUpdate: firebase.database.ServerValue.TIMESTAMP,
          version: "1.0",
        },
      };

      await this.userRef.set(syncData);

      this.updateSyncStatus("已连接");
      this.updateLastSync();
      this.showMessage("数据已上传到云端！", "success");
    } catch (error) {
      console.error("上传失败:", error);
      this.updateSyncStatus("上传失败");
      this.showMessage(`上传失败: ${error.message}`, "error");
    }
  }

  /**
   * 从Firebase下载数据
   */
  async downloadFromFirebase() {
    if (!this.isInitialized || !this.userRef) {
      this.showMessage("云端同步未准备就绪", "error");
      return;
    }

    try {
      this.updateSyncStatus("下载中...");

      const snapshot = await this.userRef.once("value");
      const data = snapshot.val();

      if (data && data.scores) {
        // 智能合并数据
        const mergedScores = this.mergeScoreData(
          window.scoreManager.scores,
          data.scores
        );

        window.scoreManager.scores = mergedScores;
        window.scoreManager.saveScores();

        this.updateSyncStatus("已连接");
        this.updateLastSync();
        this.showMessage("数据已从云端同步！", "success");

        // 刷新UI显示
        if (window.scoreUI) {
          window.scoreUI.updateScoresDisplay();
        }
      } else {
        this.showMessage("云端暂无数据", "info");
      }
    } catch (error) {
      console.error("下载失败:", error);
      this.updateSyncStatus("下载失败");
      this.showMessage(`下载失败: ${error.message}`, "error");
    }
  }

  /**
   * 智能合并数据
   */
  mergeScoreData(localScores, remoteScores) {
    const merged = { ...localScores };

    for (const studentId in remoteScores) {
      const remoteStudent = remoteScores[studentId];
      const localStudent = localScores[studentId];

      if (!localStudent) {
        // 远程学生在本地不存在，直接添加
        merged[studentId] = remoteStudent;
      } else {
        // 学生存在，合并数据
        const localTime = new Date(localStudent.profile.lastActive);
        const remoteTime = new Date(remoteStudent.profile.lastActive);

        // 保留更新的数据
        merged[studentId] =
          remoteTime > localTime ? remoteStudent : localStudent;

        // 合并活动数据
        for (const activity in remoteStudent.activities) {
          if (!merged[studentId].activities[activity]) {
            merged[studentId].activities[activity] =
              remoteStudent.activities[activity];
          } else {
            // 合并活动会话
            const localSessions =
              merged[studentId].activities[activity].sessions || [];
            const remoteSessions =
              remoteStudent.activities[activity].sessions || [];

            // 合并并去重会话
            const allSessions = [...localSessions, ...remoteSessions];
            const uniqueSessions = allSessions.filter(
              (session, index, self) =>
                index ===
                self.findIndex((s) => s.timestamp === session.timestamp)
            );

            // 重新计算统计数据
            merged[studentId].activities[activity] =
              this.recalculateActivityStats(uniqueSessions);
          }
        }
      }
    }

    return merged;
  }

  /**
   * 重新计算活动统计
   */
  recalculateActivityStats(sessions) {
    const totalSessions = sessions.length;
    const totalScore = sessions.reduce(
      (sum, session) => sum + session.score,
      0
    );
    const bestScore = Math.max(...sessions.map((s) => s.score));
    const averageScore =
      totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0;

    return {
      totalSessions,
      bestScore,
      averageScore,
      totalScore,
      sessions: sessions.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      ),
    };
  }

  /**
   * 启用/禁用自动同步
   */
  setAutoSync(enabled) {
    localStorage.setItem("autoSyncEnabled", enabled ? "true" : "false");

    if (enabled && this.isInitialized && this.user) {
      this.startAutoSync();
      this.showMessage("自动同步已启用", "success");
    } else {
      this.stopAutoSync();
      this.showMessage("自动同步已禁用", "info");
    }
  }

  /**
   * 开始自动同步
   */
  startAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    // 监听数据变化
    if (this.userRef) {
      this.userRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (
          data &&
          data.metadata &&
          data.metadata.deviceId !== this.getDeviceId()
        ) {
          // 其他设备更新了数据，自动同步
          this.downloadFromFirebase();
        }
      });
    }

    // 定期检查本地数据变化并上传
    this.autoSyncInterval = setInterval(() => {
      if (this.hasLocalChanges()) {
        this.uploadToFirebase();
      }
    }, 30000); // 30秒检查一次
  }

  /**
   * 停止自动同步
   */
  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    if (this.userRef) {
      this.userRef.off("value");
    }
  }

  /**
   * 检查是否有本地变化
   */
  hasLocalChanges() {
    const lastSync = localStorage.getItem("lastSyncTime");
    const lastLocalUpdate = localStorage.getItem("lastLocalUpdate");

    return (
      !lastSync ||
      (lastLocalUpdate && new Date(lastLocalUpdate) > new Date(lastSync))
    );
  }

  /**
   * 更新同步状态显示
   */
  updateSyncStatus(status) {
    const statusElement = document.getElementById("firebase-status");
    const uploadBtn = document.getElementById("manual-upload");
    const downloadBtn = document.getElementById("manual-download");

    if (statusElement) {
      statusElement.textContent = status;

      // 根据状态设置颜色
      statusElement.style.color = status.includes("已连接")
        ? "#4CAF50"
        : status.includes("失败")
        ? "#f44336"
        : status.includes("中...")
        ? "#2196F3"
        : "#666";
    }

    // 启用/禁用按钮
    const isReady = this.isInitialized && this.user;
    if (uploadBtn) uploadBtn.disabled = !isReady;
    if (downloadBtn) downloadBtn.disabled = !isReady;

    // 更新详细状态
    const detailedStatus = document.getElementById("sync-detailed-status");
    if (detailedStatus) {
      detailedStatus.textContent = status;
    }
  }

  /**
   * 更新最后同步时间
   */
  updateLastSync() {
    const now = new Date().toISOString();
    localStorage.setItem("lastSyncTime", now);

    const lastSyncElement = document.getElementById("last-sync");
    if (lastSyncElement) {
      lastSyncElement.textContent = new Date().toLocaleString("zh-CN");
    }
  }

  /**
   * 获取设备ID
   */
  getDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId =
        "device_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("deviceId", deviceId);

      const deviceElement = document.getElementById("device-id");
      if (deviceElement) {
        deviceElement.textContent = deviceId.substr(0, 12) + "...";
      }
    }
    return deviceId;
  }

  /**
   * 显示消息
   */
  showMessage(message, type = "info") {
    if (window.scoreUI && window.scoreUI.showMessage) {
      window.scoreUI.showMessage(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
   * 当有新成绩记录时调用
   */
  onScoreRecorded() {
    localStorage.setItem("lastLocalUpdate", new Date().toISOString());

    // 如果启用了自动同步，立即上传
    const autoSyncEnabled = localStorage.getItem("autoSyncEnabled") === "true";
    if (autoSyncEnabled && this.isInitialized) {
      setTimeout(() => this.uploadToFirebase(), 1000); // 1秒后上传
    }
  }
}

// 创建全局实例
window.firebaseSync = new FirebaseSyncManager();
