const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dogeImg = document.getElementById("dogeRocket");
const shibaImg = document.getElementById("shibaRocket");

let apiCount = 0;
let lastApiTime = null;
let apiOnline = false;

let dogeStart = null;
let shibaStart = null;

let currentPrice = { doge: 0, shiba: 0 };
let targetDelta = { doge: 0, shiba: 0 };
let currentDelta = { doge: 0, shiba: 0 };

const SPEED_FACTOR = 300;
const ANIMATION_STEPS = 50;
let animationTick = 0;

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById("clock").textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

function fetchPrices() {
  fetch("https://api.coingecko.com/api/v3/simple/price?ids=dogecoin,shiba-inu&vs_currencies=usd")
    .then(res => res.json())
    .then(data => {
      apiOnline = true;
      lastApiTime = Date.now();
      apiCount++;
      document.getElementById("counter").textContent = `API-Erfolge: ${apiCount}`;

      const doge = data.dogecoin.usd;
      const shiba = data["shiba-inu"].usd;

      if (!dogeStart) dogeStart = doge;
      if (!shibaStart) shibaStart = shiba;

      currentPrice = { doge, shiba };

      targetDelta.doge = ((doge - dogeStart) / dogeStart) * 100;
      targetDelta.shiba = ((shiba - shibaStart) / shibaStart) * 100;

      animationTick = 0;

      document.getElementById("dogeInfo").textContent = `DOGE: Start $${dogeStart.toFixed(4)} | Jetzt $${doge.toFixed(4)} | Δ ${(targetDelta.doge).toFixed(2)}%`;
      document.getElementById("shibaInfo").textContent = `SHIBA: Start $${shibaStart.toFixed(8)} | Jetzt $${shiba.toFixed(8)} | Δ ${(targetDelta.shiba).toFixed(2)}%`;
    })
    .catch(() => {
      apiOnline = false;
    });
}

setInterval(fetchPrices, 5000);
fetchPrices();

function animate() {
  animationTick = Math.min(animationTick + 1, ANIMATION_STEPS);
  const progress = animationTick / ANIMATION_STEPS;

  currentDelta.doge += (targetDelta.doge - currentDelta.doge) * 0.1;
  currentDelta.shiba += (targetDelta.shiba - currentDelta.shiba) * 0.1;

  draw();
  requestAnimationFrame(animate);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#336699";
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px monospace";
  for (let i = 0; i <= 10; i++) {
    let y = 500 - i * 50;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(360, y);
    ctx.stroke();
    ctx.fillText("+" + i + "%", 5, y + 4);
  }

  const dogeY = 500 - (currentDelta.doge * SPEED_FACTOR / 100);
  const shibaY = 500 - (currentDelta.shiba * SPEED_FACTOR / 100);

  ctx.drawImage(dogeImg, 100, dogeY, 32, 48);
  ctx.drawImage(shibaImg, 250, shibaY, 32, 48);

  document.getElementById("status").textContent =
    apiOnline
      ? `API-Status: 🟢 ${Math.floor((Date.now() - lastApiTime) / 1000)}s alt`
      : `API-Status: 🔴 Keine Verbindung`;
}

animate();
