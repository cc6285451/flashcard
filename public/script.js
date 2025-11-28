// *** 关键配置：请根据您的实际文件数量修改 ***
const DIFFICULTY_CARD_COUNTS = {
    // 请务必将这些数字替换为您实际文件夹中的文件数量
    "1": 154, 
    "2": 205, 
    "3": 197, 
    "4": 188, 
    "5": 215, 
    "6": 178, 
    "7": 168
};




// --- 元素引用 ---
const difficultySelect = document.getElementById('difficulty-select');
const modeSelect = document.getElementById('mode-select'); 
const imageElement = document.getElementById('flashcard-image');
const audioElement = document.getElementById('flashcard-audio');
const nextButton = document.getElementById('next-button');
const cardStatusElement = document.getElementById('card-status');

// --- 状态变量 ---
let currentDifficulty = "1"; 
let currentMode = "study";      
let cardList = [];           
let currentCardIndexInList = 0; 

// --- 辅助函数 ---

/**
 * 将数字格式化为三位字符串 (001, 002, ...)
 * @param {number} num
 * @returns {string}
 */
function formatCardNumber(num) {
    return String(num).padStart(3, '0');
}

/**
 * 切换模式或难度时，生成新的卡片列表并重置进度
 */
function loadCards() {
    currentDifficulty = difficultySelect.value;
    currentMode = modeSelect.value;
    
    const count = DIFFICULTY_CARD_COUNTS[currentDifficulty];
    if (!count) {
        console.error("未找到该难度级别的卡片数量配置！");
        alert("配置错误：请检查 script.js 中的卡片数量设置。");
        return;
    }

    cardList = Array.from({ length: count }, (_, i) => i + 1);
    
    if (currentMode === 'test') {
        cardList.sort(() => Math.random() - 0.5); 
        console.log(`已加载难度 ${currentDifficulty}，模式：乱序测试`);
    } else {
        console.log(`已加载难度 ${currentDifficulty}，模式：顺序学习`);
    }
    
    currentCardIndexInList = 0;
    updateCardDisplay();
}

/**
 * 播放当前音频，处理自动播放被阻止的兼容性问题
 */
function playAudio() {
    // 1. 确保音频停止并重置时间
    audioElement.pause();
    audioElement.currentTime = 0; 

    // 2. 尝试播放，并捕获自动播放错误
    audioElement.play().catch(error => {
        // 只有在浏览器明确阻止自动播放时才提示
        if (error.name === "NotAllowedError" || error.name === "AbortError") {
             console.warn("浏览器阻止了音频自动播放。请点击图片或'下一张'按钮来启动播放授权。");
             // 可以在此处给用户一个更明显的提示，但通常不建议频繁使用 alert
        } else {
             console.error("音频播放失败:", error);
        }
    });
}

/**
 * 更新卡片显示（图片、音频源和进度状态），并在学习模式下自动播放
 */
function updateCardDisplay() {
    if (cardList.length === 0) {
        imageElement.src = '';
        cardStatusElement.textContent = `卡片进度: 0 / 0`;
        return;
    }
    
    const rawCardNumber = cardList[currentCardIndexInList];
    const cardNumber = formatCardNumber(rawCardNumber); 

    // 构建文件路径
    imageElement.src = `./images/${currentDifficulty}/${cardNumber}.jpg`;
    
    // **关键修改点：先设置音频源，再尝试播放**
    audioElement.src = `./audio/${currentDifficulty}/${cardNumber}.mp3`;
    
    cardStatusElement.textContent = 
        `模式: ${currentMode === 'study' ? '学习' : '测试'} | 难度 ${currentDifficulty} | 卡片进度: ${currentCardIndexInList + 1} / ${cardList.length}`;
        
    // ----------------------------------------------------
    // *** 学习模式自动播放音频 ***
    if (currentMode === 'study') {
        // 在新音频源加载完成后，尝试播放。
        // 使用 load() 和 oncanplaythrough 可以提高成功率，但 for 纯静态网站，直接调用 playAudio() 是更常见的做法。
        // 这里依赖浏览器的预加载。
        playAudio();
    }
    // ----------------------------------------------------
}


/**
 * 切换到下一张卡片
 */
function goToNextCard() {
    // 如果是第一次加载（即 currentCardIndexInList 为 0）且是学习模式，
    // 某些浏览器可能需要用户在加载前进行一次点击，所以我们在 goToNextCard 中调用 updateCardDisplay。

    currentCardIndexInList++;
    
    // 检查是否到达列表末尾
    if (currentCardIndexInList >= cardList.length) {
        currentCardIndexInList = 0;
        
        if (currentMode === 'test') {
             loadCards(); 
             alert(`恭喜您完成了本轮测试！将重新打乱顺序开始新一轮测试。`);
             return;
        } else {
             // 在学习模式下，重新加载确保顺序仍是 1, 2, 3...
             loadCards();
             alert(`恭喜您完成了难度 ${currentDifficulty} 的所有 ${cardList.length} 张卡片！将重新开始顺序学习。`);
             return;
        }
    }
    updateCardDisplay();
}


// --- 事件监听器 ---

// 1. 模式选择器变更事件 
modeSelect.addEventListener('change', loadCards);

// 2. 难度选择器变更事件
difficultySelect.addEventListener('change', loadCards);

// 3. 点击图片播放音频 (在任何模式下都作为手动重播/首次播放授权)
imageElement.addEventListener('click', playAudio);

// 4. 点击按钮切换下一张
nextButton.addEventListener('click', goToNextCard);

// 5. 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    modeSelect.value = currentMode;
    difficultySelect.value = currentDifficulty; 
    loadCards();
});