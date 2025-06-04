// Default application settings
export const DEFAULT_SETTINGS = {
  speechSpeed: 1,
  voiceVolume: 0.8,
  autoPlayAudio: true,
  theme: "light",
  language: "en-US",
};

// Speech settings
export const SPEECH_SETTINGS = {
  defaultRate: 1,
  minRate: 0.7,
  maxRate: 1.3,
  defaultVolume: 0.8,
  minVolume: 0,
  maxVolume: 1,
};

// Game settings
export const GAME_SETTINGS = {
  matchingGameVerbs: 5,
  challengeQuestions: 10,
  pointsPerCorrect: 10,
  pointsPerIncorrect: -5,
};
