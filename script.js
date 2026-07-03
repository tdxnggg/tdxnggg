// ==========================================
// CẤU HÌNH & KHỞI TẠO
// ==========================================
const youtubeVideoId = 'gJAbDSse5WM';
let player;
let apiReady = false;

const firebaseConfig = {
    apiKey: "AIzaSyCZUBSKGOhA1wCaS64w1lFcNGOGk7L1m_8",
    authDomain: "portfolio-e1c54.firebaseapp.com",
    projectId: "portfolio-e1c54",
    storageBucket: "portfolio-e1c54.firebasestorage.app",
    messagingSenderId: "948969322763",
    appId: "1:948969322763:web:cce48ee0f68c0ac63f0a0e",
    measurementId: "G-QZKEXKWEZ9",
    databaseURL: "https://portfolio-e1c54-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();
const counterRef = database.ref('visitor_count');

// ==========================================
// 1. HIỆU ỨNG TYPEWRITER (ABOUT ME)
// ==========================================
const aboutList = [
    "Love Science",
    "Love Animals",
    "Love Music",
    "Love Programming",
    "Contact Me",
];

let textIndex = 0;
let charIndex = 0;
let deleting = false;

function typeWriter() {
    const typingEl = document.getElementById("typing");
    if (!typingEl) return;

    const currentText = aboutList[textIndex];

    if (!deleting) {
        typingEl.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex >= currentText.length) {
            deleting = true;
            setTimeout(typeWriter, 1800);
            return;
        }
    } else {
        typingEl.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex <= 0) {
            deleting = false;
            textIndex = (textIndex + 1) % aboutList.length;
            charIndex = 0;
        }
    }
    setTimeout(typeWriter, deleting ? 30 : 55);
}

// ==========================================
// 2. CÁC HÀM XỬ LÝ CHÍNH
// ==========================================
window.addEventListener('load', () => {
    counterRef.on('value', (snapshot) => {
        const countEl = document.getElementById('count');
        if (countEl && snapshot.exists()) {
            countEl.innerText = snapshot.val().toLocaleString();
        }
    });
});

function startPortfolio() {
    const loader = document.getElementById('loader');
    const container = document.querySelector('.container');
    
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
    container.classList.add('active');

    // Kích hoạt Typewriter khi vào web
    typeWriter();

    if (apiReady && player) {
        player.playVideo();
        document.getElementById('musicText').innerText = "Tắt Nhạc";
        document.getElementById('musicIcon').className = "fas fa-pause";
    }

    increaseVisitorCount(); 
}

function increaseVisitorCount() {
    counterRef.transaction((currentCount) => (currentCount || 0) + 1);

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            database.ref('visitor_logs').push({
                ip: data.ip,
                timestamp: new Date().toLocaleString()
            });
        }).catch(() => {
            database.ref('visitor_logs').push({
                ip: "Ẩn danh",
                timestamp: new Date().toLocaleString()
            });
        });
}

// ==========================================
// 3. YOUTUBE API & MUSIC CONTROL
// ==========================================
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        videoId: youtubeVideoId,
        playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': youtubeVideoId },
        events: { 'onReady': () => { apiReady = true; document.getElementById('enter-btn').style.display = 'block'; } }
    });
}

function toggleMusic() {
    if (!player || !apiReady) return;
    const musicIcon = document.getElementById('musicIcon');
    const musicText = document.getElementById('musicText');

    if (player.getPlayerState() === 1) {
        player.pauseVideo();
        musicText.innerText = "Bật Nhạc";
        musicIcon.className = "fas fa-music";
    } else {
        player.playVideo();
        musicText.innerText = "Tắt Nhạc";
        musicIcon.className = "fas fa-pause";
    }
}

// ==========================================
// 4. HIỆU ỨNG HẠT & COPY DISCORD
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.4 - 0.3;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.y < 0) this.y = canvas.height;
        if (this.x < 0 || this.x > canvas.width) this.x = Math.random() * canvas.width;
    }
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}

for (let i = 0; i < 45; i++) particlesArray.push(new Particle());
animateParticles();

function copyDiscordName(username) {
    navigator.clipboard.writeText(username).then(() => {
        const tooltip = document.getElementById('discordTooltip');
        tooltip.innerText = "Đã sao chép!";
        tooltip.style.opacity = "1";
        setTimeout(() => { tooltip.innerText = "Click để copy"; tooltip.style.opacity = ""; }, 2000);
    });
}