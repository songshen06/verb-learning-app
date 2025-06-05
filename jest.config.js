module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "json"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  setupFiles: ["<rootDir>/jest.integration.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/js/config/**",
    "!**/node_modules/**",
  ],
  // 增加测试超时时间，适应异步测试
  testTimeout: 10000,
};
