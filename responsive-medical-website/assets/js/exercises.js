/*=============== EXERCISES & GAMES LOGIC ===============*/

// Exercise Category Filtering with Animation
function showCategory(category) {
    const cards = document.querySelectorAll('.exercise-card');
    const tabs = document.querySelectorAll('.tab-btn');

    // Update active tab
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.innerText.toLowerCase() === category || (category === 'all' && tab.innerText === 'All')) {
            tab.classList.add('active');
        }
    });

    // Animate cards filtering
    cards.forEach((card, index) => {
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
            // Staggered entrance
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.pointerEvents = 'auto';
            }, 50 * index);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.95)';
            card.style.pointerEvents = 'none';
            // Use timeout to set display none after animation
            setTimeout(() => {
                if (card.style.opacity === '0') card.style.display = 'none';
            }, 500);
        }
    });
}

// Modal Management
const overlay = document.getElementById('exercise-overlay');
const content = document.getElementById('exercise-content');

function openExercise(type) {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Add opening animation class or handle via CSS
    overlay.classList.add('active');

    switch (type) {
        case 'breathing':
            initBreathing();
            break;
        case 'gratitude-game':
            initGratitudeGame();
            break;
        case 'mindset-challenge':
            initMindsetChallenge();
            break;
        case 'affirmations':
            initAffirmations();
            break;
    }
}

function closeExercise() {
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        content.innerHTML = '';
    }, 300);

    // Clear any running intervals or timeouts
    if (window.gameInterval) clearInterval(window.gameInterval);
    if (window.breathingInterval) clearInterval(window.breathingInterval);
}

// Close on click outside modal
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeExercise();
});

/*=============== ZEN BREATHING ===============*/
function initBreathing() {
    content.innerHTML = `
        <div class="breathing-container">
            <h2>Zen Breathing</h2>
            <p>Find a comfortable position and follow the circle. Let your body relax with each cycle.</p>
            <div class="breath-circle" id="breath-circle"></div>
            <div class="breath-text" id="breath-text">Get Ready...</div>
        </div>
    `;

    const circle = document.getElementById('breath-circle');
    const text = document.getElementById('breath-text');
    let state = 'inhale';

    const breathe = () => {
        if (!circle) return; // Modal closed
        if (state === 'inhale') {
            circle.classList.add('inhale');
            text.innerText = 'Inhale';
            text.style.color = 'var(--first-color)';
            state = 'exhale';
        } else {
            circle.classList.remove('inhale');
            text.innerText = 'Exhale';
            text.style.color = 'var(--first-color-alt)';
            state = 'inhale';
        }
    };

    // Delay start for preparation
    setTimeout(() => {
        breathe();
        window.breathingInterval = setInterval(breathe, 4000);
    }, 1500);
}

/*=============== GRATITUDE BUBBLES GAME ===============*/
const gratitudePrompts = [
    "A good friend", "Sunny weather", "Warm coffee", "My health",
    "A kind stranger", "Music", "Learning something new", "My family",
    "A cozy bed", "Nature walk", "Good food", "A funny joke",
    "Small wins", "Deep sleep", "Fresh air", "Self-love",
    "Quiet moments", "Morning light", "Favorite book", "Kind words"
];

function initGratitudeGame() {
    content.innerHTML = `
        <div class="gratitude-game">
            <div class="section-header" style="text-align: center; margin-bottom: 2rem;">
                <h2>Gratitude Bubbles</h2>
                <p>Gentle reminders of the good things in life. Tap each bubble to reflect on its meaning.</p>
            </div>
            <div class="score-panel" style="background: rgba(0, 163, 255, 0.05); padding: 1.5rem; border-radius: 1.5rem; margin-bottom: 2rem; border: 1px dashed rgba(0, 163, 255, 0.2);">
                <div style="font-weight: 700; color: var(--title-color);">Points of Gratitude: <span id="game-score" style="color: var(--first-color); font-size: 1.5rem;">0</span></div>
                <div id="last-prompt" style="color: var(--first-color); font-style: italic; margin-top: 0.5rem; font-weight: 500;"></div>
            </div>
            <div class="game-area" id="game-area" style="height: 450px;"></div>
        </div>
    `;

    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('game-score');
    const lastPromptDisplay = document.getElementById('last-prompt');
    let score = 0;

    const createBubble = () => {
        if (!gameArea) return; // Modal closed
        const bubble = document.createElement('div');
        const prompt = gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)];

        bubble.className = 'bubble';
        bubble.innerText = prompt;

        const size = Math.random() * 70 + 90;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * (gameArea.offsetWidth - size)}px`;
        bubble.style.display = 'flex';
        bubble.style.alignItems = 'center';
        bubble.style.justifyContent = 'center';

        bubble.onclick = () => {
            score++;
            scoreDisplay.innerText = score;
            lastPromptDisplay.innerText = `Reflection: ${prompt}`;

            // Pop animation
            bubble.style.transition = '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            bubble.style.transform = 'scale(1.3)';
            bubble.style.opacity = '0';

            setTimeout(() => {
                if (bubble.parentElement) bubble.remove();
            }, 300);
        };

        gameArea.appendChild(bubble);

        // Auto remove after animation completes
        setTimeout(() => {
            if (bubble.parentElement) {
                bubble.style.opacity = '0';
                setTimeout(() => bubble.remove(), 500);
            }
        }, 4800);
    };

    window.gameInterval = setInterval(createBubble, 1100);
}

/*=============== GROWTH MINDSET CHALLENGE ===============*/
const mindsetPairs = [
    { fixed: "I'm either good at it or I'm not.", growth: "I can learn to do anything I want." },
    { fixed: "Failure is the limit of my abilities.", growth: "Failure is an opportunity to grow." },
    { fixed: "I stick to what I know.", growth: "I am inspired by the success of others." },
    { fixed: "This is too hard, I give up.", growth: "Challenges help me get stronger." },
    { fixed: "My potential is predetermined.", growth: "I can always improve if I put in the effort." },
    { fixed: "I don't like feedback.", growth: "Feedback helps me learn and improve." }
];

function initMindsetChallenge() {
    content.innerHTML = `
        <div class="mindset-container">
            <div class="mindset-header">
                <h2>Reframe Your Perspective</h2>
                <p>Transform fixed thoughts into growth-oriented ones. Click each card to reframe the thought.</p>
            </div>
            <div id="mindset-area"></div>
            <div style="text-align: center; margin-top: 2rem;">
                <button class="button" style="padding: 1rem 2rem; border-radius: 1rem;" onclick="initMindsetChallenge()">Get New Scenarios</button>
            </div>
        </div>
    `;

    const area = document.getElementById('mindset-area');
    const selected = [...mindsetPairs].sort(() => 0.5 - Math.random()).slice(0, 3);

    selected.forEach((pair, index) => {
        const row = document.createElement('div');
        row.className = 'mindset-card-pair';
        row.style.marginBottom = '2rem';
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        row.style.transition = '0.5s ease forwards';
        row.style.transitionDelay = `${index * 150}ms`;

        row.innerHTML = `
            <div class="mindset-box fixed-mindset" id="fixed-${index}" onclick="reframe(${index})" style="cursor: pointer; transition: 0.3s;">
                <strong style="display: block; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; color: #ff4d4d;">Fixed Mindset</strong>
                <span style="font-size: 1.1rem; font-weight: 500;">"${pair.fixed}"</span>
            </div>
            <div class="mindset-box growth-mindset" id="growth-${index}" style="opacity: 0.1; filter: blur(4px); transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
                <strong style="display: block; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; color: #00c853;">Growth Mindset</strong>
                <span id="growth-text-${index}" style="font-size: 1.1rem; font-weight: 500;">Tap the fixed thought...</span>
            </div>
        `;
        area.appendChild(row);

        // Trigger reveal
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 100);
    });

    window.reframe = (idx) => {
        const growthBox = document.getElementById(`growth-${idx}`);
        const growthText = document.getElementById(`growth-text-${idx}`);
        const fixedBox = document.getElementById(`fixed-${idx}`);

        growthBox.style.opacity = '1';
        growthBox.style.filter = 'blur(0)';
        growthBox.style.transform = 'scale(1.02)';
        growthText.innerText = `"${selected[idx].growth}"`;
        growthText.style.color = '#008a2e';

        fixedBox.style.textDecoration = 'line-through';
        fixedBox.style.opacity = '0.4';
        fixedBox.style.transform = 'scale(0.98)';
        fixedBox.style.pointerEvents = 'none';

        setTimeout(() => {
            growthBox.style.transform = 'scale(1)';
        }, 200);
    };
}

/*=============== DAILY AFFIRMATIONS ===============*/
const affirmations = [
    "I am worthy of all the good things that come my way.",
    "I have the power to create the life I desire.",
    "My peace is my priority, and I protect it fiercely.",
    "I am resilient, and I grow stronger with every challenge.",
    "I forgive myself for not being perfect, I am enough as I am.",
    "Today, I choose joy and self-compassion.",
    "I trust my intuition and my ability to make the right decisions.",
    "I am surrounded by love and support.",
    "My mind is calm, and my heart is at peace.",
    "I am capable of achieving incredible things."
];

function initAffirmations() {
    content.innerHTML = `
        <div class="affirmation-box" style="padding: 3rem 1rem;">
            <div class="quote-icon" style="font-size: 4rem; color: rgba(0, 163, 255, 0.1); margin-bottom: 1rem;"><i class="ri-double-quotes-l"></i></div>
            <div class="affirmation-text" id="aff-text" style="font-size: 1.8rem; font-family: inherit; font-weight: 600; min-height: 120px; display: flex; align-items: center; justify-content: center;">Generating brilliance...</div>
            <div class="quote-icon" style="font-size: 4rem; color: rgba(0, 163, 255, 0.1); margin-top: 1rem; text-align: right;"><i class="ri-double-quotes-r"></i></div>
            <div style="margin-top: 3rem;">
                <button class="button" style="padding: 1.2rem 2.5rem; border-radius: 1.2rem;" onclick="generateAffirmation()">Empower Me Again</button>
            </div>
        </div>
    `;
    generateAffirmation();
}

window.generateAffirmation = () => {
    const text = document.getElementById('aff-text');
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];

    text.style.opacity = '0';
    text.style.transform = 'translateY(10px)';

    setTimeout(() => {
        text.innerText = `"${random}"`;
        text.style.opacity = '1';
        text.style.transform = 'translateY(0)';
        text.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 300);
};

// Initial Card Animation on Load
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.exercise-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';

        setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 150 + (index * 100));
    });
});
