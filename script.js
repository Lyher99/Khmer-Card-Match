// Game Configuration
const config = {
    initialLevel: 1,
    initialCardsPerLevel: 6, // 3 pairs
    cardsIncreasePerLevel: 2, // Add 1 more pair per level
    timePerLevel: 60,
    timeDecreasePerLevel: 5,
    cardImages: [
        'images/1.webp',
        'images/2.webp',
        'images/3.webp',
        'images/4.webp',
        'images/5.webp',
        'images/6.webp',
        'images/7.webp',
        'images/8.webp',
        'images/9.webp',
        'images/10.webp',
        'images/11.webp',
        'images/12.webp',
        'images/13.webp',
        'images/14.webp',
        'images/15.webp',
        'images/16.webp',
        'images/17.webp',
        'images/18.webp',
        'images/19.webp',
        'images/20.webp',
        'images/21.webp',
        'images/22.webp',
        'images/23.webp',
        'images/24.webp',
        'images/25.webp',
        'images/26.webp',
        'images/27.webp',
        'images/28.webp',
        'images/29.webp',
        'images/30.webp',
        'images/31.webp',
        'images/32.webp',
        'images/33.webp',
        'images/34.webp',
        'images/35.webp',
        'images/36.webp'
    ]
};

// Game State
let gameState = {
    level: config.initialLevel,
    timeLeft: config.timePerLevel,
    moves: 0,
    flippedCards: [],
    matchedPairs: 0,
    gameStarted: false,
    timer: null,
    isPaused: false
};

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const levelDisplay = document.getElementById('level');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const startButton = document.getElementById('startGame');
const restartButton = document.getElementById('restartGame');
const pauseButton = document.getElementById('pauseGame');
const gameMessage = new bootstrap.Modal(document.getElementById('gameMessage'));
const messageText = document.getElementById('messageText');

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
pauseButton.addEventListener('click', togglePause);

// Initialize Game
function initGame() {
    gameBoard.innerHTML = '';
    const cards = createCards();
    shuffleCards(cards);
    renderCards(cards);
    updateDisplay();
}

// Calculate cards for current level
function getCardsForLevel() {
    return config.initialCardsPerLevel + ((gameState.level - 1) * config.cardsIncreasePerLevel);
}

// Create Cards
function createCards() {
    const numPairs = getCardsForLevel() / 2;
    const cards = [];
    const images = config.cardImages.slice(0, numPairs);
    
    images.forEach(image => {
        // Create two cards for each image
        for (let i = 0; i < 2; i++) {
            cards.push({
                image: image,
                id: `${image}-${i}`
            });
        }
    });
    
    return cards;
}

// Shuffle Cards
function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Render Cards
function renderCards(cards) {
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="card-front">
                <img src="${card.image}" alt="Card" class="card-image">
            </div>
            <div class="card-back"></div>
        `;
        
        cardElement.addEventListener('click', () => flipCard(cardElement));
        gameBoard.appendChild(cardElement);
    });
}

// Flip Card
function flipCard(cardElement) {
    if (!gameState.gameStarted || gameState.isPaused) return;
    if (gameState.flippedCards.length >= 2) return;
    if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) return;
    
    cardElement.classList.add('flipped');
    gameState.flippedCards.push(cardElement);
    
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateDisplay();
        checkMatch();
    }
}

// Check Match
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const match = card1.dataset.id.split('-')[0] === card2.dataset.id.split('-')[0];
    
    if (match) {
        handleMatch(card1, card2);
    } else {
        handleMismatch(card1, card2);
    }
}

// Handle Match
function handleMatch(card1, card2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    card1.classList.add('match-animation');
    card2.classList.add('match-animation');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        card1.classList.remove('match-animation');
        card2.classList.remove('match-animation');
    }, 500);
    
    gameState.matchedPairs++;
    
    if (gameState.matchedPairs === getCardsForLevel() / 2) {
        handleLevelComplete();
    }
    
    gameState.flippedCards = [];
}

// Handle Mismatch
function handleMismatch(card1, card2) {
    setTimeout(() => {
        if (!card1.classList.contains('matched') && !card2.classList.contains('matched')) {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }
        gameState.flippedCards = [];
    }, 1000);
}

// Handle Level Complete
function handleLevelComplete() {
    clearInterval(gameState.timer);
    gameState.gameStarted = false;
    
    if (gameState.timeLeft > 0) {
        gameState.level++;
        const nextLevelCards = getCardsForLevel();
        showMessage(`Level ${gameState.level - 1} Complete! Get ready for level ${gameState.level} with ${nextLevelCards} cards!`);
        setTimeout(() => {
            startGame();
        }, 2000);
    } else {
        showMessage('Game Over! Time\'s up!');
    }
}

// Start Game
function startGame() {
    gameState = {
        level: gameState.level,
        timeLeft: config.timePerLevel - (gameState.level - 1) * config.timeDecreasePerLevel,
        moves: 0,
        flippedCards: [],
        matchedPairs: 0,
        gameStarted: true,
        timer: null,
        isPaused: false
    };
    
    initGame();
    startTimer();
    startButton.disabled = true;
    pauseButton.disabled = false;
}

// Restart Game
function restartGame() {
    gameState.level = config.initialLevel;
    startGame();
}

// Toggle Pause
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
    
    if (gameState.isPaused) {
        clearInterval(gameState.timer);
    } else {
        startTimer();
    }
}

// Start Timer
function startTimer() {
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            updateDisplay();
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timer);
                handleLevelComplete();
            }
        }
    }, 1000);
}

// Update Display
function updateDisplay() {
    levelDisplay.textContent = gameState.level;
    timerDisplay.textContent = gameState.timeLeft;
    movesDisplay.textContent = gameState.moves;
}

// Show Message
function showMessage(message) {
    messageText.textContent = message;
    gameMessage.show();
}

// Initialize the game
initGame(); 