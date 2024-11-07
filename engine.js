function loadupdate() {
    if (navigator.onLine) {
        createCyberPopup('<br><br><h2 class=&quot;glitch-text&quot;>Sent update message, reload to apply update.<h2><br><br>');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.active.postMessage({ action: 'updateCache' });
            });
        };
    } else {
        createCyberPopup('<br><br><h2 class=&quot;glitch-text&quot;>Internet is required to download updates.<h2><br><br>');
    };
};
function createCyberPopup(content) {
    // Remove any existing popups
    destroyAllPopups();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'cyber-popup-overlay';

    // Create background effects
    const background = document.createElement('div');
    background.className = 'cyber-background';
    for (let i = 0; i < 8; i++) {
        const bar = document.createElement('div');
        bar.className = i < 4 ? 'cyber-bar' : 'cyber-bar-vertical';
        background.appendChild(bar);
    }
    overlay.appendChild(background);

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'cyber-popup';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cyber-close';
    closeBtn.onclick = () => destroyAllPopups();

    // Set content
    popup.innerHTML = content;
    popup.appendChild(closeBtn);

    // Add to DOM
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Trigger animations
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        popup.classList.add('active');
    });

    // Add escape key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            destroyAllPopups();
        }
    });
}

function destroyAllPopups() {
    const overlays = document.querySelectorAll('.cyber-popup-overlay');
    overlays.forEach(overlay => {
        const popup = overlay.querySelector('.cyber-popup');
        popup.classList.add('destroy');
        overlay.style.transition = 'opacity 0.8s';
        overlay.style.opacity = '0';

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 800);
    });
}

document.querySelector('.pause-btn').addEventListener('click', function(event) {
    event.stopPropagation();
    // Your button logic here
  });
  

// Game state management
const gameState = {
    isTyping: false,
    currentScene: null,
    paused: false,
    auto: false,
    autoDelay: 2000, // Time to wait before auto-advancing (ms)
    skipMode: false
};

// Core game functions
function startGame() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-interface').classList.add('active');
    runDemo();
}

// Demo loop
async function runDemo() {
    while (true) {
        // Play through demo dialogue
        await playScene({
            background: './images/scene/park.webp',
            character: './images/icon.png',
            speaker: "System",
            dialogue: "Memory reset..."
        });

        await playScene({
            background: './images/scene/park.webp',
            character: './images/akira/image2.png',
            speaker: "...",
            dialogue: "Hi! I'm Akira..."
        });

        await playScene({
            background: './images/scene/park.webp',
            character: './images/akira/image2.png',
            speaker: "Akira",
            dialogue: "Umm..."
        });

        const choice = await playScene({
            background: './images/scene/park.webp',
            character: './images/akira/image1.png',
            speaker: "Akira",
            dialogue: "Why exactly did you come here?",
            choices: ["I'm stuck in a game demo loop.", "That's not your business.", "..."]
        });

        if (choice == 2) {
            await playScene({
                background: './images/scene/park.webp',
                character: './images/akira/image2.png',
                speaker: "Akira",
                dialogue: "???"
            })
        };
        if (choice == 0) {
            await playScene({
                background: './images/scene/park.webp',
                character: './images/akira/image2.png',
                speaker: "Akira",
                dialogue: "You're right! I can't access any memories with you, but your name is registered in my history..."
            })
        };
        if (choice == 1) {
            await playScene({
                background: './images/scene/park.webp',
                character: './images/akira/image2.png',
                speaker: "Akira",
                dialogue: "Fine have it your way."
            })
        };
    };

}




// Scene management
async function playScene(sceneData) {
    return new Promise((resolve) => {
        var scene = document.querySelector('.scene');
        var character = document.querySelector('.character');
        var indicator = document.querySelector('.continue-indicator');

        // Set scene elements
        scene.style.backgroundImage = `url(${sceneData.background})`;
        character.src = sceneData.character;
        document.querySelector('.speaker').textContent = sceneData.speaker;

        // Type dialogue
        typeDialogue(sceneData.dialogue, () => {
            if (sceneData.choices) {
                setTimeout(() => {
                    showChoices(sceneData.choices, resolve);
                }, 20);
            } else {
                // Show continue indicator
                indicator.classList.add('active');

                // Handle continuation
                function continueScene() {
                    if (!gameState.isTyping) {
                        indicator.classList.remove('active');
                        document.removeEventListener('click', continueScene);
                        resolve();
                    };
                }

                document.addEventListener('click', continueScene);

                // Auto-advance if enabled
                if (gameState.auto && !sceneData.choices) {
                    setTimeout(() => {
                        if (!gameState.paused) continueScene();
                    }, gameState.autoDelay);
                }
            }
        });
    });
}

function typeDialogue(text, onComplete) {
    const dialogueElement = document.querySelector('.dialogue');
    const indicator = document.querySelector('.continue-indicator');
    gameState.isTyping = true;
    indicator.classList.remove('active');
    let index = 0;

    function type() {
        if (index < text.length && !gameState.skipMode) {
            dialogueElement.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, 100);
        } else {
            // If skipping or finished typing
            dialogueElement.textContent = text;
            gameState.isTyping = false;
            if (onComplete) onComplete();
        }
    }

    dialogueElement.textContent = '';
    type();

    // Click to complete typing
    document.addEventListener('click', function completeTyping() {
        if (gameState.isTyping) {
            gameState.isTyping = false;
            dialogueElement.textContent = text;
            if (onComplete) onComplete();
            document.removeEventListener('click', completeTyping);
        }
    });
}

// Previous functions remain the same


function showChoices(choices, resolve) {
    const choicesContainer = document.querySelector('.choices');
    choicesContainer.innerHTML = '';
    choicesContainer.classList.add('active');

    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => {
            choicesContainer.classList.remove('active');
            resolve(index);
        };
        choicesContainer.appendChild(button);
    });
}


function togglexPause() {
    gameState.paused = !gameState.paused;
    document.querySelector('.pause-menu').classList.toggle('active');
}

function returnToTitle() {
    document.getElementById('game-interface').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
    document.querySelector('.pause-menu').classList.remove('active');
}

function togglexAuto() {
    gameState.auto = !gameState.auto;
    document.querySelector('[onclick="toggleAuto"]').style.background =
        gameState.auto ? 'var(--primary)' : 'transparent';
}

function togglexSkip() {
    gameState.skipMode = !gameState.skipMode;
    document.querySelector('[onclick="toggleSkip"]').style.background =
        gameState.skipMode ? 'var(--primary)' : 'transparent';
}