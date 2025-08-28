<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小小卡丁車問答遊戲</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #34495e;
            font-family: Arial, sans-serif;
        }
        canvas {
            background-color: #2c3e50;
            border: 5px solid #bdc3c7;
        }
    </style>
</head>
<body>

<canvas id="gameCanvas" width="800" height="600"></canvas>

<script>
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
roadImage.src = 'road.png';
const carImage = new Image();
carImage.src = 'car.png';

let imagesLoadedCount = 0;
const totalImagesToLoad = 2;

function imageLoaded() {
    imagesLoadedCount++;
    if (imagesLoadedCount === totalImagesToLoad) {
        gameState = 'start';
    }
}

roadImage.onload = imageLoaded;
carImage.onload = imageLoaded;
roadImage.onerror = () => { console.error("道路圖片載入失敗。"); imageLoaded(); };
carImage.onerror = () => { console.error("卡丁車圖片載入失敗。"); imageLoaded(); };

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
        question: "小小孩開小小卡丁車的好處?",
        options: ["訓練專注力與判斷力", "訓練動作協調與核心控制", "以上皆是"],
        correctAnswer: "以上皆是"
    }
];

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
    ctx.fillText(currentQuestion.shuffledOptions[2], canvas.width / 2 + 200, canvas.height / 3
