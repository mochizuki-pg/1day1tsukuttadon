const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const answerCanvas = document.getElementById("answerCanvas");
const answerCtx = answerCanvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const finishBtn = document.getElementById("finishBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreDisplay = document.getElementById("score");
const messageDisplay = document.getElementById("message");

canvas.width = 800;
canvas.height = 800;
answerCanvas.width = 400;
answerCanvas.height = 400;

const correctPositions = {
  leftEye: { x: 320, y: 370 },
  rightEye: { x: 480, y: 370 },
  mouth: { x: 400, y: 505 },
  leftCheek: { x: 280, y: 480 },
  rightCheek: { x: 520, y: 480 },
};

const parts = [
  { id: "leftEye", x: 150, y: 700, type: "eye", correctX: 320, correctY: 370 },
  { id: "rightEye", x: 280, y: 700, type: "eye", correctX: 480, correctY: 370 },
  { id: "mouth", x: 400, y: 700, type: "mouth", correctX: 400, correctY: 505 },
  { id: "leftCheek", x: 520, y: 700, type: "cheek", correctX: 280, correctY: 480 },
  { id: "rightCheek", x: 650, y: 700, type: "cheek", correctX: 520, correctY: 480 },
];

let draggedPart = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let gameState = "ready";
let score = 0;

const stars = [];
for (let i = 0; i < 1; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * 150 + 150,
    speed: Math.random() * 5 + 4,
    opacity: Math.random() * 0.7 + 0.5,
  });
}

function drawBackground() {
  ctx.fillStyle = "#493f82";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of stars) {
    const gradient = ctx.createLinearGradient(
      star.x,
      star.y,
      star.x - star.length,
      star.y - star.length * 0.5
    );
    gradient.addColorStop(0, `rgba(255, 217, 0, ${star.opacity})`);
    gradient.addColorStop(1, "rgba(255, 217, 0, 0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 217, 0, ${star.opacity})`;
    ctx.beginPath();
    const starSize = 20;
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = star.x + Math.cos(angle) * starSize;
      const y = star.y + Math.sin(angle) * starSize;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      const innerAngle = angle + Math.PI / 5;
      const innerX = star.x + Math.cos(innerAngle) * (starSize * 0.4);
      const innerY = star.y + Math.sin(innerAngle) * (starSize * 0.4);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();

    star.x += star.speed;
    star.y += star.speed * 0.5;

    if (star.x > canvas.width + star.length || star.y > canvas.height + star.length) {
      star.x = Math.random() * canvas.width * 0.3 - star.length;
      star.y = Math.random() * canvas.height * 0.3 - star.length;
      star.length = Math.random() * 150 + 150;
      star.speed = Math.random() * 5 + 4;
      star.opacity = Math.random() * 0.7 + 0.5;
    }
  }
}

function drawPlanet(cx, cy, r) {
  ctx.fillStyle = "#8be8e2";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.stroke();
}

function drawRing(cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.3);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 35;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6 + 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6 - 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawEye(cx, cy, hidden = false) {
  if (hidden) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, cy);
    return;
  }

  const eyeR = 60;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(cx, cy, eyeR * 0.75, eyeR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.stroke();

  const irisRX = eyeR * 0.5;
  const irisRY = eyeR * 0.7;
  const pupilRX = eyeR * 0.28;
  const pupilRY = eyeR * 0.4;

  ctx.fillStyle = "#ff6347";
  ctx.beginPath();
  ctx.ellipse(cx, cy, irisRX, irisRY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(cx, cy, pupilRX, pupilRY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - pupilRX * 0.7, cy - pupilRY * 0.5, eyeR * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawMouth(cx, cy, hidden = false) {
  if (hidden) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, cy);
    return;
  }

  const mouthW = 180;

  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy - 10, mouthW / 2, 0, Math.PI);
  ctx.stroke();
}

function drawCheek(cx, cy, hidden = false) {
  if (hidden) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, cy);
    return;
  }

  ctx.fillStyle = "rgba(255,105,135,0.9)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 50, 24, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCorrectMarker(cx, cy, type) {
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 6;
  ctx.setLineDash([8, 5]);
  const r = type === "eye" ? 70 : type === "cheek" ? 55 : 100;
  ctx.beginPath();
  if (type === "eye") {
    ctx.ellipse(cx, cy, 45, 60, 0, 0, Math.PI * 2);
  } else if (type === "cheek") {
    ctx.ellipse(cx, cy, 50, 24, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const planetR = 250;

  drawBackground();
  drawRing(cx, cy, planetR);
  drawPlanet(cx, cy, planetR);

  if (gameState === "finished") {
    for (const partId in correctPositions) {
      const pos = correctPositions[partId];
      const part = parts.find(p => p.id === partId);
      drawCorrectMarker(pos.x, pos.y, part.type);
    }
  }

  const hidden = gameState === "playing";

  for (const part of parts) {
    if (part.type === "eye") {
      drawEye(part.x, part.y, hidden);
    } else if (part.type === "mouth") {
      drawMouth(part.x, part.y, hidden);
    } else if (part.type === "cheek") {
      drawCheek(part.x, part.y, hidden);
    }
  }

  if (gameState === "ready") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("スタートボタンを押してね！", canvas.width / 2, canvas.height / 2);
  }
}

function calculateScore() {
  let totalScore = 0;
  const maxDistance = 100;

  for (const part of parts) {
    const dx = part.x - part.correctX;
    const dy = part.y - part.correctY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const partScore = Math.max(0, Math.round((1 - distance / maxDistance) * 100));
    totalScore += partScore;
  }

  return Math.max(0, Math.round(totalScore / parts.length));
}

function getScoreMessage(score) {
  if (score >= 90) return "完璧！天才！";
  if (score >= 80) return "すごい！上手！";
  if (score >= 70) return "いい感じ！";
  if (score >= 60) return "まあまあ！";
  if (score >= 50) return "もう少し！";
  return "もう一回やってみよう！";
}

function startGame() {
  gameState = "playing";
  parts.forEach((part) => {
    part.x = Math.random() * (canvas.width - 100) + 50;
    part.y = Math.random() * (canvas.height - 100) + 50;
  });
  score = 0;
  scoreDisplay.textContent = "";
  messageDisplay.textContent = "";
  startBtn.disabled = true;
  finishBtn.disabled = false;
  resetBtn.disabled = false;
}

function finishGame() {
  gameState = "finished";
  score = calculateScore();
  scoreDisplay.textContent = `${score}点`;
  messageDisplay.textContent = getScoreMessage(score);
  finishBtn.disabled = true;
}

function resetGame() {
  gameState = "ready";
  parts.forEach((part, index) => {
    part.x = 150 + index * 130;
    part.y = 700;
  });
  score = 0;
  scoreDisplay.textContent = "";
  messageDisplay.textContent = "";
  startBtn.disabled = false;
  finishBtn.disabled = true;
  resetBtn.disabled = true;
}

function getPartAt(x, y) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const dx = x - part.x;
    const dy = y - part.y;
    const hitRadius = gameState === "playing" ? 50 : (part.type === "eye" ? 60 : part.type === "cheek" ? 50 : 90);

    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      return part;
    }
  }
  return null;
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener("mousedown", (e) => {
  if (gameState !== "playing") return;

  const pos = getMousePos(e);
  const part = getPartAt(pos.x, pos.y);
  if (part) {
    draggedPart = part;
    dragOffsetX = pos.x - part.x;
    dragOffsetY = pos.y - part.y;
    canvas.style.cursor = "grabbing";
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (gameState !== "playing") return;

  const pos = getMousePos(e);

  if (draggedPart) {
    draggedPart.x = pos.x - dragOffsetX;
    draggedPart.y = pos.y - dragOffsetY;
  } else {
    const part = getPartAt(pos.x, pos.y);
    canvas.style.cursor = part ? "grab" : "default";
  }
});

canvas.addEventListener("mouseup", () => {
  draggedPart = null;
  canvas.style.cursor = "default";
});

canvas.addEventListener("mouseleave", () => {
  draggedPart = null;
  canvas.style.cursor = "default";
});

canvas.addEventListener("touchstart", (e) => {
  if (gameState !== "playing") return;

  e.preventDefault();
  const touch = e.touches[0];
  const pos = getMousePos(touch);
  const part = getPartAt(pos.x, pos.y);
  if (part) {
    draggedPart = part;
    dragOffsetX = pos.x - part.x;
    dragOffsetY = pos.y - part.y;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (gameState !== "playing") return;

  e.preventDefault();
  if (draggedPart) {
    const touch = e.touches[0];
    const pos = getMousePos(touch);
    draggedPart.x = pos.x - dragOffsetX;
    draggedPart.y = pos.y - dragOffsetY;
  }
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  draggedPart = null;
});

startBtn.addEventListener("click", startGame);
finishBtn.addEventListener("click", finishGame);
resetBtn.addEventListener("click", resetGame);

function drawAnswerImage() {
  const scale = 0.5;
  const cx = answerCanvas.width / 2;
  const cy = answerCanvas.height / 2;
  const planetR = 125;

  answerCtx.fillStyle = "#493f82";
  answerCtx.fillRect(0, 0, answerCanvas.width, answerCanvas.height);

  answerCtx.save();
  answerCtx.translate(cx, cy);
  answerCtx.scale(1, 0.3);
  answerCtx.strokeStyle = "#ffffff";
  answerCtx.lineWidth = 17.5;
  answerCtx.beginPath();
  answerCtx.arc(0, 0, planetR * 1.6, 0, Math.PI * 2);
  answerCtx.stroke();
  answerCtx.strokeStyle = "#000000";
  answerCtx.lineWidth = 4;
  answerCtx.beginPath();
  answerCtx.arc(0, 0, planetR * 1.6 + 8.5, 0, Math.PI * 2);
  answerCtx.stroke();
  answerCtx.beginPath();
  answerCtx.arc(0, 0, planetR * 1.6 - 8.5, 0, Math.PI * 2);
  answerCtx.stroke();
  answerCtx.restore();

  answerCtx.fillStyle = "#8be8e2";
  answerCtx.beginPath();
  answerCtx.arc(cx, cy, planetR, 0, Math.PI * 2);
  answerCtx.fill();
  answerCtx.strokeStyle = "#000000";
  answerCtx.lineWidth = 4;
  answerCtx.stroke();

  const leftEyeX = 320 * scale;
  const leftEyeY = 370 * scale;
  const rightEyeX = 480 * scale;
  const rightEyeY = 370 * scale;
  const mouthX = 400 * scale;
  const mouthY = 505 * scale;
  const leftCheekX = 280 * scale;
  const leftCheekY = 480 * scale;
  const rightCheekX = 520 * scale;
  const rightCheekY = 480 * scale;

  const eyeR = 30;

  answerCtx.fillStyle = "#ffffff";
  answerCtx.beginPath();
  answerCtx.ellipse(leftEyeX, leftEyeY, eyeR * 0.75, eyeR, 0, 0, Math.PI * 2);
  answerCtx.fill();
  answerCtx.strokeStyle = "#000000";
  answerCtx.lineWidth = 4;
  answerCtx.stroke();

  answerCtx.fillStyle = "#ffffff";
  answerCtx.beginPath();
  answerCtx.ellipse(rightEyeX, rightEyeY, eyeR * 0.75, eyeR, 0, 0, Math.PI * 2);
  answerCtx.fill();
  answerCtx.strokeStyle = "#000000";
  answerCtx.lineWidth = 4;
  answerCtx.stroke();

  const irisRX = eyeR * 0.5;
  const irisRY = eyeR * 0.7;
  const pupilRX = eyeR * 0.28;
  const pupilRY = eyeR * 0.4;

  [leftEyeX, rightEyeX].forEach((x, i) => {
    const y = i === 0 ? leftEyeY : rightEyeY;
    answerCtx.fillStyle = "#ff6347";
    answerCtx.beginPath();
    answerCtx.ellipse(x, y, irisRX, irisRY, 0, 0, Math.PI * 2);
    answerCtx.fill();

    answerCtx.fillStyle = "#000000";
    answerCtx.beginPath();
    answerCtx.ellipse(x, y, pupilRX, pupilRY, 0, 0, Math.PI * 2);
    answerCtx.fill();

    answerCtx.fillStyle = "#ffffff";
    answerCtx.beginPath();
    answerCtx.arc(x - pupilRX * 0.7, y - pupilRY * 0.5, eyeR * 0.2, 0, Math.PI * 2);
    answerCtx.fill();
  });

  const mouthW = 90;

  answerCtx.strokeStyle = "#333333";
  answerCtx.lineWidth = 6;
  answerCtx.lineCap = "round";
  answerCtx.beginPath();
  answerCtx.arc(mouthX, mouthY - 5, mouthW / 2, 0, Math.PI);
  answerCtx.stroke();

  answerCtx.fillStyle = "rgba(255,105,135,0.9)";
  answerCtx.beginPath();
  answerCtx.ellipse(leftCheekX, leftCheekY, 25, 12, 0, 0, Math.PI * 2);
  answerCtx.ellipse(rightCheekX, rightCheekY, 25, 12, 0, 0, Math.PI * 2);
  answerCtx.fill();
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

drawAnswerImage();
animate();
