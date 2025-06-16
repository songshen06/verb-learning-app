// Default application settings
export const DEFAULT_SETTINGS = {
  speechSpeed: 0.9,
  voiceVolume: 0.8,
  voicePitch: 1.0,
  autoPlayAudio: true,
  theme: "light",
  language: "en-US",
  preferredVoice: null,
};

// Speech settings
export const SPEECH_SETTINGS = {
  defaultRate: 0.9,
  minRate: 0.5,
  maxRate: 1.5,
  defaultVolume: 0.8,
  minVolume: 0,
  maxVolume: 1,
  defaultPitch: 1.0,
  minPitch: 0.5,
  maxPitch: 2.0,
};

// Game settings
export const GAME_SETTINGS = {
  matchingGameVerbs: 5,
  challengeQuestions: 10,
  pointsPerCorrect: 10,
  pointsPerIncorrect: -5,
};
