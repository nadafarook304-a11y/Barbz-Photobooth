let layout = 0;
let photosTaken = 0;
let totalPhotos = 0;
let stream;
let filterStyle = "none";
let finalImages = [];
let frameColor = "#ff69b4"; // Defaulting to pink

const challenges = ["Big sparkle smile ✨", "Fierce diva look 💅", "Blow a kiss 💋", "Wink at the camera 😉"];

const coinBtn = document.getElementById("coinBtn");
const frameSelect = document.getElementById("frameSelect");
const layoutSelect = document.getElementById("layoutSelect");
const challengeBox = document.getElementById("challengeBox");
const challengeText = document.getElementById("challengeText");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const countdownEl = document.getElementById("countdown");
const cameraSection = document.getElementById("cameraSection");
const result = document.getElementById("result");
const photosDiv = document.getElementById("photos");

coinBtn.addEventListener("click", async () => {
  coinBtn.classList.add("hidden");
  frameSelect.classList.remove("hidden");
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
});

function setFilter(style) {
  filterStyle = style;
  video.style.filter = style;
  frameSelect.classList.add("hidden");
  layoutSelect.classList.remove("hidden");
}

function setLayout(number) {
  layout = number;
  totalPhotos = number;
  layoutSelect.classList.add("hidden");
  cameraSection.classList.remove("hidden");
  showChallenge();
}

function showChallenge() {
  challengeText.innerText = challenges[Math.floor(Math.random() * challenges.length)];
  challengeBox.classList.remove("hidden");
}

function startCountdown() {
  challengeBox.classList.add("hidden");
  let count = 3;
  countdownEl.innerText = count;

  // Add the animation class
  countdownEl.classList.add("dramatic-animation");

  const interval = setInterval(() => {
    count--;
    
    if (count > 0) {
      countdownEl.innerText = count;
      
      // Reset animation: remove class, force reflow, re-add class
      countdownEl.classList.remove("dramatic-animation");
      void countdownEl.offsetWidth; // This line "restarts" the animation
      countdownEl.classList.add("dramatic-animation");
      
    } else {
      clearInterval(interval);
      countdownEl.innerText = "";
      takePhoto();
    }
  }, 1000);
}


function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.filter = filterStyle;
  ctx.drawImage(video, 0, 0);
  finalImages.push(canvas.toDataURL("image/png"));
  photosTaken++;
  if (photosTaken < totalPhotos) {
    showChallenge();
  } else {
    finishSession();
  }
}

function finishSession() {
  cameraSection.classList.add("hidden");
  stream.getTracks().forEach(track => track.stop());
  
  // Vibrant colors ONLY - No white!
  const colors = ["#f4c2c2","#ecb1c6"]; 
  frameColor = colors[Math.floor(Math.random() * colors.length)];
  
  photosDiv.style.background = frameColor;
  finalImages.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    photosDiv.appendChild(img);
  });
  result.classList.remove("hidden");
}

async function downloadFinal() {
  const imgWidth = 320;
  const imgHeight = 240;
  const padding = 30;
  const gap = 15;

  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });

  const loadedImages = await Promise.all(finalImages.map(src => loadImage(src)));
  const stripCanvas = document.createElement("canvas");
  const ctx = stripCanvas.getContext("2d");

  stripCanvas.width = imgWidth + (padding * 2);
  stripCanvas.height = padding + (imgHeight * loadedImages.length) + (gap * (loadedImages.length - 1)) + padding;

  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

  loadedImages.forEach((img, index) => {
    const yPos = padding + (index * (imgHeight + gap));
    ctx.drawImage(img, padding, yPos, imgWidth, imgHeight);
  });

  const link = document.createElement("a");
  link.href = stripCanvas.toDataURL("image/png");
  link.download = "BARBZ-photo-strip.png";
  link.click();
}