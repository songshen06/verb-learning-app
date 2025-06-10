# 🔥 Firebase 快速配置指南

## 📝 只需 3 步配置 Firebase

### 步骤 1：创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击 "创建项目"
3. 输入项目名称，点击继续
4. 完成项目创建

### 步骤 2：配置 Firebase 服务

#### 启用认证

- Authentication → 登录方法 → 启用 "匿名"

#### 创建数据库

- Realtime Database → 创建数据库 → 选择测试模式

#### 设置安全规则

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 步骤 3：配置应用

#### 获取配置信息

1. 项目设置 → 你的应用 → 添加网络应用
2. 复制配置对象

#### 修改代码

打开 `src/js/firebaseSync.js`，找到这部分代码：

```javascript
// Firebase配置 - 请替换为你的真实配置
const firebaseConfig = {
  apiKey: "your-api-key", // 👈 替换这里
  authDomain: "your-project.firebaseapp.com", // 👈 替换这里
  databaseURL:
    "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app/", // 👈 替换这里
  projectId: "your-project-id", // 👈 替换这里
  storageBucket: "your-project.appspot.com", // 👈 替换这里
  messagingSenderId: "123456789", // 👈 替换这里
  appId: "your-app-id", // 👈 替换这里
};
```

**替换为你的真实配置：**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "verb-learning-12345.firebaseapp.com",
  databaseURL:
    "https://verb-learning-12345-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "verb-learning-12345",
  storageBucket: "verb-learning-12345.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abcdef123456789",
};
```

## 🛡️ 安全配置

### 配置域名限制

在 Firebase 控制台：

```
项目设置 → 常规 → 已获授权的域名
```

添加你的域名：

- `your-username.github.io`
- `localhost` (用于本地开发)

### 设置使用配额

```
项目设置 → 使用情况 → 详情和设置
```

设置合理的限制，比如：

- 每日读取：10,000 次
- 每日写入：1,000 次

## ✅ 完成！

保存文件后，你的应用就支持云端同步了！

用户体验：

- 🔄 自动同步所有设备
- 🛡️ 数据安全加密
- 📱 支持多设备使用
- 💾 离线本地存储

---

**配置完成后，用户无需任何设置就能享受云端同步！** 🎉
