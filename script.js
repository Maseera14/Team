// ═══════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
themeToggle.addEventListener('click', () => {
    const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
});

// ═══════════════════════════════════════════
//  TOP NAVIGATION
// ═══════════════════════════════════════════
const menuItems    = document.querySelectorAll('.nav-menu li');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle    = document.getElementById('page-title');
const backBtn      = document.getElementById('back-btn');

function showSection(targetId, title) {
    pageSections.forEach(s => s.classList.remove('active-section'));
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active-section');
    // Title is set to permanent brand header "NeuralStack" and not updated dynamically
    // if (title) pageTitle.textContent = title;

    backBtn.classList.toggle('hidden', targetId !== 'profile-section');

    // Re-run parallax on scroll when section changes
    setTimeout(updateParallax, 50);
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        showSection(item.getAttribute('data-target'), item.textContent.trim());
    });
});

backBtn.addEventListener('click', () => {
    showSection('team-section', 'Team Members');
    menuItems.forEach(i => i.classList.remove('active'));
    document.querySelector('[data-target="team-section"]').classList.add('active');
});

// ═══════════════════════════════════════════
//  TEAM DATA
// ═══════════════════════════════════════════
const teamData = {
    'maseera': {
        name: 'Maseera Arshed',
        role: 'Lead Developer',
        image: 'Assests/Maseera.png',
        bio: 'Maseera is a highly skilled lead developer with a passion for creating robust, scalable web applications. She specializes in full-stack architecture and leads our technical team with excellence.',
        skills: ['React', 'Node.js', 'System Architecture', 'UI/UX Integration', 'Cloud Deployment'],
        projects: [
            { title: 'E-Commerce Platform Redesign', desc: 'Led the complete technical overhaul of a major retail platform.' },
            { title: 'AI Chatbot Dashboard', desc: 'Built the frontend interface for an enterprise AI tool.' }
        ]
    },
    'ahmed': {
        name: 'Ahmed Majeed',
        role: 'UI/UX Designer',
        image: 'Assests/ahmed.png',
        bio: 'Ahmed is a visionary UI/UX designer who creates intuitive and visually stunning user experiences. He bridges the gap between user needs and business goals.',
        skills: ['Figma', 'User Research', 'Prototyping', 'Interaction Design', 'Wireframing'],
        projects: [
            { title: 'FinTech App Interface', desc: 'Designed an award-winning mobile banking experience.' },
            { title: 'Corporate Identity Revamp', desc: 'Redesigned brand guidelines and digital presence for a tech startup.' }
        ]
    },
    'habiba': {
        name: 'Habiba Faisal',
        role: 'Project Manager',
        image: 'Assests/habiba.jpeg',
        bio: 'Habiba is an expert project manager who ensures our team delivers top-tier results on time. She excels in agile methodologies and client communication.',
        skills: ['Agile Methodology', 'Scrum', 'Risk Management', 'Client Relations', 'Jira/Asana'],
        projects: [
            { title: 'Healthcare Portal Launch', desc: 'Managed a cross-functional team to deliver a secure patient portal.' },
            { title: 'Q3 Agency Operations Optimization', desc: 'Streamlined internal processes, increasing team efficiency by 25%.' }
        ]
    },
    'mahalaka': {
        name: 'Mahalaka Faisal',
        role: 'Frontend Developer',
        image: 'Assests/mahalaka.jpeg',
        bio: 'Mahalaka brings creative energy and dedicated support to our projects. She is a versatile professional who quickly adapts to new challenges and drives project success.',
        skills: ['Content Strategy', 'Quality Assurance', 'Market Research', 'Copywriting', 'SEO'],
        projects: [
            { title: 'Global Marketing Campaign', desc: 'Assisted in coordinating a multi-channel digital campaign.' },
            { title: 'Website Content Overhaul', desc: 'Rewrote and optimized over 50 pages of web copy for better SEO.' }
        ]
    }
};

const teamCards = document.querySelectorAll('.team-card');

teamCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        const userId = card.getAttribute('data-userid');
        const user = teamData[userId];
        if (!user) return;

        document.getElementById('profile-img').src = user.image;
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-role').textContent = user.role;
        document.getElementById('profile-bio').textContent = user.bio;

        const skillsContainer = document.getElementById('profile-skills');
        skillsContainer.innerHTML = '';
        user.skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            skillsContainer.appendChild(li);
        });

        const projectsContainer = document.getElementById('profile-projects');
        projectsContainer.innerHTML = '';
        user.projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'project-item';
            div.innerHTML = `<h4>${project.title}</h4><p>${project.desc}</p>`;
            projectsContainer.appendChild(div);
        });

        showSection('profile-section', user.name + "'s Profile");
    });
});

// ═══════════════════════════════════════════
//  CANVAS SKETCH / COLOR SYSTEM
// ═══════════════════════════════════════════
const canvasCache = new Map();

function initAICanvases() {
    teamCards.forEach(card => {
        const canvas = card.querySelector('.ai-canvas');
        if (!canvas || canvasCache.has(canvas)) return;
        const img = card.querySelector('.base-img');
        const ctx = canvas.getContext('2d');

        const setupCanvas = () => {
            const w = 300, h = 300;
            canvas.width = w;
            canvas.height = h;
            const sketchCanvas = document.createElement('canvas');
            sketchCanvas.width = w;
            sketchCanvas.height = h;
            const sCtx = sketchCanvas.getContext('2d');
            try {
                const sketchData = generateSobelSketch(sCtx, img, w, h);
                sCtx.putImageData(sketchData, 0, 0);
            } catch (e) {
                console.warn('Canvas sketch: CORS fallback.', e);
                sCtx.save();
                sCtx.filter = 'grayscale(100%) contrast(300%) brightness(110%)';
                sCtx.drawImage(img, 0, 0, w, h);
                sCtx.restore();
            }
            const state = { t: 0, animating: false, sketchCanvas, img, ctx, w, h };
            canvasCache.set(canvas, state);
            renderCanvasState(state);
        };

        if (img.complete) setupCanvas();
        else img.onload = setupCanvas;
    });
}

function generateSobelSketch(ctx, originalImg, w, h) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    const isCrossOrigin = originalImg.src.startsWith('http') && !originalImg.src.includes(window.location.host);
    if (isCrossOrigin) originalImg.crossOrigin = 'anonymous';
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, w, h);
    tempCtx.drawImage(originalImg, 0, 0, w, h);
    const imgData = tempCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const grayscale = new Float32Array(w * h);
    for (let i = 0; i < data.length; i += 4) {
        grayscale[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const output = ctx.createImageData(w, h);
    const outData = output.data;
    const threshold = 12;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            const outIdx = idx * 4;
            const baseGray = grayscale[idx];
            const shading = 215 + (baseGray / 255) * 40;
            let pencilColor = shading;
            if (y > 0 && y < h - 1 && x > 0 && x < w - 1) {
                const diffX = grayscale[idx + 1] - grayscale[idx - 1];
                const diffY = grayscale[idx + w] - grayscale[idx - w];
                const magnitude = Math.sqrt(diffX * diffX + diffY * diffY);
                if (magnitude > threshold) pencilColor = Math.max(0, shading - magnitude * 2.2);
            }
            outData[outIdx] = outData[outIdx + 1] = outData[outIdx + 2] = pencilColor;
            outData[outIdx + 3] = 255;
        }
    }
    return output;
}

function animateColorization(state, targetT) {
    if (state.animating && state.currentTarget === targetT) return;
    state.animating = true;
    state.currentTarget = targetT;
    const speed = 0.045;
    const tick = () => {
        if (!state.animating || state.currentTarget !== targetT) return;
        const diff = targetT - state.t;
        if (Math.abs(diff) < 0.01) {
            state.t = targetT;
            state.animating = false;
        } else {
            state.t += Math.sign(diff) * speed;
            requestAnimationFrame(tick);
        }
        renderCanvasState(state);
    };
    requestAnimationFrame(tick);
}

function renderCanvasState(state) {
    const { ctx, img, sketchCanvas, t, w, h } = state;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.drawImage(sketchCanvas, 0, 0, w, h);
    ctx.restore();
    if (t > 0) {
        ctx.save();
        ctx.globalAlpha = t;
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
    }
}

teamCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        const state = canvasCache.get(card.querySelector('.ai-canvas'));
        if (state) animateColorization(state, 1);
    });
    card.addEventListener('mouseleave', () => {
        const state = canvasCache.get(card.querySelector('.ai-canvas'));
        if (state) animateColorization(state, 0);
    });
});

// ═══════════════════════════════════════════
//  3D CURSOR TILT ENGINE
// ═══════════════════════════════════════════
function init3DTilt() {
    document.querySelectorAll('.interactive-3d').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const b = card.getBoundingClientRect();
            const rx = ((e.clientY - b.top  - b.height / 2) / (b.height / 2)) * -10;
            const ry = ((e.clientX - b.left - b.width  / 2) / (b.width  / 2)) * 10;
            card.style.setProperty('--rx', `${rx}deg`);
            card.style.setProperty('--ry', `${ry}deg`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
}

// ═══════════════════════════════════════════
//  PARALLAX ENGINE (scroll + mouse)
//  Moves .section-parallax-bg and floating
//  images as you scroll or move the mouse
// ═══════════════════════════════════════════
const mainContent = document.querySelector('.main-content');

function updateParallax() {
    const activeSection = document.querySelector('.page-section.active-section');
    if (!activeSection) return;

    const scrollTop = mainContent.scrollTop;

    // 1. Scroll-based parallax for section backgrounds
    const bgs = activeSection.querySelectorAll('.section-parallax-bg');
    bgs.forEach(bg => {
        const rate = parseFloat(bg.dataset.parallax || 0.35);
        bg.style.transform = `translateY(${scrollTop * rate}px)`;
    });

    // 2. Scroll-based parallax for floating images inside sections
    const floatImgs = activeSection.querySelectorAll('[data-parallax]');
    floatImgs.forEach(el => {
        if (el.classList.contains('section-parallax-bg')) return; // already handled
        const rate = parseFloat(el.dataset.parallax || 0.2);
        el.style.transform = `translateY(${scrollTop * rate * -1}px)`;
    });
}

mainContent.addEventListener('scroll', updateParallax, { passive: true });

// 3. Mouse-based parallax: images subtly follow the mouse cursor
function initMouseParallax() {
    document.addEventListener('mousemove', (e) => {
        const activeSection = document.querySelector('.page-section.active-section');
        if (!activeSection) return;

        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;  // -1 to 1
        const dy = (e.clientY - cy) / cy;  // -1 to 1

        // Move section bg layer slightly opposite to cursor (parallax illusion)
        const bgs = activeSection.querySelectorAll('.section-parallax-bg');
        bgs.forEach(bg => {
            const scrollOffset = mainContent.scrollTop * parseFloat(bg.dataset.parallax || 0.35);
            bg.style.transform = `translateY(${scrollOffset + dy * 18}px) translateX(${dx * 12}px)`;
        });

        // Move floating hero images toward cursor gently
        const floatImgs = activeSection.querySelectorAll('.hero-floating-img, .projects-header-img, .info-float-img');
        floatImgs.forEach(el => {
            const depth = parseFloat(el.dataset.depth || el.dataset.parallax || 0.15);
            el.style.transform = `translateX(${dx * 22 * depth * 10}px) translateY(${dy * 16 * depth * 10}px)`;
        });

        // Parallax updates complete
    });
}

// ═══════════════════════════════════════════
//  AMBIENT ORB MOUSE TRACKING
// ═══════════════════════════════════════════
function initOrbTracking() {
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        if (orb1) orb1.style.transform = `translate(${x * 40}px, ${y * 30}px)`;
        if (orb2) orb2.style.transform = `translate(${-x * 30}px, ${-y * 25}px)`;
    });
}

// ═══════════════════════════════════════════
//  INIT ON LOAD
// ═══════════════════════════════════════════
function initAll() {
    initAICanvases();
    init3DTilt();
    initMouseParallax();
    initOrbTracking();
    updateParallax();
}

window.addEventListener('DOMContentLoaded', initAll);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAll();
}