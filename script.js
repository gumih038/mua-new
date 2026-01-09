// GSAPプラグイン登録
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function() {
    
    document.body.classList.add('loaded');
    
    // --- 線画アート (Canvas) ---
    const canvas = document.getElementById('bg-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let lines = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Line {
            constructor(y) {
                this.y = y;
                this.offset = Math.random() * 100;
                this.speed = 0.001 + Math.random() * 0.002;
                this.amplitude = 30 + Math.random() * 50;
            }
            draw(scrollY) {
                ctx.beginPath();
                ctx.moveTo(0, this.y);
                for (let x = 0; x < width; x += 20) {
                    const y = this.y + Math.sin((x * 0.003) + this.offset + (scrollY * 0.001)) * this.amplitude;
                    ctx.lineTo(x, y);
                }
                // 色を薄いグレーにして上品に
                ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)'; 
                ctx.lineWidth = 0.8;
                ctx.stroke();
                this.offset += this.speed;
            }
        }
        for(let i=0; i<4; i++) lines.push(new Line(height * 0.3 + i * 200));

        function animate() {
            ctx.clearRect(0, 0, width, height);
            const scrollY = window.scrollY;
            lines.forEach(line => line.draw(scrollY));
            requestAnimationFrame(animate);
        }
        animate();
    }

    // --- 予約ボタン ---
    const reserveBtn = document.getElementById('reserve-btn');
    const reservePopup = document.getElementById('reserve-popup');
    const btnText = reserveBtn ? reserveBtn.querySelector('.btn-text') : null;
    const btnIcon = reserveBtn ? reserveBtn.querySelector('.btn-icon') : null;
    let isPopupOpen = false;

    function closePopup() {
        if (!isPopupOpen) return;
        isPopupOpen = false;
        reservePopup.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        if(btnText) btnText.classList.remove('hidden');
        if(btnIcon) btnIcon.classList.add('hidden');
    }

    function togglePopup() {
        isPopupOpen = !isPopupOpen;
        if (isPopupOpen) {
            reservePopup.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            if(btnText) btnText.classList.add('hidden');
            if(btnIcon) btnIcon.classList.remove('hidden');
        } else {
            closePopup();
        }
    }

    if(reserveBtn && reservePopup) {
        reserveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePopup();
        });
        document.addEventListener('click', (e) => {
            if (isPopupOpen && !reservePopup.contains(e.target)) {
                closePopup();
            }
        });
        window.addEventListener('scroll', () => {
            if (isPopupOpen) closePopup();
        }, { passive: true });
    }

    // --- Voiceスクロール ---
    const voiceContainer = document.getElementById('voice-container');
    let autoScrollSpeed = 0.5;
    let isUserInteracting = false;

    function autoScroll() {
        if (!isUserInteracting && voiceContainer) {
            voiceContainer.scrollLeft += autoScrollSpeed;
            if (voiceContainer.scrollLeft >= voiceContainer.scrollWidth - voiceContainer.clientWidth) {
                voiceContainer.scrollLeft = 0;
            }
        }
        requestAnimationFrame(autoScroll);
    }

    if (voiceContainer) {
        voiceContainer.addEventListener('touchstart', () => { isUserInteracting = true; });
        voiceContainer.addEventListener('touchend', () => { setTimeout(() => isUserInteracting = false, 1000); });
        autoScroll();
    }

    // --- GSAP Animations ---
    function initAnimations() {
        // Hero
        const tlHero = gsap.timeline();
        tlHero.to('#hero-logo', { opacity: 1, scale: 1, duration: 1.8, ease: 'power3.out' })
              .to('#hero-text', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, '-=1.2');

        // Hero Parallax
        gsap.to('#hero-bg img', {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: { trigger: '#hero-section', start: 'top top', end: 'bottom top', scrub: true }
        });
        
        // Reveal Images
        document.querySelectorAll('.reveal-img-wrapper').forEach(container => {
            const overlay = container.querySelector('.reveal-overlay');
            const img = container.querySelector('.reveal-img');
            const tl = gsap.timeline({ scrollTrigger: { trigger: container, start: 'top 85%' } });
            tl.to(overlay, { height: '0%', duration: 1.4, ease: 'expo.inOut' })
              .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, '-=1.4');
        });

        // Fade Up Text
        document.querySelectorAll('.fade-in-up').forEach(el => {
            gsap.fromTo(el, 
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }
            );
        });

        // Works Parallax
        gsap.utils.toArray('.parallax-col').forEach(col => {
            const speed = parseFloat(col.getAttribute('data-speed')) || 0.05;
            gsap.to(col, {
                y: -100 * (speed > 0 ? 1 : -1), // 簡易的な上下移動
                ease: 'none',
                scrollTrigger: {
                    trigger: '#works',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
        
        // Background Text Parallax
        gsap.to('.parallax-text', {
            yPercent: 30,
            ease: 'none',
            scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
        });
    }
    
    initAnimations();
});
