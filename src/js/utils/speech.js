// Speech utility functions
export class SpeechManager {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.recognition = null;
    this.isRecording = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.voices = [];
    this.preferredVoice = null;
    this.initializeSpeechRecognition();
    this.initializeVoices();
  }

  initializeVoices() {
    // 等待语音加载完成
    const loadVoices = () => {
      this.voices = this.synthesis.getVoices();
      
      // 优先选择更自然的英语语音
      const preferredVoiceNames = [
        'Samantha', // macOS 自然女声
        'Alex', // macOS 自然男声
        'Karen', // Windows 自然女声
        'David', // Windows 自然男声
        'Google US English', // Chrome 自然语音
        'Microsoft Zira - English (United States)', // Windows 10
        'Microsoft David - English (United States)', // Windows 10
      ];
      
      // 查找最佳语音
      for (const voiceName of preferredVoiceNames) {
        const voice = this.voices.find(v => 
          v.name.includes(voiceName) && v.lang.startsWith('en')
        );
        if (voice) {
          this.preferredVoice = voice;
          console.log('Selected preferred voice:', voice.name);
          break;
        }
      }
      
      // 如果没找到首选语音，选择第一个英语语音
      if (!this.preferredVoice) {
        this.preferredVoice = this.voices.find(v => 
          v.lang.startsWith('en') && !v.name.includes('Google')
        ) || this.voices.find(v => v.lang.startsWith('en'));
      }
      
      if (this.preferredVoice) {
        console.log('Using voice:', this.preferredVoice.name);
      }
    };
    
    // 语音可能需要时间加载
    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', loadVoices);
      // 也立即尝试一次
      setTimeout(loadVoices, 100);
    } else {
      loadVoices();
    }
  }

  initializeSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 5;
      this.recognition.lang = "en";
    }
  }

  speak(text, settings = {}, callback = null) {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 使用选定的自然语音
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    // 设置语音参数，使其更自然
    utterance.rate = settings.speechSpeed || 0.9; // 稍微慢一点更自然
    utterance.volume = settings.voiceVolume || 0.8;
    utterance.pitch = settings.voicePitch || 1.0; // 添加音调控制
    utterance.lang = settings.language || "en-US";
    
    // 为不同类型的文本调整参数
    if (text.length < 10) {
      // 短单词，稍微慢一点
      utterance.rate = (settings.speechSpeed || 0.9) * 0.9;
    }

    if (callback) {
      utterance.onend = callback;
    }

    this.synthesis.speak(utterance);
  }
  
  // 获取可用语音列表
  getAvailableVoices() {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }
  
  // 设置首选语音
  setPreferredVoice(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.preferredVoice = voice;
      console.log('Voice changed to:', voice.name);
    }
  }

  startRecording(onResult, onError) {
    if (!this.recognition) {
      onError("Speech recognition is not supported in your browser");
      return;
    }

    // 重置重试计数
    this.retryCount = 0;
    this.startRecognition(onResult, onError);
  }

  startRecognition(onResult, onError) {
    // 如果正在录音，先停止
    if (this.isRecording) {
      this.stopRecording();
    }

    // 重置事件处理器
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;
    this.recognition.onnomatch = null;
    this.recognition.onspeechend = null;
    this.recognition.onaudiostart = null;
    this.recognition.onsoundstart = null;
    this.recognition.onspeechstart = null;

    let finalResultReceived = false;
    let hasError = false;
    let interimResults = [];

    // 设置新的事件处理器
    this.recognition.onresult = (event) => {
      console.log("Speech recognition result:", event);

      // 处理中间结果
      if (!event.results[0].isFinal) {
        const interimResult = event.results[0][0].transcript
          .toLowerCase()
          .trim();
        interimResults.push(interimResult);
        console.log("Interim result:", interimResult);
        return;
      }

      // 处理最终结果
      if (event.results[0].isFinal) {
        // 获取所有备选结果
        const alternatives = Array.from(event.results[0]).map((result) => ({
          transcript: result.transcript.toLowerCase().trim(),
          confidence: result.confidence,
        }));

        console.log("All alternatives:", alternatives);
        console.log("Interim results history:", interimResults);

        // 确保只处理一次最终结果
        if (!finalResultReceived) {
          finalResultReceived = true;
          this.retryCount = 0; // 重置重试计数

          // 使用置信度最高的结果
          const bestResult = alternatives.reduce((best, current) =>
            current.confidence > best.confidence ? current : best
          );

          console.log("Best result:", bestResult);

          // 如果最佳结果的置信度太低，尝试使用中间结果
          if (bestResult.confidence < 0.5 && interimResults.length > 0) {
            const mostFrequentInterim = this.getMostFrequent(interimResults);
            console.log(
              "Using most frequent interim result:",
              mostFrequentInterim
            );
            onResult(mostFrequentInterim);
          } else {
            onResult(bestResult.transcript);
          }
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);
      hasError = true;
      this.isRecording = false;
      finalResultReceived = false;
      onError(event.error || "Speech recognition error");
    };

    this.recognition.onend = () => {
      console.log("Speech recognition ended");
      this.isRecording = false;

      // 如果没有收到最终结果且没有错误，尝试重试
      if (
        !finalResultReceived &&
        !hasError &&
        this.retryCount < this.maxRetries
      ) {
        this.retryCount++;
        console.log(
          `Retrying speech recognition (attempt ${this.retryCount}/${this.maxRetries})...`
        );
        setTimeout(() => {
          if (!finalResultReceived && !hasError) {
            this.startRecognition(onResult, onError);
          }
        }, 500);
      } else if (this.retryCount >= this.maxRetries) {
        console.log("Max retries reached");
        onError("Could not recognize speech after multiple attempts");
      }
    };

    this.recognition.onnomatch = () => {
      console.log("No speech was recognized");
      hasError = true;
      this.isRecording = false;
      finalResultReceived = false;
      onError("No speech was recognized");
    };

    this.recognition.onspeechend = () => {
      console.log("Speech ended");
    };

    this.recognition.onaudiostart = () => {
      console.log("Audio capturing started");
    };

    this.recognition.onsoundstart = () => {
      console.log("Sound detected");
    };

    this.recognition.onspeechstart = () => {
      console.log("Speech detected");
    };

    try {
      this.isRecording = true;
      finalResultReceived = false;
      hasError = false;
      interimResults = [];
      this.recognition.start();
      console.log("Speech recognition started");
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      this.isRecording = false;
      finalResultReceived = false;
      hasError = true;
      onError("Failed to start speech recognition: " + error.message);
    }
  }

  stopRecording() {
    if (!this.recognition || !this.isRecording) return;

    try {
      console.log("Stopping speech recognition");
      this.recognition.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    } finally {
      this.isRecording = false;
    }
  }

  // 获取数组中出现次数最多的元素
  getMostFrequent(arr) {
    const frequency = {};
    let maxFreq = 0;
    let mostFrequent = arr[0];

    for (const item of arr) {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        mostFrequent = item;
      }
    }

    return mostFrequent;
  }
}
