/**
 * 集成测试设置文件
 * 为集成测试提供必要的mock和环境配置
 */

// Mock Web APIs that are not available in jsdom
global.SpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
  }
};

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
};

// Mock SpeechRecognition API
global.SpeechRecognition = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: "en-US",
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock CSS animations and transitions
Object.defineProperty(HTMLElement.prototype, "animate", {
  value: jest.fn(() => ({
    addEventListener: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    finish: jest.fn(),
  })),
});

// Suppress warnings about missing CSS
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    args[0].includes &&
    (args[0].includes("Warning: React") || args[0].includes("Warning:"))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
