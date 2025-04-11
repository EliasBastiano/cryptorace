const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let dogeY = 500;
let shibaY = 500;

let lastPrices = { doge: null, shiba: null };
let currentPrices = { doge: 0, shiba: 0 };

let lastApiTime = null;
let blink = false;

const dogeImg = document.getElementById('dogeRocket');
const shibaImg = document.getElementById('shibaRocket');

let apiOnline = false;
const SPEED_FACTOR = 200;
const MIN_STEP = 1;

setInterval(() => (blink = !blink), 500); // Umschalten für Blinken

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

function drawBackground() {
  ctx.fillStyle = '#001133';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#003366';
  ctx.lineWidth = 1;
  ctx.font = "12px monospace";
  ctx.fillStyle = "white";

  for (let i = 0; i <= 10; i += 2) {
    const y = 500 - (i * 50);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(360, y);
    ctx.stroke();
    ctx.fillText(`+${i}%`, 5, y + 5);
  }

  ctx.fillText("🏁 Ziel", 300, 20);
  ctx.fillText("Start", 300, 495);

  ctx.fillStyle = apiOnline ? "lime" : "red";
  ctx.beginPath();
  ctx.arc(390, 20, 6, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "white";
  if (lastApiTime) {
    const secondsAgo = Math.floor((Date.now() - lastApiTime) / 1000);
    ctx.fillText(`API: ${secondsAgo}s alt`, 290, 40);
  }

  // Seitenanzeige links
  ctx.font = "11px monospace";
  ctx.fillText(`DOGE alt: $${lastPrices.doge ? lastPrices.doge.toFixed(4) : '---'}`, 10, 540);
  ctx.fillText(`DOGE neu: $${currentPrices.doge.toFixed(4)}`, 10, 555);
  ctx.fillText(`SHIBA alt: $${lastPrices.shiba ? lastPrices.shiba.toFixed(8) : '---'}`, 10, 575);
  ctx.fillText(`SHIBA neu: $${currentPrices.shiba.toFixed(8)}`, 10, 590);
}

async function fetchPricesWithRetry(retry = 1) {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=dogecoin,shiba-inu&vs_currencies=usd');
    const data = await res.json();
    apiOnline = true;
    lastApiTime = Date.now();
    return {
      doge: data.dogecoin.usd,
      shiba: data['shiba-inu'].usd
    };
  } catch (e) {
    console.warn("API-Fehler", e);
    apiOnline = false;
    if (retry < 5) {
      await new Promise(r => setTimeout(r, 1000));
      return await fetchPricesWithRetry(retry + 1);
    } else {
      return lastPrices;
    }
  }
}

async function update() {
  const prices = await fetchPricesWithRetry();
  if (prices) {
    currentPrices = prices;

    if (lastPrices.doge && lastPrices.shiba) {
      let dogeChange = ((prices.doge - lastPrices.doge) / lastPrices.doge) * 100;
      let shibaChange = ((prices.shiba - lastPrices.shiba) / lastPrices.shiba) * 100;

      let dogeStep = dogeChange * SPEED_FACTOR;
      let shibaStep = shibaChange * SPEED_FACTOR;

      if (Math.abs(dogeStep) > 0 && Math.abs(dogeStep) < MIN_STEP) dogeStep = Math.sign(dogeStep) * MIN_STEP;
      if (Math.abs(shibaStep) > 0 && Math.abs(shibaStep) < MIN_STEP) shibaStep = Math.sign(shibaStep) * MIN_STEP;

      dogeY -= dogeStep;
      shibaY -= shibaStep;

      dogeY = Math.max(Math.min(dogeY, 500), 0);
      shibaY = Math.max(Math.min(shibaY, 500), 0);
    }

    lastPrices = prices;
  }

  drawBackground();

  // Raketen + Blinken bei Stillstand
  if (blink || currentPrices.doge !== lastPrices.doge) {
    ctx.drawImage(dogeImg, 100, dogeY, 32, 48);
  }
  if (blink || currentPrices.shiba !== lastPrices.shiba) {
    ctx.drawImage(shibaImg, 250, shibaY, 32, 48);
  }

  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.fillText(`DOGE: $${currentPrices.doge.toFixed(4)}`, 80, dogeY - 10);
  ctx.fillText(`SHIBA: $${currentPrices.shiba.toFixed(8)}`, 230, shibaY - 10);

  setTimeout(update, 1000);
}

update();
