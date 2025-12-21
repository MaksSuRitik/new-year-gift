/* ==========================================
   🎹 NEON PIANO: ULTRA FX VERSION 4.0
   (Laser Beams, Column Shake, Combo Colors, Particles)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- AUDIO SYSTEM SETUP (UI SOUNDS) ---
    const sfxClick = new Audio('audio/click.mp3');
    const sfxHover = new Audio('audio/hover.mp3');
    
    let bgMusicEl = document.getElementById('bg-music');
    if (!bgMusicEl) {
        bgMusicEl = new Audio('audio/lofi-xmas.mp3');
        bgMusicEl.id = 'bg-music';
        bgMusicEl.loop = true;
        bgMusicEl.volume = 0.2; 
        document.body.appendChild(bgMusicEl);
    }

    // --- 1. SYNC SETTINGS FROM LOCALSTORAGE ---
    const savedTheme = localStorage.getItem('siteTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('themeToggle');
    if(themeBtn) themeBtn.innerText = savedTheme === 'dark' ? '🌙' : '☀️';

    let currentLang = localStorage.getItem('siteLang') || 'UA';
    document.body.setAttribute('data-lang', currentLang);
    const langBtn = document.getElementById('langToggle');
    if(langBtn) {
        langBtn.innerText = currentLang === 'MEOW' ? '🐱' : currentLang;
    }

    let isMuted = localStorage.getItem('isMuted') === 'true';
    const soundBtn = document.getElementById('soundToggle');
    if(soundBtn) {
        soundBtn.innerText = isMuted ? '🔇' : '🔊';
    }

    if (!isMuted && bgMusicEl) {
        const savedTime = localStorage.getItem('bgMusicTime');
        if(savedTime) bgMusicEl.currentTime = parseFloat(savedTime);
        bgMusicEl.play().catch(()=>{ console.log("Waiting for interaction..."); });
    }

    window.addEventListener('beforeunload', () => {
        if(bgMusicEl && !bgMusicEl.paused) localStorage.setItem('bgMusicTime', bgMusicEl.currentTime);
    });

    function playClick() {
        if (!isMuted) { sfxClick.currentTime = 0; sfxClick.volume = 0.4; sfxClick.play().catch(()=>{}); }
    }
    function playHover() {
        if (!isMuted) { sfxHover.currentTime = 0; sfxHover.volume = 0.2; sfxHover.play().catch(()=>{}); }
    }

    // 1. ПОВНИЙ СПИСОК ПІСЕНЬ
    const songsDB = [
        { file: "AfterDark.mp3", title: "After Dark", artist: "Mr. Kitty" },
        { file: "AfterHours.mp3", title: "After Hours", artist: "The Weeknd" },
        { file: "BlackSwan.mp3", title: "Black Swan", artist: "BTS" },
        { file: "DirtyDiana.mp3", title: "Dirty Diana", artist: "Michael Jackson" },
        { file: "DrinkUpMeHeartiesYoHo.mp3", title: "Pirates", artist: "Hans Zimmer" },
        { file: "Give.mp3", title: "Give", artist: "Unknown" },
        { file: "GoldenBrown.mp3", title: "Golden Brown", artist: "The Stranglers" },
        { file: "Hijodelaluna.mp3", title: "Hijo de la luna", artist: "Mecano" },
        { file: "LivingLegend.mp3", title: "Living Legend", artist: "Lana Del Rey" },
        { file: "Peppers.mp3", title: "Peppers", artist: "Lana Del Rey" },
        { file: "PiedPiper.mp3", title: "Pied Piper", artist: "BTS" },
        { file: "Provider.mp3", title: "Provider", artist: "Frank Ocean" },
        { file: "Rain.mp3", title: "Rain", artist: "Sleep Token" },
        { file: "RedTerror.mp3", title: "Red Terror", artist: "Unknown" },
        { file: "SantanaMedley.mp3", title: "Santana Medley", artist: "Santana" },
        { file: "Softcore.mp3", title: "Softcore", artist: "The Neighbourhood" },
        { file: "TakeMeBackToEden.mp3", title: "Take Me Back", artist: "Sleep Token" },
        { file: "TheAbyss.mp3", title: "The Abyss", artist: "Unknown" },
        { file: "TheApparition.mp3", title: "The Apparition", artist: "Sleep Token" }
    ];

    const CONFIG = {
        speedStart: 1400, 
        speedEnd: 470,    
        hitPosition: 0.85, 
        colorsDark: { 
            tap: ['#00d2ff', '#3a7bd5'], 
            long: ['#ff0099', '#493240'], 
            dead: ['#555', '#222'],
            stroke: "rgba(255,255,255,0.8)",
            shadow: "#fff",
            laneLine: "rgba(255,255,255,0.1)"
        },
        colorsLight: {
            tap: ['#0077aa', '#005588'], 
            long: ['#aa0066', '#770044'], 
            dead: ['#999', '#777'],
            stroke: "#000000",
            shadow: "transparent",
            laneLine: "rgba(0,0,0,0.2)"
        },
        missLimit: 3,
        scorePerfect: 50,
        scoreGood: 20,
        scoreHoldTick: 5,
        noteHeight: 210, 
        hitScale: 1.15
    };

    const TRANSLATIONS = {
        UA: { icon: "UA", instructions: "Гра здійснюється за допомогою клавіш S D J K", score: "Рахунок", combo: "Комбо", paused: "ПАУЗА", resume: "Продовжити", quit: "Вийти", complete: "ПРОЙДЕНО", failed: "ПОРАЗКА", restart: "Ще раз", menu: "Меню", perfect: "ІДЕАЛЬНО", good: "ДОБРЕ", miss: "ПРОМАХ", loading: "Створення нот..." },
        RU: { icon: "RU", instructions: "Игра осуществляется с помощью клавиш S D J K", score: "Счет", combo: "Комбо", paused: "ПАУЗА", resume: "Продолжить", quit: "Выйти", complete: "ПРОЙДЕНО", failed: "ПОРАЖЕНИЕ", restart: "Еще раз", menu: "Меню", perfect: "ИДЕАЛЬНО", good: "ХОРОШО", miss: "МИМО", loading: "Создание нот..." },
        MEOW: { icon: "🐱", instructions: "Meow meow meow S D J K meow", score: "Meow", combo: "Meow-bo", paused: "MEOW?", resume: "Meow!", quit: "Grrr", complete: "PURRFECT", failed: "HISSS", restart: "Meow-gain", menu: "Meow-nu", perfect: "PURRFECT", good: "MEOW", miss: "SQUEAK", loading: "Meowing..." }
    };

    // Elements
    const canvas = document.getElementById('rhythmCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const gameContainer = document.getElementById('game-container');
    const menuLayer = document.getElementById('menu-layer');
    const loader = document.getElementById('loader');
    const ratingContainer = document.getElementById('rating-container');
    const holdEffectsContainer = document.getElementById('hold-effects-container');
    const progressBar = document.getElementById('game-progress-bar');
    const starsElements = [document.getElementById('star-1'), document.getElementById('star-2'), document.getElementById('star-3')];
    const comboDisplay = document.getElementById('combo-display');

    // Game State
    let audioCtx = null; 
    let sourceNode = null;
    let masterGain = null; 
    let audioBuffer = null;
    let animationFrameId = null;
    let currentSessionId = 0; 

    let isPlaying = false;
    let isPaused = false;
    let startTime = 0;
    let score = 0;
    let maxPossibleScore = 0; 
    let combo = 0;
    let consecutiveMisses = 0;
    let currentSongIndex = 0;
    let lastHitTime = 0;
    let currentSpeed = CONFIG.speedStart;

    let mapTiles = [];
    let activeTiles = [];
    let particles = [];
    let keyState = [false, false, false, false]; 
    let holdingTiles = [null, null, null, null]; 
    const laneElements = [null, null, null, null]; 
    
    // --- NEW: FX VARIABLES ---
    let laneBeamAlpha = [0, 0, 0, 0]; // Alpha for laser beams
    // -------------------------

    const KEYS = ['KeyS', 'KeyD', 'KeyJ', 'KeyK'];

    /* --- UTILS --- */
    function getText(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS['UA'][key]; }

    function updateLangDisplay() {
        const lBtn = document.getElementById('langToggle');
        if (lBtn) {
            const icon = TRANSLATIONS[currentLang].icon || currentLang;
            lBtn.innerText = icon;
        }
    }

    function updateGameText() {
        const t = TRANSLATIONS[currentLang];
        const instr = document.querySelector('.instruction-text'); if(instr) instr.innerText = t.instructions;
        const pauseTitle = document.querySelector('#pause-modal h2'); if(pauseTitle) pauseTitle.innerText = t.paused;
        const btnResume = document.getElementById('btn-resume'); if(btnResume) btnResume.innerText = t.resume;
        const btnQuit = document.getElementById('btn-quit'); if(btnQuit) btnQuit.innerText = t.quit;
        const btnRestart = document.getElementById('btn-restart'); if(btnRestart) btnRestart.innerText = t.restart;
        const btnMenu = document.getElementById('btn-menu-end'); if(btnMenu) btnMenu.innerText = t.menu;
        const loadText = document.querySelector('#loader h3'); if(loadText) loadText.innerText = t.loading;
        updateLangDisplay();
    }

    /* --- RESET --- */
    function resetGameState() {
        currentSessionId++;
        if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
        if (sourceNode) { try { sourceNode.stop(); } catch(e) {} sourceNode = null; }

        isPlaying = false; isPaused = false;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

        score = 0; combo = 0; consecutiveMisses = 0;
        activeTiles = []; mapTiles = []; particles = [];
        holdingTiles = [null, null, null, null];
        keyState = [false, false, false, false];
        laneBeamAlpha = [0, 0, 0, 0]; // Reset beams
        
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (holdEffectsContainer) holdEffectsContainer.innerHTML = ''; 
        if (ratingContainer) ratingContainer.innerHTML = '';
        
        updateScoreUI();
        if (progressBar) progressBar.style.width = '0%';
        if (comboDisplay) {
            comboDisplay.style.opacity = 0;
            comboDisplay.style.color = '#fff'; // Reset color
        }
        
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal) pauseModal.classList.add('hidden');
        const resultScreen = document.getElementById('result-screen');
        if (resultScreen) resultScreen.classList.add('hidden');

        starsElements.forEach(s => { if(s) s.classList.remove('active'); });
        laneElements.forEach(el => { if(el) el.classList.remove('active'); });
        
        updateGameText();
    }

    /* --- SAVES --- */
    function getSavedData(songTitle) {
        try {
            const data = localStorage.getItem(`neon_rhythm_${songTitle}`);
            return data ? JSON.parse(data) : { score: 0, stars: 0 };
        } catch(e) { return { score: 0, stars: 0 }; }
    }

    function saveGameData(songTitle, newScore, newStars) {
        const current = getSavedData(songTitle);
        const finalScore = Math.max(newScore, current.score || 0);
        const finalStars = Math.max(newStars, current.stars || 0);
        
        const data = { score: finalScore, stars: finalStars };
        localStorage.setItem(`neon_rhythm_${songTitle}`, JSON.stringify(data));
    }

    function renderMenu() {
        const list = document.getElementById('song-list');
        if (!list) return;
        list.innerHTML = '';
        
        songsDB.forEach((s, i) => {
            const saved = getSavedData(s.title);
            let starsStr = '';
            for(let j=0; j<3; j++) starsStr += j < saved.stars ? '★' : '☆';
            const hasScore = saved.score > 0;

            const el = document.createElement('div');
            el.className = 'song-card';
            el.onclick = () => { playClick(); startGame(i); };
            el.onmouseenter = playHover;

            el.innerHTML = `
                <div class="song-info">
                    <h3>${s.title}</h3>
                    <div class="song-meta-row">
                        <span class="artist-name">${s.artist}</span>
                        ${hasScore ? `<div class="score-badge"><span>🏆 ${saved.score}</span><span class="stars-display">${starsStr}</span></div>` : ''}
                    </div>
                </div>
                <div style="font-size:1.5rem; margin-left: 10px;">▶</div>
            `;
            list.appendChild(el);
        });
        updateGameText();
    }

    /* --- GENERATION --- */
    async function analyzeAudio(url, sessionId) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (!masterGain) {
            masterGain = audioCtx.createGain();
            masterGain.gain.value = isMuted ? 0 : 1;
            masterGain.connect(audioCtx.destination);
        }

        if (audioCtx.state === 'suspended') await audioCtx.resume();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("File not found");
            const arrayBuffer = await response.arrayBuffer();
            if (sessionId !== currentSessionId) return null;
            const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
            if (sessionId !== currentSessionId) return null;

            const rawData = decodedAudio.getChannelData(0);
            const sampleRate = decodedAudio.sampleRate;
            let sum = 0; const sampleStep = Math.floor(rawData.length / 1000);
            for (let i = 0; i < rawData.length; i += sampleStep) sum += rawData[i] * rawData[i];
            const rms = Math.sqrt(sum / 1000); let threshold = Math.max(0.05, rms * 1.5); 
            const tiles = []; const step = 4410; let lastTime = 0; maxPossibleScore = 0;
            const MIN_GAP = 0.35; 

            for (let i = 0; i < rawData.length; i += step) {
                let localMax = 0;
                for (let j = 0; j < step && i+j < rawData.length; j+=10) if (Math.abs(rawData[i+j]) > localMax) localMax = Math.abs(rawData[i+j]);
                if (localMax > threshold) {
                    const time = i / sampleRate;
                    if (time - lastTime > MIN_GAP) { 
                        const isLong = Math.random() < 0.25; 
                        let duration = 0; let type = 'tap';
                        let noteScore = CONFIG.scorePerfect;
                        
                        if (isLong) {
                            const isSuperLong = Math.random() < 0.2; duration = isSuperLong ? 2.5 : 0.8; type = 'long';
                            noteScore += (duration * 1000 / 220 * CONFIG.scoreHoldTick) + (CONFIG.scoreHoldTick * 2);
                        }
                        const isDouble = Math.random() < 0.20; 
                        const numberOfNotes = isDouble ? 2 : 1;
                        
                        let lanes = [];
                        while (lanes.length < numberOfNotes) {
                            let l = Math.floor(Math.random() * 4);
                            if (!lanes.includes(l)) lanes.push(l);
                        }

                        lanes.forEach(lane => {
                            maxPossibleScore += noteScore;
                            tiles.push({
                                time: time * 1000, duration: duration * 1000, endTime: (time + duration) * 1000,
                                lane: lane, type: type,
                                hit: false, holding: false, completed: false, failed: false, holdTicks: 0,
                                hitAnimStart: 0, lastValidHoldTime: 0
                            });
                        });
                        lastTime = time + duration + 0.15;
                    }
                }
            }
            audioBuffer = decodedAudio;
            return tiles;
        } catch (error) {
            console.error(error);
            if (sessionId === currentSessionId) { alert(`Помилка: ${url}`); quitGame(); }
            return null;
        }
    }

    /* --- LOGIC --- */
    function gameLoop() {
        if (!isPlaying || isPaused) return;

        const songTime = (audioCtx.currentTime - startTime) * 1000;
        const durationMs = audioBuffer.duration * 1000;
        const progress = Math.min(1, songTime / durationMs);
        currentSpeed = CONFIG.speedStart - (progress * (CONFIG.speedStart - CONFIG.speedEnd));

        updateProgressBar(songTime, durationMs);
        
        if (Date.now() - lastHitTime > 2000 && combo > 0) {
            if(comboDisplay) comboDisplay.style.opacity = Math.max(0, 1 - (Date.now() - lastHitTime - 2000) / 1000);
        }

        if (songTime > durationMs + 1000) {
            endGame(true);
            return;
        }

        update(songTime);
        draw(songTime);
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function update(songTime) {
        const hitTimeWindow = currentSpeed; 
        const hitY = canvas.height * CONFIG.hitPosition;
        const themeColors = (document.body.getAttribute('data-theme') === 'light') ? CONFIG.colorsLight : CONFIG.colorsDark;

        mapTiles.forEach(tile => {
            if (!tile.spawned && tile.time - hitTimeWindow <= songTime) {
                activeTiles.push(tile);
                tile.spawned = true;
            }
        });

        for (let i = activeTiles.length - 1; i >= 0; i--) {
            const tile = activeTiles[i];
            
            // AUTO-CATCH Logic (Long Notes)
            if (!tile.hit && !tile.completed && !tile.failed && tile.type === 'long') {
                if (keyState[tile.lane]) {
                    const diff = tile.time - songTime;
                    if (Math.abs(diff) < 50) { 
                        tile.hit = true;
                        tile.lastValidHoldTime = Date.now();
                        holdingTiles[tile.lane] = tile;
                        const color = themeColors.long[1];
                        toggleHoldEffect(tile.lane, true, color);
                        
                        score += CONFIG.scorePerfect;
                        showRating(getText('perfect'), "rating-perfect");
                        spawnSparks(tile.lane, hitY, '#ff00ff', 'perfect'); // Gold sparks
                        lastHitTime = Date.now();
                        updateScoreUI();
                    }
                }
            }

            if (tile.type === 'tap' && tile.hit) {
                if (Date.now() - tile.hitAnimStart > 100) activeTiles.splice(i, 1);
                continue;
            }

            const progressStart = 1 - (tile.time - songTime) / currentSpeed;
            const yStart = progressStart * hitY;
            let yEnd = yStart;
            if (tile.type === 'long') {
                const progressEnd = 1 - (tile.endTime - songTime) / currentSpeed;
                yEnd = progressEnd * hitY;
            }

            if (tile.type === 'long' && tile.hit && !tile.completed && !tile.failed) {
                const isKeyPressed = keyState[tile.lane];
                if (isKeyPressed) tile.lastValidHoldTime = Date.now();

                const isHoldingIdeally = isKeyPressed;
                const isGracePeriod = (Date.now() - tile.lastValidHoldTime) < 100;

                if (isHoldingIdeally || isGracePeriod) {
                    if (songTime < tile.endTime) {
                        tile.holdTicks++;
                        if (tile.holdTicks % 10 === 0) {
                            score += CONFIG.scoreHoldTick;
                            combo++;
                            updateScoreUI();
                            // Continuous sparks for holding
                            spawnSparks(tile.lane, hitY, themeColors.long[1], 'good'); 
                        }
                        tile.holding = true;
                        lastHitTime = Date.now(); 
                    } else {
                        tile.completed = true;
                        tile.holding = false;
                        score += CONFIG.scoreHoldTick * 5;
                        combo++;
                        updateScoreUI();
                    }
                } else {
                    if (songTime < tile.endTime) {
                        tile.holding = false;
                        tile.failed = true;
                        tile.color = themeColors.dead;
                    }
                }
            }

            const limitY = canvas.height + 50;
            if ((tile.type === 'tap' && yStart > limitY && !tile.hit) || (tile.type === 'long' && yEnd > limitY)) {
                if (!tile.hit && !tile.completed && !tile.failed) missNote(tile, true);
                activeTiles.splice(i, 1);
            }
        }
    }

    /* --- DRAWING --- */
    function draw(songTime) {
        if (!ctx) return;
        
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;

        // --- DYNAMIC COMBO COLORS ---
        let currentPalette = { tap: colors.tap, glow: colors.tap[1] };
        if (combo >= 50 && combo < 100) {
            currentPalette = { tap: ['#d53a9d', '#743ad5'], glow: '#d53a9d' }; // Purple
        } else if (combo >= 100) {
            currentPalette = { tap: ['#ffd700', '#ff8c00'], glow: '#ffd700' }; // Gold
        }
        // ----------------------------

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isLight) {
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillRect(0,0,canvas.width, canvas.height);
        }

        const laneW = canvas.width / 4;
        const hitY = canvas.height * CONFIG.hitPosition;
        const padding = 6; 
        const noteRadius = 15;

        // --- DRAW LANES (With Vibration) ---
        ctx.strokeStyle = colors.laneLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for(let i=0; i<4; i++) {
            // Calculate Shake
            let shakeX = 0;
            if (holdingTiles[i]) {
                shakeX = (Math.random() - 0.5) * 6; // Column vibration strength
            }

            // Laser Beam (Fade Out)
            if (laneBeamAlpha[i] > 0) {
                const beamW = laneW;
                const beamX = (i * laneW) + shakeX;
                
                let beamGrad = ctx.createLinearGradient(beamX, hitY, beamX, 0);
                // Beam color based on Combo
                const beamColor = combo >= 100 ? "rgba(255, 215, 0," : (combo >= 50 ? "rgba(213, 58, 157," : "rgba(102, 252, 241,");
                
                beamGrad.addColorStop(0, beamColor + (laneBeamAlpha[i] * 0.6) + ")");
                beamGrad.addColorStop(1, "rgba(255,255,255,0)");

                ctx.fillStyle = beamGrad;
                ctx.fillRect(beamX, 0, beamW, hitY);
                
                laneBeamAlpha[i] -= 0.05; // Fade speed
            }

            // Draw Lines
            if (i > 0) {
                ctx.moveTo(i * laneW + shakeX, 0);
                ctx.lineTo(i * laneW + shakeX, canvas.height);
            }
        }
        ctx.stroke();

        // Hit Line
        ctx.strokeStyle = combo >= 100 ? "#ffd700" : (combo >= 50 ? "#d53a9d" : colors.laneLine);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, hitY); ctx.lineTo(canvas.width, hitY); 
        ctx.stroke();

        // --- DRAW NOTES ---
        activeTiles.forEach(tile => {
            if (tile.type === 'long' && tile.completed) return;

            // Apply vibration to held long notes
            let tileShake = 0;
            if (tile.type === 'long' && tile.holding) {
                tileShake = (Math.random() - 0.5) * 4;
            }

            const x = tile.lane * laneW + padding + tileShake;
            const w = laneW - (padding * 2);

            const progressStart = 1 - (tile.time - songTime) / currentSpeed;
            let yBottom = progressStart * hitY;
            let yTop = yBottom - CONFIG.noteHeight;

            // === TAP NOTE ===
            if (tile.type === 'tap') {
                let scale = 1;
                let glow = 0;
                let color = currentPalette.tap[1]; // Use dynamic palette

                if (tile.hit) {
                    scale = CONFIG.hitScale;
                    glow = 30;
                    color = isLight ? "#000" : "#fff"; 
                }

                ctx.save();
                const cx = x + w/2; 
                const cy = yTop + CONFIG.noteHeight/2;
                ctx.translate(cx, cy); 
                ctx.scale(scale, scale); 
                ctx.translate(-cx, -cy);

                let grad = ctx.createLinearGradient(x, yTop, x, yBottom);
                grad.addColorStop(0, currentPalette.tap[0]);       
                grad.addColorStop(0.5, color);         
                grad.addColorStop(1, currentPalette.tap[0]);       

                ctx.shadowBlur = glow > 0 ? glow : (isLight ? 0 : 10); 
                ctx.shadowColor = colors.shadow === 'transparent' ? color : currentPalette.glow;
                ctx.fillStyle = grad;
                
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x, yTop, w, CONFIG.noteHeight, noteRadius);
                else ctx.fillRect(x, yTop, w, CONFIG.noteHeight);
                ctx.fill();
                
                ctx.strokeStyle = colors.stroke;
                ctx.lineWidth = tile.hit ? 4 : 2;
                ctx.stroke();
                
                ctx.shadowBlur = 0;
                ctx.restore();
            } 
            
            // === LONG NOTE ===
            else if (tile.type === 'long') {
                const progressEnd = 1 - (tile.endTime - songTime) / currentSpeed;
                let yTail = progressEnd * hitY;
                let yHead = yBottom;

                if (tile.hit && tile.holding) yHead = hitY;
                if (yTail > yHead) yTail = yHead;

                const headHeight = CONFIG.noteHeight;
                const actualYHeadTop = yHead - headHeight;
                const tailH = actualYHeadTop - yTail;

                // Long note uses static colors usually, but head can shift? 
                // Let's keep long note body consistent to avoid confusion, 
                // but maybe shift the Head color for high combos?
                let colorSet = tile.failed ? colors.dead : colors.long;

                if (tailH > 0) {
                    let grad = ctx.createLinearGradient(x, yTail, x, actualYHeadTop);
                    grad.addColorStop(0, isLight ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)"); 
                    grad.addColorStop(1, colorSet[0]); 
                    ctx.fillStyle = grad;
                    
                    const tailPadding = 10;
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(x + tailPadding, yTail, w - tailPadding*2, tailH + 2, [noteRadius, noteRadius, 0, 0]); 
                    else ctx.fillRect(x + tailPadding, yTail, w - tailPadding*2, tailH + 2);
                    ctx.fill();
                }

                let hGrad = ctx.createLinearGradient(x, actualYHeadTop, x, yHead);
                hGrad.addColorStop(0, colorSet[0]); 
                hGrad.addColorStop(1, colorSet[1]); 
                ctx.fillStyle = hGrad;
                
                if (tile.hit && tile.holding) {
                    ctx.shadowBlur = 20; 
                    ctx.shadowColor = isLight ? "#000" : "#fff"; 
                    ctx.strokeStyle = isLight ? "#000" : "#fff"; 
                    ctx.lineWidth = 2;
                } else {
                    ctx.shadowBlur = 0; 
                    ctx.strokeStyle = colors.stroke;
                    ctx.lineWidth = 2;
                }

                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x, actualYHeadTop, w, headHeight, noteRadius);
                else ctx.fillRect(x, actualYHeadTop, w, headHeight);
                ctx.fill();
                ctx.stroke(); 
                ctx.shadowBlur = 0;
                
                if(!tile.failed) {
                    ctx.fillStyle = "rgba(255,255,255,0.5)";
                    ctx.fillRect(x, actualYHeadTop + 10, w, 10);
                }
            }
        });

        // --- DRAW PARTICLES ---
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx; 
            p.y += p.vy; 
            p.vy += 0.5; // Gravity
            p.life -= 0.03;

            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            
            // Draw Sparks/Triangles
            if (p.type === 'perfect') {
               // Draw Triangle for Perfect
               ctx.moveTo(p.x, p.y);
               ctx.lineTo(p.x + 4, p.y + 8);
               ctx.lineTo(p.x - 4, p.y + 8);
               ctx.fill();
            } else {
               // Circle for Good
               ctx.arc(p.x, p.y, Math.random()*5, 0, Math.PI*2);
               ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    /* --- INPUT --- */
    function spawnSparks(lane, y, color, type = 'good') {
        const laneW = canvas.width / 4;
        const x = lane * laneW + laneW / 2;
        const isLight = document.body.getAttribute('data-theme') === 'light';
        
        let finalColor = color;
        // Override color for high combos
        if (combo >= 100) finalColor = '#FFD700'; // Gold
        else if (combo >= 50 && combo < 100 && type === 'perfect') finalColor = '#ff00ff';
        
        if (isLight) finalColor = (color === '#00ffff' ? '#0088aa' : '#aa0066');

        // Particle Count based on hit type
        const count = type === 'perfect' ? 20 : 8;

        for(let i=0; i<count; i++) {
            particles.push({ 
                x: x + (Math.random() - 0.5) * 50, 
                y: y, 
                vx: (Math.random()-0.5) * 15, // Wide explosion
                vy: (Math.random()-1) * 15 - 5, // Upward initial burst
                life: 1.0, 
                color: finalColor,
                type: type
            });
        }
    }

    function handleInputDown(lane) {
        if (!isPlaying || isPaused) return;
        keyState[lane] = true; 
        if (laneElements[lane]) laneElements[lane].classList.add('active');
        
        // --- TRIGGER LASER BEAM ---
        laneBeamAlpha[lane] = 1.0; 
        // --------------------------
        
        if (holdingTiles[lane]) return; 

        // Bounce Fix
        const activeHold = activeTiles.find(t => t.lane === lane && t.type === 'long' && t.hit && !t.completed && !t.failed);
        if (activeHold) {
            holdingTiles[lane] = activeHold;
            activeHold.lastValidHoldTime = Date.now();
            const isLight = document.body.getAttribute('data-theme') === 'light';
            const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;
            const color = colors.long[1];
            toggleHoldEffect(lane, true, color);
            return;
        }

        const songTime = (audioCtx.currentTime - startTime) * 1000;
        const target = activeTiles.find(t => {
            if (t.hit || t.completed || t.failed) return false;
            if (t.lane !== lane) return false;
            if (t.type === 'tap' && t.hitAnimStart) return false;

            const diff = t.time - songTime;
            if (diff > 190 || diff < -240) return false;
            
            return true;
        });

        if (target) {
            const diff = Math.abs(target.time - songTime);

            target.hit = true;
            consecutiveMisses = 0; 
            lastHitTime = Date.now();
            
            const isLight = document.body.getAttribute('data-theme') === 'light';
            const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;
            let color = target.type === 'long' ? colors.long[1] : colors.tap[1];

            if (target.type === 'tap') {
                target.hitAnimStart = Date.now(); 
            }

            if (diff < 70) {
                score += CONFIG.scorePerfect;
                showRating(getText('perfect'), "rating-perfect");
                spawnSparks(lane, canvas.height * CONFIG.hitPosition, '#ff00ff', 'perfect');
            } else {
                score += CONFIG.scoreGood;
                showRating(getText('good'), "rating-good");
                spawnSparks(lane, canvas.height * CONFIG.hitPosition, '#00ffff', 'good');
            }

            if (target.type === 'long') {
                holdingTiles[lane] = target;
                target.lastValidHoldTime = Date.now(); 
                toggleHoldEffect(lane, true, color);
            } else {
                combo++;
            }
            updateScoreUI();
        } else {
            missNote({ lane: lane }, false);
        }
    }

    function handleInputUp(lane) {
        keyState[lane] = false;
        if (laneElements[lane]) laneElements[lane].classList.remove('active');
        toggleHoldEffect(lane, false);
        const tile = holdingTiles[lane];
        if (tile) { 
            holdingTiles[lane] = null; 
        }
    }

    function missNote(tile, isSpawnedMiss) {
        consecutiveMisses++;
        combo = 0;
        updateScoreUI();
        showRating(getText('miss'), "rating-miss");
        if(gameContainer) {
            gameContainer.classList.add('shake-screen');
            setTimeout(() => gameContainer.classList.remove('shake-screen'), 300);
        }
        if (consecutiveMisses >= CONFIG.missLimit) endGame(false);
    }

    /* --- HELPERS --- */
    function updateScoreUI() {
        const scoreEl = document.getElementById('score-display');
        if(scoreEl) scoreEl.innerText = score;
        if(comboDisplay) {
            comboDisplay.innerText = `${getText('combo')} x${combo}`;
            
            // Pulse Effect & Color Shift for UI
            let scale = 1 + Math.min(0.5, combo/40); // Increased scale limit
            let opacity = combo > 2 ? 1 : 0;
            let color = '#fff';
            
            if (combo >= 50) color = '#d53a9d';
            if (combo >= 100) {
                color = '#ffd700';
                scale += 0.2; // Extra pop for high combo
            }

            comboDisplay.style.opacity = opacity;
            comboDisplay.style.transform = `scale(${scale})`;
            comboDisplay.style.color = color;
            comboDisplay.style.textShadow = `0 0 10px ${color}`;
        }
    }

    function showRating(text, cssClass) {
        if (!ratingContainer) return;
        const el = document.createElement('div');
        el.className = `hit-rating ${cssClass}`;
        el.innerText = text;
        ratingContainer.appendChild(el);
        setTimeout(() => el.remove(), 500);
    }

    function toggleHoldEffect(lane, active, color) {
        if (!holdEffectsContainer) return;
        let effect = document.getElementById(`hold-effect-${lane}`);
        if (!effect) {
            effect = document.createElement('div');
            effect.id = `hold-effect-${lane}`;
            effect.className = 'long-note-hold-effect';
            effect.style.left = (lane * 25) + '%';
            holdEffectsContainer.appendChild(effect);
        }
        if (active) {
            effect.style.background = `linear-gradient(to top, ${color}, transparent)`;
            effect.style.display = 'block';
        } else {
            effect.style.display = 'none';
        }
    }

    function updateProgressBar(current, total) {
        if (!progressBar) return;
        const pct = Math.min(100, (current / total) * 100);
        progressBar.style.width = `${pct}%`;
        if (starsElements[0]) pct > 33 ? starsElements[0].classList.add('active') : starsElements[0].classList.remove('active');
        if (starsElements[1]) pct > 66 ? starsElements[1].classList.add('active') : starsElements[1].classList.remove('active');
        if (starsElements[2]) pct > 95 ? starsElements[2].classList.add('active') : starsElements[2].classList.remove('active');
    }

    function endGame(victory) {
        isPlaying = false;
        if (sourceNode) sourceNode.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        if(bgMusicEl && !isMuted) bgMusicEl.play().catch(()=>{});

        const title = document.getElementById('end-title');
        if (title) {
            title.innerText = victory ? getText('complete') : getText('failed');
            title.style.color = victory ? "#66FCF1" : "#FF0055";
        }
        const scoreEl = document.getElementById('final-score');
        if(scoreEl) scoreEl.innerText = score;

        let starsCount = 0;
        const ratio = score / (maxPossibleScore || 1); 

        if (ratio > 0.2) starsCount = 1;
        if (ratio > 0.5) starsCount = 2;
        if (ratio > 0.8) starsCount = 3; 

        if (victory && starsCount === 0) starsCount = 1;
        
        if (score > 0) saveGameData(songsDB[currentSongIndex].title, score, starsCount);

        let starsStr = "";
        for(let i=0; i<3; i++) starsStr += i < starsCount ? "★" : "☆";
        const starEl = document.getElementById('final-stars');
        if(starEl) starEl.innerText = starsStr;

        const resScreen = document.getElementById('result-screen');
        if(resScreen) resScreen.classList.remove('hidden');
        
        updateGameText();
    }

    /* --- INIT --- */
    function initControls() {
        const lanesContainer = document.getElementById('lanes-bg');
        if (lanesContainer) for(let i=0; i<4; i++) laneElements[i] = lanesContainer.children[i];

        function togglePauseGame() {
            if (!isPlaying) return;
            isPaused = !isPaused;
            const m = document.getElementById('pause-modal');
            if (isPaused) {
                audioCtx.suspend();
                if(m) m.classList.remove('hidden');
            } else {
                audioCtx.resume();
                if(m) m.classList.add('hidden');
                gameLoop();
            }
            playClick(); 
        }

        window.addEventListener('keydown', e => { 
            if (e.code === 'Space') {
                e.preventDefault();
                togglePauseGame();
                return;
            }
            if (!e.repeat) { 
                const lane = KEYS.indexOf(e.code); 
                if (lane !== -1) handleInputDown(lane); 
            } 
        });
        window.addEventListener('keyup', e => { const lane = KEYS.indexOf(e.code); if (lane !== -1) handleInputUp(lane); });

        if (canvas) {
            canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const rect = canvas.getBoundingClientRect(); for (let i=0; i<e.changedTouches.length; i++) handleInputDown(Math.floor((e.changedTouches[i].clientX - rect.left) / (canvas.width / 4))); }, {passive: false});
            canvas.addEventListener('touchend', (e) => { e.preventDefault(); const rect = canvas.getBoundingClientRect(); for (let i=0; i<e.changedTouches.length; i++) handleInputUp(Math.floor((e.changedTouches[i].clientX - rect.left) / (canvas.width / 4))); }, {passive: false});
            canvas.addEventListener('mousedown', (e) => { handleInputDown(Math.floor((e.clientX - canvas.getBoundingClientRect().left) / (canvas.width / 4))); setTimeout(() => handleInputUp(Math.floor((e.clientX - canvas.getBoundingClientRect().left) / (canvas.width / 4))), 150); });
        }

        const tBtn = document.getElementById('themeToggle');
        if(tBtn) {
            tBtn.onclick = () => {
                playClick();
                const b = document.body;
                const isDark = b.getAttribute('data-theme') === 'dark' || !b.getAttribute('data-theme');
                const newTheme = isDark ? 'light' : 'dark';
                b.setAttribute('data-theme', newTheme);
                tBtn.innerText = isDark ? '☀️' : '🌙'; 
                localStorage.setItem('siteTheme', newTheme);
            };
            tBtn.onmouseenter = playHover;
        }
        
        const lBtn = document.getElementById('langToggle');
        if(lBtn) {
            lBtn.onclick = (e) => { playClick(); e.stopPropagation(); document.querySelector('.lang-wrapper').classList.toggle('open'); };
            lBtn.onmouseenter = playHover;
        }
        
        document.querySelectorAll('.lang-dropdown button').forEach(b => {
            b.onclick = () => {
                 playClick();
                 currentLang = b.dataset.lang;
                 localStorage.setItem('siteLang', currentLang);
                 document.body.setAttribute('data-lang', currentLang);
                 updateGameText();
            };
            b.onmouseenter = playHover;
        });

        const sBtn = document.getElementById('soundToggle');
        if (sBtn) {
            sBtn.onclick = () => {
                playClick();
                isMuted = !isMuted;
                localStorage.setItem('isMuted', isMuted);
                if (masterGain) masterGain.gain.value = isMuted ? 0 : 1;
                sBtn.innerText = isMuted ? '🔇' : '🔊';
                if(bgMusicEl) {
                    if(isMuted) bgMusicEl.pause();
                    else if(!isPlaying) bgMusicEl.play().catch(()=>{});
                }
            };
            sBtn.onmouseenter = playHover;
        }
        
        const backBtn = document.getElementById('global-back-btn');
        if(backBtn) {
            backBtn.style.position = 'fixed';
            backBtn.style.top = '20px';
            backBtn.style.left = '20px';
            backBtn.style.zIndex = '1000'; 
            backBtn.style.background = 'rgba(0,0,0,0.6)';
            backBtn.style.color = '#fff';
            backBtn.style.border = '1px solid rgba(255,255,255,0.2)';
            backBtn.style.borderRadius = '30px';
            backBtn.style.padding = '8px 20px';
            backBtn.style.cursor = 'pointer';
            backBtn.style.backdropFilter = 'blur(5px)';
            backBtn.style.fontFamily = 'Montserrat, sans-serif';
            
            backBtn.onclick = () => { 
                playClick();
                if(isPlaying) quitGame(); else window.location.href = 'index.html'; 
            };
            backBtn.onmouseenter = playHover;
        }

        const qBtn = document.getElementById('btn-quit'); 
        if(qBtn) { qBtn.onclick = () => { playClick(); quitGame(); }; qBtn.onmouseenter = playHover; }
        
        const meBtn = document.getElementById('btn-menu-end'); 
        if(meBtn) { meBtn.onclick = () => { playClick(); quitGame(); }; meBtn.onmouseenter = playHover; }
        
        const pBtn = document.getElementById('btn-pause'); 
        if(pBtn) { pBtn.onclick = togglePauseGame; pBtn.onmouseenter = playHover; }
        
        const rBtn = document.getElementById('btn-resume'); 
        if(rBtn) { rBtn.onclick = togglePauseGame; rBtn.onmouseenter = playHover; }
        
        const resBtn = document.getElementById('btn-restart'); 
        if(resBtn) { 
            resBtn.onclick = () => { 
                playClick();
                document.getElementById('result-screen').classList.add('hidden'); 
                resetGameState(); 
                setTimeout(() => startGame(currentSongIndex), 50); 
            }; 
            resBtn.onmouseenter = playHover;
        }
        
        updateLangDisplay();
    }

    function resizeCanvas() { if (gameContainer && gameContainer.clientWidth && canvas) { canvas.width = gameContainer.clientWidth; canvas.height = gameContainer.clientHeight; } }
    window.addEventListener('resize', resizeCanvas);

    if(localStorage.getItem('siteLang')) { currentLang = localStorage.getItem('siteLang'); document.body.setAttribute('data-lang', currentLang); }

    function startGame(idx) {
        if(bgMusicEl) bgMusicEl.pause();

        resetGameState();
        const mySession = currentSessionId;
        currentSongIndex = idx;
        const song = songsDB[idx];
        if(menuLayer) menuLayer.classList.add('hidden');
        if(gameContainer) gameContainer.classList.remove('hidden');
        if(loader) loader.classList.remove('hidden');
        resizeCanvas();
        updateGameText();
        analyzeAudio(`audio/tracks/${song.file}`, mySession).then(generatedTiles => {
            if (mySession !== currentSessionId) return;
            if (generatedTiles) { mapTiles = generatedTiles; if(loader) loader.classList.add('hidden'); playMusic(); }
        });
    }

    function playMusic() {
        if (sourceNode) sourceNode.stop();
        sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(masterGain); 
        
        const startDelay = 2; 
        startTime = audioCtx.currentTime + startDelay;
        sourceNode.start(startTime);

        isPlaying = true; isPaused = false;
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function quitGame() {
        if(bgMusicEl && !isMuted) bgMusicEl.play().catch(()=>{});

        resetGameState();
        if(gameContainer) gameContainer.classList.add('hidden');
        if(menuLayer) menuLayer.classList.remove('hidden');
        renderMenu();
    }

    initControls();
    renderMenu();
});