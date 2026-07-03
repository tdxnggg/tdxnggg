// nhạc YouTube 
const youtubeVideoId = 'gJAbDSse5WM'; 

var player;
var apiReady = false;

/* 1. XỬ LÝ MÀN HÌNH CHÀO (LOADING SCREEN) & AUTOPLAY */
window.addEventListener('load', () => {
    // Đợi 2 giây cho thanh bar chạy xong hiệu ứng load 
    setTimeout(() => {
        // Kiểm tra nếu YouTube đã load xong ngầm trước đó thì hiện nút ngay, 
        // nếu chưa xong thì hàm onPlayerReady bên dưới sẽ đảm nhận việc hiện nút.
        if (apiReady) {
            document.getElementById('enter-btn').style.display = 'block';
        }
    }, 2000); 
});

// kích hoạt khi người dùng bấm vào nút "Khám phá ngay"
function startPortfolio() {
    const loader = document.getElementById('loader');
    const container = document.querySelector('.container');
    
    // Ẩn màn hình chào đi mượt mà
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
    
    // Kích hoạt hiệu ứng xuất hiện mịn màng cho Linktree
    container.classList.add('active');

    // AUTOPLAY
    if (apiReady && player) {
        player.playVideo();
        // Cập nhật giao diện nút điều khiển nhạc ở màn hình chính thành trạng thái đang phát
        document.getElementById('musicText').innerText = "Tắt Nhạc";
        document.getElementById('musicIcon').className = "fas fa-pause";
    }
    handleVisitorCounter(); 
}

/* 2. SỬ DỤNG YOUTUBE API PHÁT NHẠC KHÔNG QUẢNG CÁO */
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: youtubeVideoId,
        playerVars: {
            'autoplay': 0, 
            'controls': 0,
            'loop': 1,
            'playlist': youtubeVideoId,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    apiReady = true;
    // Đảm bảo nút chỉ xuất hiện khi cả YouTube API sẵn sàng VÀ thanh load đã chạy đủ thời gian
    // (Tránh trường hợp mạng quá nhanh, hiện nút trước khi thanh bar chạy xong nhìn bị lỗi giao diện)
    const loader = document.getElementById('loader');
    if (loader) {
        // Hiện nút "Khám phá ngay"
        document.getElementById('enter-btn').style.display = 'block';
    }
}

// Chức năng Bật/Tắt nhạc chủ động của nút bấm ở màn hình chính
function toggleMusic() {
    if (!player || !apiReady) return;
    
    // Lấy trạng thái hiện tại từ chính YouTube Player (1 có nghĩa là đang phát)
    var state = player.getPlayerState();
    const musicIcon = document.getElementById('musicIcon');
    const musicText = document.getElementById('musicText');

    if (state === 1) { 
        player.pauseVideo(); 
        musicText.innerText = "Bật Nhạc";
        musicIcon.className = "fas fa-music";
    } else { 
        player.playVideo(); 
        musicText.innerText = "Tắt Nhạc";
        musicIcon.className = "fas fa-pause";
    }
}

/* 3. HIỆU ỨNG HẠT BỤI BAY LƠ LỬNG (PARTICLE EFFECT) */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 45; 

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

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
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < 0) this.y = canvas.height;
        if (this.x < 0 || this.x > canvas.width) this.x = Math.random() * canvas.width;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

/* 4. CHỨC NĂNG CLICK TỰ ĐỘNG COPY USERNAME DISCORD */
function copyDiscordName(username) {
    navigator.clipboard.writeText(username).then(() => {
        const tooltip = document.getElementById('discordTooltip');
        tooltip.innerText = "Đã sao chép!";
        tooltip.style.background = "#ffffff";
        tooltip.style.color = "#000000";
        
        setTimeout(() => {
            tooltip.innerText = "Click để copy";
        }, 2000);
    }).catch(err => {
        console.error('Không thể copy: ', err);
    });
}
// ==========================================
// CẤU HÌNH VÀ KẾT NỐI GOOGLE FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDEtQJlH3VkckUvvEfsxR0KJX3ZWpUIip8",
  authDomain: "portfolio-84784.firebaseapp.com",
  projectId: "portfolio-84784",
  storageBucket: "portfolio-84784.firebasestorage.app",
  messagingSenderId: "695481380114",
  appId: "1:695481380114:web:188cdab99dc8aac05d57cb",
  measurementId: "G-XPW1WL3ZMX",
  // Tự động suy luận URL Realtime Database dựa theo Project ID
  databaseURL: "https://portfolio-84784-default-rtdb.firebaseio.com" 
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Hàm xử lý đếm lượt truy cập đám mây
function handleVisitorCounter() {
    const counterRef = database.ref('visitor_count');

    // Dùng transaction để tăng số chính xác, phòng trường hợp nhiều người vào cùng một lúc
    counterRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    }, (error, committed, snapshot) => {
        if (committed) {
            // Cập nhật số liệu mới nhất từ Firebase lên màn hình
            const countEl = document.getElementById('count');
            if (countEl) {
                countEl.innerText = snapshot.val().toLocaleString(); // Định dạng dấu phẩy nếu số lớn (VD: 1,000)
            }
        } else {
            console.error("Lỗi đồng bộ bộ đếm với Firebase:", error);
        }
    });
}
