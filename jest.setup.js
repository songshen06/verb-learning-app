import "@testing-library/jest-dom";

// Mock window.speechSynthesis
window.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
};

// Mock window.SpeechRecognition
window.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
