const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 遊戲狀態與設定
let gameState = 'loading';
let car = { x: canvas.width / 2, y: canvas.height - 100, width: 30, height: 50, speed: 5, angle: 0 };
let currentQuestion = null;
let isAnswerCorrect = false;
let questionTriggerY = canvas.height / 3 + 50;
let questionIndex = 0;
let score = 0;

// 按鈕相關變數
const restartButton = {
    x: 20,
    y: canvas.height - 70,
    width: 150,
    height: 50
};
const playAgainButton = {
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 + 50,
    width: 200,
    height: 50
};

// 圖片載入相關變數
const roadImage = new Image();
const carImage = new Image();

// 虛擬按鈕元素
const upButton = document.getElementById('upButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

// 問題資料庫
const allQuestions = [
    {
        question: "體驗小小卡丁車應該穿甚麼鞋子?",
        options: ["布鞋/運動鞋", "拖鞋", "涼鞋"],
        correctAnswer: "布鞋/運動鞋"
    },
    {
        question: "小小卡丁車的身高限制是?",
        options: ["100-150公分", "110-150公分", "0-100公分"],
        correctAnswer: "100-150公分"
    },
    {
        question: "看到後方有車要超車，怎麼做是正確的呢?",
        options: ["擋住他的路", "友善讓路", "對他大聲咆哮"],
        correctAnswer: "友善讓路"
    },
    {
        question: "為甚麼要戴頭套?",
        options: ["帥", "衛生問題", "防曬"],
        correctAnswer: "衛生問題"
    },
    {
        question: "小小孩開小小卡丁車可以訓練?",
        options: ["專注力與判斷力", "動作協調與核心控制", "兩者皆是"],
        correctAnswer: "兩者皆是"
    }
];

// 圖片載入函式
function loadAssets() {
    let imagesLoadedCount = 0;
    const totalImagesToLoad = 2;

    const imageLoaded = () => {
        imagesLoadedCount++;
        if (imagesLoadedCount === totalImagesToLoad) {
            gameState = 'start';
        }
    };

    roadImage.onload = imageLoaded;
    carImage.onload = imageLoaded;

    roadImage.onerror = () => { console.error("道路圖片載入失敗。"); imageLoaded(); };
    carImage.onerror = () => { console.error("卡丁車圖片載入失敗。"); imageLoaded(); };

    roadImage.src = 'road.png';
    carImage.src = 'car.png';
}

// 隨機打亂陣列順序的函式
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 重置遊戲狀態的函式
function resetGame() {
    car = { x: canvas.width / 2, y: canvas.height - 100, width: 30, height: 50, speed: 5, angle: 0 };
    questionIndex = 0;
    score = 0;
    gameState = 'start';
}

// 繪製按鈕的函式
function drawButton(text, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
}

// 繪製計分板的函式
function drawScore() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 160, canvas.height - 70, 140, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`分數: ${score}/100`, canvas.width - 90, canvas.height - 45);
}

// 遊戲元素繪圖函式
function drawRoad() {
    if (roadImage.complete && roadImage.naturalWidth > 0) {
        ctx.drawImage(roadImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawCar() {
    ctx.save();
    ctx.translate(car.x + car.width / 2, car.y + car.height / 2);
    ctx.rotate(car.angle);
    if (carImage.complete && carImage.naturalWidth > 0) {
        ctx.drawImage(carImage, -car.width / 2, -car.height / 2, car.width, car.height);
    } else {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
    }
    ctx.restore();
}

function drawQuestion() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, 100);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentQuestion.question, canvas.width / 2, 50);
    ctx.font = '20px Arial';
    ctx.fillText(currentQuestion.shuffledOptions[0], canvas.width / 2 - 200, canvas.height / 3 - 20);
    ctx.fillText(currentQuestion.shuffledOptions[1], canvas.width / 2, canvas.height / 3 - 20);
    ctx.fillText(currentQuestion.shuffledOptions[2], canvas.width / 2 + 200, canvas.height / 3 - 20);
}

function drawResult() {
    ctx.fillStyle = isAnswerCorrect ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = '#fff';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isAnswerCorrect ? "答對了！" : "答錯了！", canvas.width / 2, canvas.height / 2);
}

function drawGameComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const message = score === 100 ? "恭喜你！滿分通過所有關卡！" : "遊戲結束！";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText(`你的分數是 ${score}/${allQuestions.length * 20}`, canvas.width / 2, canvas.height / 2 - 20);

    drawButton("再玩一次", playAgainButton.x, playAgainButton.y, playAgainButton.width, playAgainButton.height, '#2ecc71');
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("三岔路口問答遊戲", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '20px Arial';
    ctx.fillText("按下方按鍵開始遊戲"<br>"手機請橫屏遊玩", canvas.width / 2, canvas.height / 2 + 20);
}

// 遊戲迴圈
function gameLoop() {
    if (gameState === 'loading') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("載入中...", canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad();
    drawButton("重新開始", restartButton.x, restartButton.y, restartButton.width, restartButton.height, '#3498db');
    drawScore();

    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'moving') {
        drawCar();
        if (questionIndex >= allQuestions.length) {
            gameState = 'gameComplete';
        } else if (car.y <= questionTriggerY) {
            currentQuestion = allQuestions[questionIndex];
            currentQuestion.shuffledOptions = shuffleArray([...currentQuestion.options]);
            gameState = 'question';
            car.y = questionTriggerY;
        } else {
            car.y -= car.speed;
        }
    } else if (gameState === 'question') {
        drawCar();
        drawQuestion();
    } else if (gameState === 'result') {
        drawCar();
        drawQuestion();
        drawResult();
    } else if (gameState === 'gameComplete') {
        drawCar();
        drawGameComplete();
    }

    requestAnimationFrame(gameLoop);
}

// 處理玩家輸入的統一函式
function handlePlayerInput(direction) {
    if (gameState === 'start') {
        gameState = 'moving';
        return;
    }

    if (gameState === 'moving') {
        if (direction === 'up') car.y -= car.speed;
        else if (direction === 'down') car.y += car.speed;
        else if (direction === 'left') { car.x -= car.speed; car.angle = -Math.PI / 12; }
        else if (direction === 'right') { car.x += car.speed; car.angle = Math.PI / 12; }
    } else if (gameState === 'question') {
        let playerChoice = null;
        if (direction === 'left') playerChoice = currentQuestion.shuffledOptions[0];
        else if (direction === 'up') playerChoice = currentQuestion.shuffledOptions[1];
        else if (direction === 'right') playerChoice = currentQuestion.shuffledOptions[2];

        if (playerChoice) {
            isAnswerCorrect = (playerChoice === currentQuestion.correctAnswer);
            gameState = 'result';
            
            setTimeout(() => {
                if (isAnswerCorrect) {
                    score += 20;
                }
                questionIndex++;
                car.y = canvas.height - 100;
                
                if (questionIndex === allQuestions.length) {
                    gameState = 'gameComplete';
                } else {
                    gameState = 'moving';
                }
            }, 1000);
        }
    }
}

// 鍵盤事件監聽器
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') handlePlayerInput('up');
    else if (e.key === 'ArrowDown') handlePlayerInput('down');
    else if (e.key === 'ArrowLeft') handlePlayerInput('left');
    else if (e.key === 'ArrowRight') handlePlayerInput('right');
});

document.addEventListener('keyup', (e) => {
    if (gameState === 'moving') {
        car.angle = 0;
    }
});

// 虛擬按鈕事件監聽器
if (upButton && leftButton && rightButton) {
    upButton.addEventListener('mousedown', () => handlePlayerInput('up'));
    leftButton.addEventListener('mousedown', () => handlePlayerInput('left'));
    rightButton.addEventListener('mousedown', () => handlePlayerInput('right'));
    
    // 讓按鈕放開時重置角度
    leftButton.addEventListener('mouseup', () => car.angle = 0);
    rightButton.addEventListener('mouseup', () => car.angle = 0);
    
    // 考慮手機觸控事件
    upButton.addEventListener('touchstart', (e) => { e.preventDefault(); handlePlayerInput('up'); });
    leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); handlePlayerInput('left'); });
    rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); handlePlayerInput('right'); });
    
    leftButton.addEventListener('touchend', (e) => { e.preventDefault(); car.angle = 0; });
    rightButton.addEventListener('touchend', (e) => { e.preventDefault(); car.angle = 0; });
}

// 點擊事件監聽器 (用於重新開始按鈕)
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (mouseX >= restartButton.x && mouseX <= restartButton.x + restartButton.width &&
        mouseY >= restartButton.y && mouseY <= restartButton.y + restartButton.height) {
        resetGame();
    }
    if (gameState === 'gameComplete' &&
        mouseX >= playAgainButton.x && mouseX <= playAgainButton.x + playAgainButton.width &&
        mouseY >= playAgainButton.y && mouseY <= playAgainButton.y + playAgainButton.height) {
        resetGame();
    }
});

// 啟動遊戲迴圈與資源載入
gameLoop();
loadAssets();





