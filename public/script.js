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



const GROUP_SIZE = 20; // 每组多少张卡片

// --- 元素引用 ---
const difficultySelect = document.getElementById('difficulty-select');
const modeSelect = document.getElementById('mode-select'); 
const imageElement = document.getElementById('flashcard-image');
const audioElement = document.getElementById('flashcard-audio');
const nextButton = document.getElementById('next-button');
const cardStatusElement = document.getElementById('card-status');
const groupContainer = document.getElementById('group-buttons-container');

// --- 状态变量 ---
let currentDifficulty = "1"; 
let currentMode = "study";      
let cardList = [];           
let currentCardIndexInList = 0; 
let currentGroupIndex = 0; // 当前第几组 (0代表第1组)

/**
 * 格式化数字为三位字符串
 */
function formatCardNumber(num) {
    return String(num).padStart(3, '0');
}

/**
 * 动态渲染左侧分组按钮
 */
function renderGroupButtons() {
    groupContainer.innerHTML = '';
    const totalCards = DIFFICULTY_CARD_COUNTS[currentDifficulty];
    const numGroups = Math.ceil(totalCards / GROUP_SIZE);

    for (let i = 0; i < numGroups; i++) {
        const start = i * GROUP_SIZE + 1;
        const end = Math.min((i + 1) * GROUP_SIZE, totalCards);
        
        const btn = document.createElement('button');
        btn.className = `group-btn ${i === currentGroupIndex ? 'active' : ''}`;
        btn.textContent = `组 ${i + 1} (${start}-${end})`;
        
        btn.onclick = () => {
            currentGroupIndex = i;
            loadCards(false); // 切换组时不重置难度
        };
        groupContainer.appendChild(btn);
    }
}

/**
 * 加载卡片逻辑
 * @param {boolean} resetToFirstGroup 是否重置到第一组
 */
function loadCards(resetToFirstGroup = true) {
    currentDifficulty = difficultySelect.value;
    currentMode = modeSelect.value;
    
    if (resetToFirstGroup) {
        currentGroupIndex = 0;
    }

    // 更新侧边栏状态
    renderGroupButtons();

    const totalInDifficulty = DIFFICULTY_CARD_COUNTS[currentDifficulty];
    const startNum = currentGroupIndex * GROUP_SIZE + 1;
    const endNum = Math.min((currentGroupIndex + 1) * GROUP_SIZE, totalInDifficulty);

    // 生成当前组的数字列表
    cardList = [];
    for (let i = startNum; i <= endNum; i++) {
        cardList.push(i);
    }
    
    // 如果是测试模式，打乱该组内的顺序
    if (currentMode === 'test') {
        cardList.sort(() => Math.random() - 0.5); 
    }
    
    currentCardIndexInList = 0;
    updateCardDisplay();
}

/**
 * 播放声音（带浏览器兼容处理）
 */
function playAudio() {
    audioElement.pause();
    audioElement.currentTime = 0; 
    audioElement.play().catch(e => {
        console.warn("自动播放被拦截，请点击图片或按钮交互。");
    });
}

/**
 * 更新界面显示
 */
function updateCardDisplay() {
    if (cardList.length === 0) return;
    
    const cardNumber = formatCardNumber(cardList[currentCardIndexInList]); 

    // 设置路径
    imageElement.src = `./images/${currentDifficulty}/${cardNumber}.jpg`;
    audioElement.src = `./audio/${currentDifficulty}/${cardNumber}.mp3`;
    
    // 状态文字
    const groupStart = currentGroupIndex * GROUP_SIZE + 1;
    const groupEnd = Math.min((currentGroupIndex + 1) * GROUP_SIZE, DIFFICULTY_CARD_COUNTS[currentDifficulty]);
    
    cardStatusElement.textContent = 
        `当前：难度 ${currentDifficulty} | 第 ${currentGroupIndex + 1} 组 (${groupStart}-${groupEnd}) | 进度：${currentCardIndexInList + 1} / ${cardList.length}`;
        
    // 学习模式自动播放
    if (currentMode === 'study') {
        playAudio();
    }
}

/**
 * 下一张
 */
function goToNextCard() {
    currentCardIndexInList++;
    
    if (currentCardIndexInList >= cardList.length) {
        currentCardIndexInList = 0;
        alert(`本组 (${currentGroupIndex + 1}) 已完成！将重新开始。`);
        // 这里可以设计成自动跳到下一组，但为了稳妥，先循环本组
    }
    updateCardDisplay();
}

// --- 事件监听 ---

// 切换难度：需要重置分组
difficultySelect.addEventListener('change', () => loadCards(true));

// 切换模式：保持当前分组
modeSelect.addEventListener('change', () => loadCards(false));

// 点击图片重播声音
imageElement.addEventListener('click', playAudio);

// 下一张按钮
nextButton.addEventListener('click', goToNextCard);

// 键盘快捷键：空格或回车切换下一张
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        goToNextCard();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadCards(true);
});