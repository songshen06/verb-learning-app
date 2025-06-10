# 学生登录和成绩记录使用指南

## 功能概述

现在你的应用支持学生自定义 ID 登录，每个学生的学习进度都会被单独记录和跟踪。

## 主要功能

### 1. 学生登录系统

- 🎓 学生可以输入自己的姓名或学号
- 🔄 支持切换不同学生账户
- 📝 自动清理和验证输入的 ID
- 💾 记住上次登录的学生

### 2. 个性化成绩记录

- 📊 每个学生独立的成绩档案
- 📈 详细的统计数据和学习建议
- 🎯 分项练习成绩跟踪
- 📅 时间轴记录学习历史

## 使用流程

### 第一次使用

1. 打开应用，自动显示登录页面
2. 输入你的姓名或学号（例如：张三、Student001）
3. 点击"开始学习"按钮
4. 系统会创建你的专属学习档案

### 返回用户

1. 在登录页面可以看到"选择已有档案"
2. 点击你的姓名快速登录
3. 或者重新输入 ID 登录

### 切换学生

1. 在主页面点击"切换学生"按钮
2. 或者在设置页面点击"切换/注销学生"
3. 选择其他学生或创建新档案

## 在游戏代码中记录成绩

### 基本用法

```javascript
// 检查学生是否已登录
if (!window.scoreManager.isStudentLoggedIn()) {
  console.warn("学生未登录，无法记录成绩");
  return;
}

// 记录游戏成绩
window.scoreManager.recordScore("matching", finalScore, {
  correctAnswers: 8,
  totalQuestions: 10,
  accuracy: 80,
  timeSpent: 120, // 秒
  difficulty: "medium",
});
```

### 不同游戏的集成示例

#### 配对游戏

```javascript
function endMatchingGame() {
  const finalScore = calculateScore();
  const details = {
    correctAnswers: correctMatches,
    totalQuestions: totalPairs,
    accuracy: Math.round((correctMatches / totalPairs) * 100),
    timeSpent: gameTime,
    attempts: totalAttempts,
  };

  // 记录成绩
  const result = window.scoreManager.recordScore(
    "matching",
    finalScore,
    details
  );

  if (result) {
    showGameResults(finalScore, result);
  } else {
    // 学生未登录，提示登录
    alert("请先登录学生账户来记录成绩");
  }
}
```

#### 填空练习

```javascript
function submitFillBlankAnswer() {
  if (isCorrect) {
    score += 10;
    correctCount++;
  }

  totalAttempts++;

  // 如果是最后一题，记录总成绩
  if (currentQuestion >= totalQuestions) {
    window.scoreManager.recordScore("fill-blank", score, {
      correctAnswers: correctCount,
      totalQuestions: totalQuestions,
      accuracy: Math.round((correctCount / totalQuestions) * 100),
      averageTimePerQuestion: totalTime / totalQuestions,
    });
  }
}
```

#### 发音练习

```javascript
function evaluatePronunciation(accuracy) {
  const score = Math.round(accuracy * 100);

  window.scoreManager.recordScore("pronunciation", score, {
    targetWord: currentWord,
    accuracy: accuracy,
    attempts: pronunciationAttempts,
    deviceUsed: "microphone",
  });
}
```

## 成绩查看和管理

### 查看个人统计

- 进入设置页面
- 点击"查看成绩统计"
- 查看总体表现和分项成绩

### 导出成绩

- 在设置页面点击"导出成绩"
- 会下载包含所有学生数据的 JSON 文件
- 可以用于备份或分享给老师

### 导入成绩

- 点击"导入成绩"选择之前导出的文件
- 系统会合并数据，不会覆盖现有成绩

## 数据格式

### 成绩记录结构

```json
{
  "张三": {
    "profile": {
      "id": "张三",
      "displayName": "张三",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "lastActive": "2024-01-01T11:30:00.000Z"
    },
    "activities": {
      "matching": {
        "totalSessions": 5,
        "bestScore": 95,
        "averageScore": 78,
        "totalScore": 390,
        "sessions": [
          {
            "score": 80,
            "timestamp": "2024-01-01T10:30:00.000Z",
            "details": {
              "correctAnswers": 8,
              "totalQuestions": 10,
              "accuracy": 80
            }
          }
        ]
      }
    }
  }
}
```

## 隐私和安全

### 数据存储

- 所有数据存储在本地浏览器中
- 学生 ID 不包含敏感信息
- 支持完全离线使用

### 数据清理

- 学生 ID 会自动清理特殊字符
- 只保留中文、英文、数字、下划线和连字符
- 防止恶意输入

### 多设备同步（可选）

- 通过导出/导入功能手动同步
- 可以集成 GitHub Gist 等云服务自动同步
- 详见 `SCORE_INTEGRATION_GUIDE.md`

## 最佳实践

### 1. 游戏集成

```javascript
// 在游戏开始前检查登录状态
function startGame() {
  if (!window.scoreManager.isStudentLoggedIn()) {
    alert("请先登录学生账户");
    window.loginManager.showLoginScreen();
    return;
  }
  // 开始游戏逻辑
}

// 在关键节点记录进度
function onLevelComplete(level, score) {
  window.scoreManager.recordScore("adventure", score, {
    level: level,
    completion: true,
  });
}
```

### 2. 用户体验

- 在游戏结束后显示进步信息
- 提供个性化的学习建议
- 鼓励学生查看自己的进步

### 3. 错误处理

```javascript
try {
  window.scoreManager.recordScore(activity, score, details);
} catch (error) {
  console.error("记录成绩失败:", error);
  // 提供备用方案或提示用户
}
```

这个系统为你的动词学习应用提供了完整的学生管理和成绩跟踪功能，同时保持了简单易用的特点！
