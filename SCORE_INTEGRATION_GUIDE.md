# 成绩记录系统集成指南

## 概述

本指南说明如何将成绩记录功能集成到现有的动词学习游戏中。

## 已添加的功能

### 1. 成绩管理器 (`src/js/scoreManager.js`)

- 自动生成学生 ID
- 记录练习成绩
- 计算统计数据
- 提供学习建议
- 导入/导出功能

### 2. 成绩 UI 管理器 (`src/js/scoreUI.js`)

- 成绩统计页面显示
- 数据可视化
- 文件导入/导出界面

### 3. HTML 界面

- 设置页面中的成绩管理按钮
- 专门的成绩统计页面
- 响应式设计

## 如何在游戏中记录成绩

### 在现有游戏代码中添加成绩记录

```javascript
// 示例：在配对游戏结束时记录成绩
function endMatchingGame(finalScore, correctAnswers, totalQuestions) {
  // 记录成绩
  window.scoreManager.recordScore("matching", finalScore, {
    correctAnswers: correctAnswers,
    totalQuestions: totalQuestions,
    accuracy: Math.round((correctAnswers / totalQuestions) * 100),
  });

  // 显示结果
  showGameResults(finalScore);
}

// 示例：在填空游戏结束时记录成绩
function endFillBlankGame(score, details) {
  window.scoreManager.recordScore("fill-blank", score, details);
}

// 示例：在字母选择游戏结束时记录成绩
function endLetterChoiceGame(score, details) {
  window.scoreManager.recordScore("letter-choice", score, details);
}

// 示例：在发音练习结束时记录成绩
function endPronunciationGame(score, details) {
  window.scoreManager.recordScore("pronunciation", score, details);
}
```

### 活动类型标识符

使用以下标准化的活动类型：

- `'matching'` - 配对游戏
- `'fill-blank'` - 填空练习
- `'letter-choice'` - 字母选择
- `'pronunciation'` - 发音练习

## 多端同步方案

### 方案 1：GitHub Gist (推荐)

最适合当前的 GitHub Pages 部署：

```javascript
// 扩展ScoreManager类以支持GitHub Gist同步
class ScoreManager {
  // ... 现有代码 ...

  async syncToGithub(githubToken) {
    try {
      const data = {
        files: {
          [`scores_${this.currentStudent}.json`]: {
            content: JSON.stringify({
              studentId: this.currentStudent,
              scores: this.scores[this.currentStudent],
              lastSync: new Date().toISOString(),
            }),
          },
        },
      };

      const response = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem("scoreGistId", result.id);
        return { success: true, gistId: result.id };
      }
    } catch (error) {
      console.error("Sync error:", error);
      return { success: false, error: error.message };
    }
  }

  async loadFromGithub(gistId, githubToken) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      });

      if (response.ok) {
        const gist = await response.json();
        const fileName = Object.keys(gist.files)[0];
        const content = JSON.parse(gist.files[fileName].content);

        // 合并远程数据
        this.scores[content.studentId] = content.scores;
        this.saveScores();

        return { success: true };
      }
    } catch (error) {
      console.error("Load error:", error);
      return { success: false, error: error.message };
    }
  }
}
```

### 方案 2：JSONBin.io

免费 API 服务：

```javascript
async syncToJSONBin(apiKey, binId = null) {
    const url = binId
        ? `https://api.jsonbin.io/v3/b/${binId}`
        : 'https://api.jsonbin.io/v3/b';

    const method = binId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({
                studentId: this.currentStudent,
                scores: this.scores,
                lastSync: new Date().toISOString()
            })
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('jsonBinId', result.metadata.id);
            return { success: true, binId: result.metadata.id };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### 方案 3：本地存储 + 手动同步

最简单的实现：

```javascript
// 用户可以导出成绩文件到云盘
// 在其他设备上导入相同的文件
// 已经在scoreManager.js中实现了导入/导出功能
```

## 部署步骤

1. **更新现有游戏代码**
   在每个游戏结束时添加 `scoreManager.recordScore()` 调用

2. **测试功能**

   - 玩几轮游戏确保成绩被正确记录
   - 测试导入/导出功能
   - 验证成绩统计页面显示正确

3. **配置同步（可选）**
   如果需要多端同步，选择一种方案并配置相应的 API 密钥

4. **部署到 GitHub Pages**
   所有文件都是静态的，可以直接部署

## 最佳实践

1. **隐私保护**

   - 学生 ID 是随机生成的，不包含个人信息
   - 所有数据存储在本地浏览器中
   - 同步是可选的

2. **性能优化**

   - 成绩数据压缩存储
   - 批量同步而不是每次游戏后同步
   - 缓存统计数据避免重复计算

3. **用户体验**
   - 提供清晰的进度反馈
   - 支持离线使用
   - 简单的导入/导出流程

## 后续扩展

1. **教师仪表板**
   可以创建一个教师专用页面来查看多个学生的成绩

2. **更多统计图表**
   使用 Chart.js 等库添加可视化图表

3. **学习路径推荐**
   基于成绩数据提供个性化学习建议

4. **社交功能**
   添加排行榜或者好友比较功能
