/**
 * 阅读模式模块 - 负责阅读功能的实现
 */
export class ReadingMode {
  constructor(speechManager) {
    this.speechManager = speechManager;
    this.currentEssayId = null;
    this.currentEssayData = null;
    this.currentSentenceIndex = 0;
    this.essayIds = [];
    this.settings = {};
    this.wordElements = [];
    this.isReciting = false;
    this.recitingTimeout = null;
  }

  /**
   * 初始化阅读模式
   */
  initialize(essaysData, settings) {
    this.essaysData = essaysData;
    this.settings = settings;
    this.essayIds = Object.keys(essaysData);
    
    if (this.essayIds.length > 0) {
      this.currentEssayId = this.essayIds[0];
      this.currentEssayData = essaysData[this.currentEssayId];
    }

    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  initializeEventListeners() {
    // 文章选择下拉菜单
    document.getElementById('essay-selector')?.addEventListener('change', (e) => {
      this.selectEssay(e.target.value);
    });

    // 朗读整篇文章按钮
    document.getElementById('read-essay')?.addEventListener('click', () => {
      this.readCurrentEssay();
    });

    // 朗读当前句子按钮
    document.getElementById('read-sentence')?.addEventListener('click', () => {
      this.readCurrentSentence();
    });

    // 背诵模式按钮
    document.getElementById('recite-mode')?.addEventListener('click', () => {
      this.toggleReciteMode();
    });

    // 上一句按钮
    document.getElementById('prev-sentence')?.addEventListener('click', () => {
      if (this.currentSentenceIndex > 0) {
        this.currentSentenceIndex--;
        this.highlightCurrentSentence();
      }
    });

    // 下一句按钮
    document.getElementById('next-sentence')?.addEventListener('click', () => {
      if (this.currentSentenceIndex < this.currentEssayData.sentences.length - 1) {
        this.currentSentenceIndex++;
        this.highlightCurrentSentence();
      }
    });

    // 返回按钮
    document.getElementById('reading-back')?.addEventListener('click', () => {
      // 停止所有朗读和背诵
      this.stopReciting();
      this.speechManager.synthesis.cancel();
    });
  }

  /**
   * 加载文章列表
   */
  loadEssayList() {
    const selector = document.getElementById('essay-selector');
    if (!selector) return;

    selector.innerHTML = '';
    
    this.essayIds.forEach(id => {
      const essay = this.essaysData[id];
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${essay.title} (${essay.chineseTitle})`;
      selector.appendChild(option);
    });

    // 设置默认选中的文章
    if (this.currentEssayId) {
      selector.value = this.currentEssayId;
    }
  }

  /**
   * 选择文章
   */
  selectEssay(essayId) {
    if (!this.essaysData[essayId]) return;

    this.currentEssayId = essayId;
    this.currentEssayData = this.essaysData[essayId];
    this.currentSentenceIndex = 0;
    this.displayCurrentEssay();
  }

  /**
   * 显示当前文章
   */
  displayCurrentEssay() {
    if (!this.currentEssayData) return;

    // 更新标题
    const titleElement = document.getElementById('essay-title');
    if (titleElement) {
      titleElement.textContent = `${this.currentEssayData.title} (${this.currentEssayData.chineseTitle})`;
    }

    // 清除之前的单词元素引用
    this.wordElements = [];

    // 更新文章内容
    const contentElement = document.getElementById('essay-content');
    if (contentElement) {
      contentElement.innerHTML = '';
      
      this.currentEssayData.sentences.forEach((sentence, index) => {
        // 创建句子容器
        const sentenceContainer = document.createElement('div');
        sentenceContainer.className = 'sentence-container';
        sentenceContainer.dataset.index = index;
        
        // 创建句子文本元素
        const sentenceElement = document.createElement('p');
        sentenceElement.className = 'essay-sentence';
        
        // 处理句子中的特殊标记（动词和时间词组）
        const { processedSentence, words } = this.processSentenceWithWords(sentence, index);
        sentenceElement.innerHTML = processedSentence;
        
        // 创建单词按钮容器
        const wordButtonsContainer = document.createElement('div');
        wordButtonsContainer.className = 'word-buttons-container';
        
        // 为每个单词创建按钮
        words.forEach(wordInfo => {
          const wordButton = document.createElement('button');
          wordButton.className = `word-button ${wordInfo.type}`;
          wordButton.textContent = wordInfo.word;
          wordButton.dataset.word = wordInfo.word.toLowerCase();
          
          // 添加点击事件
          wordButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleWordClick(wordButton);
          });
          
          wordButtonsContainer.appendChild(wordButton);
        });
        
        // 添加句子点击事件
        sentenceElement.addEventListener('click', () => {
          this.currentSentenceIndex = index;
          this.highlightCurrentSentence();
          this.readCurrentSentence();
        });
        
        // 组装句子容器
        sentenceContainer.appendChild(sentenceElement);
        sentenceContainer.appendChild(wordButtonsContainer);
        contentElement.appendChild(sentenceContainer);
      });

      // 初始高亮当前句子
      this.highlightCurrentSentence();
    }
  }

  /**
   * 处理句子中的特殊标记，返回处理后的句子和单词列表
   */
  processSentenceWithWords(sentence, sentenceIndex) {
    const words = [];
    let processed = sentence;
    
    // 创建一个映射来记录特殊标记的单词类型
    const specialWords = new Map();
    
    // 首先处理动词标记 <v>went</v>
    processed = processed.replace(/<v>([^<]+)<\/v>/g, (match, word) => {
      specialWords.set(word.toLowerCase(), 'verb');
      return word;
    });

    // 处理时间词组标记 <t>last weekend</t>
    processed = processed.replace(/<t>([^<]+)<\/t>/g, (match, phrase) => {
      specialWords.set(phrase.toLowerCase(), 'time-phrase');
      return phrase;
    });

    // 将句子分解为单词，按照在句子中出现的顺序处理
    const allWords = processed.split(/\s+/).filter(word => word.trim());
    
    allWords.forEach(wordWithPunctuation => {
      // 分离单词和标点
      const punctuationMatch = wordWithPunctuation.match(/([^a-zA-Z0-9']+)$/);
      const punctuation = punctuationMatch ? punctuationMatch[0] : '';
      let word = punctuationMatch ? wordWithPunctuation.slice(0, -punctuation.length) : wordWithPunctuation;
      
      // 跳过空单词，但保留重要的单字母单词如"I", "a"
      if (!word || (word.length < 2 && !['I', 'a', 'A'].includes(word))) return;
      
      // 检查是否已经添加过这个单词（避免重复）
      const existingWord = words.find(w => w.word.toLowerCase() === word.toLowerCase());
      if (!existingWord) {
        // 确定单词类型
        const wordType = specialWords.get(word.toLowerCase()) || 'normal';
        
        words.push({
          word: word,
          type: wordType
        });
      }
    });
    
    return {
      processedSentence: processed,
      words: words
    };
  }

  /**
   * 高亮当前句子
   */
  highlightCurrentSentence() {
    // 移除所有句子容器的高亮
    document.querySelectorAll('.sentence-container').forEach(container => {
      container.classList.remove('current');
    });

    // 高亮当前句子容器
    const currentContainer = document.querySelector(`.sentence-container[data-index="${this.currentSentenceIndex}"]`);
    if (currentContainer) {
      currentContainer.classList.add('current');
      
      // 滚动到当前句子
      currentContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 更新导航按钮状态
    const prevButton = document.getElementById('prev-sentence');
    const nextButton = document.getElementById('next-sentence');
    
    if (prevButton) {
      prevButton.disabled = this.currentSentenceIndex === 0;
    }
    
    if (nextButton) {
      nextButton.disabled = this.currentSentenceIndex === this.currentEssayData.sentences.length - 1;
    }
  }

  /**
   * 朗读当前句子
   */
  readCurrentSentence() {
    if (!this.currentEssayData) return;
    
    const sentence = this.currentEssayData.sentences[this.currentSentenceIndex];
    if (!sentence) return;
    
    // 移除HTML标记，获取纯文本
    const plainText = sentence.replace(/<[^>]+>/g, '');
    
    // 朗读句子
    this.speechManager.speak(plainText, this.settings);
  }

  /**
   * 朗读整篇文章
   */
  readCurrentEssay() {
    if (!this.currentEssayData) return;
    
    // 停止之前的朗读
    this.speechManager.synthesis.cancel();
    
    // 从当前句子开始朗读
    this.readEssayFromIndex(this.currentSentenceIndex);
  }

  /**
   * 从指定索引开始朗读文章
   */
  readEssayFromIndex(startIndex) {
    if (!this.currentEssayData || startIndex >= this.currentEssayData.sentences.length) return;
    
    // 设置当前句子索引
    this.currentSentenceIndex = startIndex;
    this.highlightCurrentSentence();
    
    // 获取当前句子的纯文本
    const sentence = this.currentEssayData.sentences[startIndex];
    const plainText = sentence.replace(/<[^>]+>/g, '');
    
    // 朗读当前句子，完成后朗读下一句
    this.speechManager.speak(plainText, this.settings, () => {
      this.readEssayFromIndex(startIndex + 1);
    });
  }

  /**
   * 处理单词点击事件
   */
  handleWordClick(wordElement) {
    const word = wordElement.dataset.word || wordElement.textContent.toLowerCase();
    if (!word) return;
    
    // 添加点击效果
    wordElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
      wordElement.style.transform = '';
    }, 150);
    
    // 朗读单词
    this.speechManager.speak(word, this.settings);
    
    // 显示单词解释
    this.showWordDefinition(word, wordElement);
  }

  /**
   * 显示单词解释
   */
  showWordDefinition(word, wordElement) {
    // 获取单词解释
    const definition = window.dictionaryData ? window.dictionaryData[word.toLowerCase()] : null;
    
    // 创建或更新单词解释弹窗
    let definitionPopup = document.getElementById('word-definition-popup');
    
    if (!definitionPopup) {
      definitionPopup = document.createElement('div');
      definitionPopup.id = 'word-definition-popup';
      document.body.appendChild(definitionPopup);
    }
    
    // 设置内容
    definitionPopup.innerHTML = `
      <div class="popup-header">
        <span class="word-text">${word}</span>
        <button class="popup-close">×</button>
      </div>
      <div class="popup-content">
        ${definition ? `<p class="definition">${definition}</p>` : '<p class="no-definition">暂无解释</p>'}
      </div>
      <div class="popup-footer">
        <button class="btn btn--secondary btn--sm" id="speak-word">🔊 朗读</button>
      </div>
    `;
    
    // 定位弹窗
    const rect = wordElement.getBoundingClientRect();
    const popupHeight = 150; // 估计高度
    
    // 根据单词在页面中的位置决定弹窗显示在上方还是下方
    const topPosition = rect.top > popupHeight + 20 ? rect.top - popupHeight - 10 : rect.bottom + 10;
    
    definitionPopup.style.position = 'absolute';
    definitionPopup.style.top = `${topPosition + window.scrollY}px`;
    definitionPopup.style.left = `${rect.left + window.scrollX}px`;
    definitionPopup.style.display = 'block';
    
    // 添加事件监听器
    definitionPopup.querySelector('.popup-close').addEventListener('click', () => {
      definitionPopup.style.display = 'none';
    });
    
    definitionPopup.querySelector('#speak-word').addEventListener('click', () => {
      this.speechManager.speak(word, this.settings);
    });
    
    // 点击其他地方关闭弹窗
    const closePopupOnOutsideClick = (e) => {
      if (!definitionPopup.contains(e.target) && e.target !== wordElement) {
        definitionPopup.style.display = 'none';
        document.removeEventListener('click', closePopupOnOutsideClick);
      }
    };
    
    // 延迟添加事件监听器，防止立即触发
    setTimeout(() => {
      document.addEventListener('click', closePopupOnOutsideClick);
    }, 10);
  }

  /**
   * 切换背诵模式
   */
  toggleReciteMode() {
    if (this.isReciting) {
      this.stopReciting();
    } else {
      this.startReciting();
    }
  }

  /**
   * 开始背诵模式
   */
  startReciting() {
    if (!this.currentEssayData) return;
    
    this.isReciting = true;
    
    // 更新按钮文本
    const reciteButton = document.getElementById('recite-mode');
    if (reciteButton) {
      reciteButton.textContent = '⏹️ 停止背诵';
      reciteButton.classList.add('active');
    }
    
    // 隐藏所有动词
    document.querySelectorAll('.verb').forEach(verb => {
      verb.classList.add('hidden-word');
      verb.dataset.originalText = verb.textContent;
      verb.textContent = '_'.repeat(verb.textContent.length);
    });
    
    // 设置定时器，每隔一段时间朗读一个句子
    this.currentSentenceIndex = 0;
    this.highlightCurrentSentence();
    this.reciteNextSentence();
  }

  /**
   * 背诵下一个句子
   */
  reciteNextSentence() {
    if (!this.isReciting || !this.currentEssayData) return;
    
    if (this.currentSentenceIndex >= this.currentEssayData.sentences.length) {
      // 已完成所有句子，重新开始
      this.currentSentenceIndex = 0;
    }
    
    this.highlightCurrentSentence();
    this.readCurrentSentence();
    
    // 设置下一句的定时器
    this.recitingTimeout = setTimeout(() => {
      this.currentSentenceIndex++;
      this.reciteNextSentence();
    }, 5000); // 5秒后朗读下一句
  }

  /**
   * 停止背诵模式
   */
  stopReciting() {
    this.isReciting = false;
    
    // 更新按钮文本
    const reciteButton = document.getElementById('recite-mode');
    if (reciteButton) {
      reciteButton.textContent = '🎯 背诵模式';
      reciteButton.classList.remove('active');
    }
    
    // 显示所有隐藏的动词
    document.querySelectorAll('.hidden-word').forEach(word => {
      if (word.dataset.originalText) {
        word.textContent = word.dataset.originalText;
      }
      word.classList.remove('hidden-word');
    });
    
    // 清除定时器
    if (this.recitingTimeout) {
      clearTimeout(this.recitingTimeout);
      this.recitingTimeout = null;
    }
    
    // 停止朗读
    this.speechManager.synthesis.cancel();
  }

  /**
   * 记录阅读成绩
   */
  recordReadingScore(essayId, completionPercentage, recitedWords) {
    if (!window.scoreManager || !window.scoreManager.isStudentLoggedIn()) return;
    
    const details = {
      essayId,
      title: this.essaysData[essayId]?.title || '',
      completionPercentage,
      recitedWords,
      timestamp: new Date().toISOString()
    };
    
    // 使用成绩管理器记录成绩
    window.scoreManager.recordScore('reading', completionPercentage, details);
  }
}