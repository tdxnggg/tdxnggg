// ==========================================================
// CẤU HÌNH & KHỞI TẠO HỆ THỐNG
// ==========================================================
const youtubeVideoId = 'gJAbDSse5WM';
let player;
let apiReady = false;

// Tùy chỉnh Tên bài hát & Nghệ sĩ hiển thị trên Widget
const songTitle = "Tìm Em"; 
const songArtist = "Hngle ft. Bảo Anh";

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

// ==========================================================
// 1. HIỆU ỨNG TYPEWRITER (ABOUT ME)
// ==========================================================
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

// ==========================================================
// 2. CÁC HÀM XỬ LÝ CHÍNH & VÀO GIAO DIỆN
// ==========================================================
window.addEventListener('load', () => {
    // Lắng nghe thời gian thực để cập nhật số lượt xem hiển thị trên giao diện chính
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
    document.body.style.overflow = 'hidden'; // Giữ cố định màn hình tránh thanh cuộn
    container.classList.add('active');

    // Kích hoạt Typewriter khi vào web
    typeWriter();

    // Đồng bộ kích hoạt phát nhạc ẩn và kích hoạt đĩa nhạc xoay tròn
    if (apiReady && player) {
        player.playVideo();
        const musicWidget = document.getElementById('music-widget');
        if (musicWidget) {
            musicWidget.classList.add('playing');
            document.getElementById('track-title').innerText = songTitle;
            document.getElementById('track-artist').innerText = songArtist;
        }
    }

    increaseVisitorCount(); 
}

// HÀM KIỂM TRA ĐỊA CHỈ IP ĐỘC NHẤT ĐÃ ĐƯỢC CHỈNH SỬA
function increaseVisitorCount() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            // Thay thế tất cả dấu chấm (.) trong chuỗi IP thành dấu gạch dưới (_) để làm key hợp lệ trong Firebase
            const userIP = data.ip.replace(/\./g, '_');
            const ipRef = database.ref('visited_ips/' + userIP);

            // Kiểm tra xem IP này đã từng vào trang web của bạn chưa
            ipRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    // Nếu IP này đã tồn tại trong node 'visited_ips', dừng xử lý và KHÔNG tăng bộ đếm
                    console.log("IP đã tồn tại. Bỏ qua ghi nhận để tránh lặp dữ liệu.");
                } else {
                    // Nếu là IP mới hoàn toàn:
                    // 1. Lưu IP này thành một Key duy nhất trên Firebase Console để đánh dấu
                    ipRef.set(true);

                    // 2. Tăng tổng lượt truy cập thực tế lên 1 đơn vị bằng cơ chế Transaction an toàn
                    counterRef.transaction((currentCount) => (currentCount || 0) + 1);
                }
            });
        })
        .catch((error) => {
            console.error("Lỗi lấy IP, hệ thống chuyển sang chế độ fallback an toàn:", error);
        });
}

// ==========================================================
// 3. ĐIỀU KHIỂN ĐÓNG / MỞ KHUNG SIDE PANEL MỚI
// ==========================================================
function togglePanel(side, isOpen) {
    const panel = document.getElementById(`${side}-panel`);
    const bodyClass = `${side}-panel-open`;

    if (isOpen) {
        // Nếu mở bên này thì tự động thu panel bên kia lại để tránh đè giao diện
        const otherSide = side === 'left' ? 'right' : 'left';
        document.getElementById(`${otherSide}-panel`).classList.remove('active');
        document.body.classList.remove(`${otherSide}-panel-open`);

        panel.classList.add('active');
        document.body.classList.add(bodyClass);
    } else {
        panel.classList.remove('active');
        document.body.classList.remove(bodyClass);
    }
}

// ==========================================================
// 4. TRÌNH PHÁT NHẠC YOUTUBE API & ĐỒNG BỘ ĐĨA XOAY MỚI
// ==========================================================
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        videoId: youtubeVideoId,
        playerVars: { 
            'autoplay': 0, 
            'controls': 0, 
            'loop': 1, 
            'playlist': youtubeVideoId,
            'disablekb': 1,
            'modestbranding': 1,
            'rel': 0
        },
        events: { 
            'onReady': () => { 
                apiReady = true; 
                document.getElementById('enter-btn').style.display = 'block'; 
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

// Theo dõi trạng thái player để kích hoạt hiệu ứng xoay đĩa CSS trực quan
function onPlayerStateChange(event) {
    const musicWidget = document.getElementById('music-widget');
    if (!musicWidget) return;

    if (event.data === YT.PlayerState.PLAYING) {
        musicWidget.classList.add('playing');
        document.getElementById('track-title').innerText = songTitle;
        document.getElementById('track-artist').innerText = songArtist;
    } else {
        musicWidget.classList.remove('playing');
    }
}

function toggleMusic() {
    if (!player || !apiReady) return;

    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

// ==========================================================
// 5. HIỆU ỨNG VỆT SÁNG & HẠT BACKGROUND NÉ CHUỘT CAO CẤP
// ==========================================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const mouseGlow = document.getElementById('mouse-glow');
let particlesArray = [];

const mouse = {
    x: null,
    y: null,
    radius: 130 // Khoảng cách đẩy hạt ra xa chuột (tính bằng pixel)
};

// Cập nhật tọa độ di chuột cho hạt né và đẩy div vệt sáng theo con trỏ
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    if (mouseGlow) {
        mouseGlow.style.left = mouse.x + 'px';
        mouseGlow.style.top = mouse.y + 'px';
    }
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x; // Lưu vị trí tọa độ gốc ban đầu
        this.baseY = this.y;
        this.size = Math.random() * 1.5 + 0.6;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.4 - 0.3; // Chuyển động bay lên mờ ảo
        this.alpha = Math.random() * 0.5 + 0.2;
        this.density = (Math.random() * 20) + 10; // Trọng lượng phản hồi của hạt
    }
    update() {
        // Tự động trôi theo trục giống code cũ
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        if (this.baseY < 0) this.baseY = canvas.height;
        if (this.baseX < 0 || this.baseX > canvas.width) this.baseX = Math.random() * canvas.width;

        // Xử lý thuật toán đẩy hạt né xa con trỏ chuột
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                this.x -= directionX;
                this.y -= directionY;
                return; // Bỏ qua phần trả hạt về vị trí cũ khi đang né
            }
        }

        // Quay trở lại quỹ đạo trôi tự nhiên mượt mà khi không có chuột ở gần
        if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 12;
        }
        if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 12;
        }
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
    particlesArray = [];
    // Tăng mật độ lên một chút (65 hạt) để hiệu ứng né chuột nhìn rõ nét và đẹp mắt nhất
    for (let i = 0; i < 65; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}

// Khởi tạo và chạy Canvas
initParticles();
animateParticles();

// ==========================================================
// 6. CLICK TỰ ĐỘNG COPY DISCORD USERNAME
// ==========================================================
function copyDiscordName(username) {
    navigator.clipboard.writeText(username).then(() => {
        const tooltip = document.getElementById('discordTooltip');
        if (tooltip) {
            tooltip.innerText = "Đã sao chép!";
            tooltip.style.opacity = "1";
            tooltip.style.visibility = "visible";
            setTimeout(() => { 
                tooltip.innerText = "Click để copy"; 
                tooltip.style.opacity = ""; 
                tooltip.style.visibility = ""; 
            }, 2000);
        }
    });
}
