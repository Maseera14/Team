// Theme Toggle removed. Site uses light mode canvas with black cards and maroon accents.

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

    // Re-run parallax and reveal when section changes
    setTimeout(() => {
        updateParallax();
        initScrollReveal();
    }, 50);
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

mainContent.addEventListener('scroll', () => {
    updateParallax();
    const header = document.querySelector('header');
    if (header) header.classList.toggle('scrolled', mainContent.scrollTop > 20);
}, { passive: true });

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
//  SCROLL REVEAL
// ═══════════════════════════════════════════
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, root: mainContent });

    reveals.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════
//  ANIMATED COUNTERS
// ═══════════════════════════════════════════
function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const hasComma = target >= 1000;

    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = (hasComma ? current.toLocaleString() : current) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                if (!isNaN(target)) animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5, root: mainContent });

    counters.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════
//  CONTACT FORM
// ═══════════════════════════════════════════
function handleContactSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    btn.disabled = true;
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        e.target.reset();
    }, 3000);
}
window.handleContactSubmit = handleContactSubmit;

// ═══════════════════════════════════════════
//  PROGRESS BAR ANIMATION ON PROJECT CARDS
// ═══════════════════════════════════════════
function initProgressBars() {
    const bars = document.querySelectorAll('.project-bar-fill');
    bars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => { bar.style.width = width; }, 300);
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.5, root: mainContent });
        observer.observe(bar);
    });
}

// ═══════════════════════════════════════════
//  CONVERSION FUNNEL
// ═══════════════════════════════════════════
const funnelState = {
    step: 1,
    service: '',
    budget: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
};

function openFunnel() {
    const overlay = document.getElementById('funnel-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.querySelector('.main-content')?.classList.add('blur-active');
    if (mainContent) mainContent.style.overflow = 'hidden';
    goToFunnelStep(1);
}

function closeFunnel() {
    const overlay = document.getElementById('funnel-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.querySelector('.main-content')?.classList.remove('blur-active');
    if (mainContent) mainContent.style.overflow = '';
}

function goToFunnelStep(step) {
    funnelState.step = step;
    document.querySelectorAll('.funnel-step').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.funnelStep, 10) === step);
    });
    document.querySelectorAll('.funnel-step-dot').forEach(dot => {
        const dotStep = parseInt(dot.dataset.step, 10);
        dot.classList.remove('active', 'done');
        if (dotStep < step) dot.classList.add('done');
        else if (dotStep === step) dot.classList.add('active');
    });
    const fill = document.getElementById('funnel-progress-fill');
    if (fill) fill.style.width = `${(step / 4) * 100}%`;
}

function funnelNext(fromStep) {
    if (fromStep === 1) {
        const selected = document.querySelector('input[name="funnel-service"]:checked');
        if (!selected) {
            shakeFunnelStep(1);
            return;
        }
        funnelState.service = selected.value;
        goToFunnelStep(2);
    } else if (fromStep === 2) {
        if (!funnelState.budget || !funnelState.timeline) {
            shakeFunnelStep(2);
            return;
        }
        goToFunnelStep(3);
    } else if (fromStep === 3) {
        const name = document.getElementById('funnel-name')?.value.trim();
        const email = document.getElementById('funnel-email')?.value.trim();
        if (!name || !email) {
            shakeFunnelStep(3);
            return;
        }
        funnelState.name = name;
        funnelState.email = email;
        funnelState.phone = document.getElementById('funnel-phone')?.value.trim() || '';
        funnelState.notes = document.getElementById('funnel-notes')?.value.trim() || '';
        renderFunnelSummary();
        goToFunnelStep(4);
        markFunnelConverted();
    }
}

function funnelBack(fromStep) {
    goToFunnelStep(fromStep - 1);
}

function shakeFunnelStep(step) {
    const el = document.querySelector(`.funnel-step[data-funnel-step="${step}"]`);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'funnelShake 0.4s ease';
}

function renderFunnelSummary() {
    const summary = document.getElementById('funnel-summary');
    if (!summary) return;
    summary.innerHTML = `
        <strong>Service:</strong> ${funnelState.service}<br>
        <strong>Budget:</strong> ${funnelState.budget}<br>
        <strong>Timeline:</strong> ${funnelState.timeline}<br>
        <strong>Name:</strong> ${funnelState.name}<br>
        <strong>Email:</strong> ${funnelState.email}
        ${funnelState.phone ? `<br><strong>Phone:</strong> ${funnelState.phone}` : ''}
        ${funnelState.notes ? `<br><strong>Notes:</strong> ${funnelState.notes}` : ''}
    `;
    prefillContactForm();
}

function prefillContactForm() {
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const subjectEl = document.getElementById('contact-subject');
    const messageEl = document.getElementById('contact-message');
    if (nameEl) nameEl.value = funnelState.name;
    if (emailEl) emailEl.value = funnelState.email;
    if (subjectEl) subjectEl.value = `${funnelState.service} — ${funnelState.budget}`;
    if (messageEl) {
        messageEl.value = `Project: ${funnelState.service}\nBudget: ${funnelState.budget}\nTimeline: ${funnelState.timeline}${funnelState.notes ? '\n\n' + funnelState.notes : ''}`;
    }
}

function markFunnelConverted() {
    document.querySelectorAll('.funnel-stage').forEach(s => s.classList.remove('funnel-converted'));
    document.querySelector('.funnel-stage-5')?.classList.add('funnel-converted');
}

function initFunnelChips() {
    document.querySelectorAll('.funnel-chips').forEach(group => {
        group.querySelectorAll('.funnel-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                group.querySelectorAll('.funnel-chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                const key = group.id === 'funnel-budget' ? 'budget' : 'timeline';
                funnelState[key] = chip.dataset.value;
            });
        });
    });
}

function initFunnelStages() {
    const actions = {
        explore: () => mainContent.scrollTo({ top: 0, behavior: 'smooth' }),
        services: () => document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        projects: () => document.querySelector('[data-target="projects-section"]')?.click(),
        team: () => document.querySelector('[data-target="team-section"]')?.click(),
        convert: () => openFunnel()
    };
    document.querySelectorAll('.funnel-stage').forEach(stage => {
        stage.addEventListener('click', () => {
            const action = stage.dataset.funnelAction;
            if (actions[action]) actions[action]();
        });
    });
}

function initStickyFunnelBar() {
    const bar = document.getElementById('funnel-sticky-bar');
    if (!bar || localStorage.getItem('funnel-bar-dismissed')) return;

    mainContent.addEventListener('scroll', () => {
        if (localStorage.getItem('funnel-bar-dismissed')) return;
        const show = mainContent.scrollTop > 400;
        bar.classList.toggle('visible', show);
        bar.setAttribute('aria-hidden', !show);
    }, { passive: true });
}

function closeStickyBar() {
    const bar = document.getElementById('funnel-sticky-bar');
    if (bar) {
        bar.classList.remove('visible');
        bar.classList.add('dismissed');
        localStorage.setItem('funnel-bar-dismissed', '1');
    }
}

document.getElementById('funnel-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'funnel-overlay') closeFunnel();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFunnel();
});

window.openFunnel = openFunnel;
window.closeFunnel = closeFunnel;
window.funnelNext = funnelNext;
window.funnelBack = funnelBack;
window.closeStickyBar = closeStickyBar;

// ═══════════════════════════════════════════
//  INIT ON LOAD
// ═══════════════════════════════════════════
function initAll() {
    initAICanvases();
    init3DTilt();
    initMouseParallax();
    initOrbTracking();
    initScrollReveal();
    initCounters();
    initProgressBars();
    initFunnelChips();
    initFunnelStages();
    initStickyFunnelBar();
    updateParallax();
}

window.addEventListener('DOMContentLoaded', initAll);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAll();
}