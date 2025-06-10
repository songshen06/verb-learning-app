# 🔥 简单 Firebase 配置方法

如果觉得私有配置文件方案太复杂，可以直接修改 `src/js/firebaseSync.js`：

## 📝 直接修改配置

找到 `src/js/firebaseSync.js` 文件中的这部分：

```javascript
// 默认配置（演示用）
let firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id",
};
```

**替换为你的真实配置：**

```javascript
// 你的真实配置
let firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  databaseURL:
    "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abcdef123456789",
};
```

## 🛡️ 安全保护

即使配置公开，也要在 Firebase 控制台设置：

1. **域名限制**：只允许你的域名访问
2. **数据库规则**：严格的用户权限控制
3. **配额限制**：防止滥用

这样就能安全使用了！
