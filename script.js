// Revisit project after web dev practice. Look for notes in parenthesis for updates needed. Add more notes to HTML and CSS

// 1. DOM Element References and Game Constants

// Get references to HTML elements using their IDs
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const ground = document.getElementById('ground');
const block1 = document.getElementById('block-1');
const block2 = document.getElementById('block-2');
const block3 = document.getElementById('block-3');
const lightningBolt = document.getElementById('lightning-bolt');
const sideCharacter = document.getElementById('side-character'); 

// Define game-wide constants
const GAME_WIDTH = gameContainer.offsetWidth; // Get game container width from CSS
const GAME_HEIGHT = gameContainer.offsetHeight; // Get game container height from CSS
const PLAYER_SPEED = 5; // Pixels per frame for horizontal movement
const JUMP_STRENGTH = 15; // Initial upward velocity for jump
const GRAVITY = 0.8; // Pixels per frame per frame (acceleration due to gravity)
const LIGHTNING_SPEED = 10; // Pixels per frame for lightning bolt
const LIGHTNING_MAX_DISTANCE = 250; // Max distance in pixels (approx 5 "paces" if a pace is 50px)

// Store references to all platforms for  collision detection
const platforms = [ground, block1, block2, block3];


// 2. Player State Variables


let playerX = player.offsetLeft; // Current X position (from left)
let playerY = player.offsetTop;  // Current Y position (from top) Note to Self: CSS uses 'bottom', JS uses 'top' for internal calculations
let playerVelocityY = 0; // Current vertical speed (positive is up, negative is down)
let isOnGround = false; // Tests: Is the player currently standing on something?
let isJumping = false; // Tests: Is the player currently in a jump state?


// 3. Lightning Bolt State Variables


let lightningActive = false; // Tests: Is a lightning bolt currently visible/in flight?
let lightningX = 0; // Current X position of the lightning bolt
let lightningY = 0; // Current Y position of the lightning bolt
let lightningDirection = 1; // 1 for right, -1 for left (matches player direction when fired) *(NEEDS WORK)*
let lightningDistanceTraveled = 0; // How far the current bolt has traveled


// 4. Input Handling (Keyboard)


const keys = {}; // Object to keep track of currently pressed keys


document.addEventListener('keydown', (e) => {
    keys[e.key] = true; // Set key to true when pressed
});


document.addEventListener('keyup', (e) => {
    keys[e.key] = false; // Set key to false when released
});


// 5. Game Logic Functions


/**
 * Updates the player's position and handles jumping/gravity.
 */
function updatePlayer() {
    // Apply gravity
    playerVelocityY += GRAVITY;
    playerY += playerVelocityY;

    // Handle horizontal movement
    if (keys['ArrowLeft']) {
        playerX -= PLAYER_SPEED;
        // Note: Flip player sprite here, when I get one made 
    }
    if (keys['ArrowRight']) {
        playerX += PLAYER_SPEED;
        // Note: Flip player sprite here, when I get one made 
    }
    }

    // Keep player within game boundaries horizontally
    if (playerX < 0) playerX = 0;
    if (playerX + player.offsetWidth > GAME_WIDTH) playerX = GAME_WIDTH - player.offsetWidth;

    // Collision detection with platforms
    isOnGround = false; // Reset for each frame
    platforms.forEach(platform => {
        // Calculate platform's top, bottom, left, and right coordinates
        const platformRect = platform.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();

        // Convert platform's absolute screen coordinates to relative game-container coordinates
        const platformLeft = platformRect.left - gameRect.left;
        const platformTop = platformRect.top - gameRect.top;
        const platformRight = platformLeft + platform.offsetWidth;
        const platformBottom = platformTop + platform.offsetHeight;

        // Player's next position for collision check
        const playerNextY = playerY;
        const playerNextBottom = playerNextY + player.offsetHeight;
        const playerRight = playerX + player.offsetWidth;

        // Check for collision if player is falling and about to land on a platform
        if (playerVelocityY >= 0 && // Player is falling or still
            playerNextBottom >= platformTop && // Player's bottom is at or below platform's top
            playerNextY < platformBottom && 
            playerRight > platformLeft && 
            playerX < platformRight 
        ) {
            // If player lands on platform
            playerY = platformTop - player.offsetHeight; // Snap player to top of platform (NEEDS WORK, LOOKS ODD)
            playerVelocityY = 0; // Stop vertical movement
            isOnGround = true; // Player is on solid ground
            isJumping = false; // Reset jumping state
        }
    });

    // If player is falling off the bottom of the game container (This should be fixed with ground)
    if (playerY + player.offsetHeight > GAME_HEIGHT) {
        playerY = GAME_HEIGHT - player.offsetHeight; // Snap to bottom (ALL SNAPPING NEEDS REVISION, LOOKS ODD)
        playerVelocityY = 0;
        isOnGround = true;
        isJumping = false;
    }

    // Handle jump input
    if (keys['ArrowUp'] && isOnGround && !isJumping) {
        playerVelocityY = -JUMP_STRENGTH; // Apply upward velocity (negative because Y increases downwards)
        isOnGround = false; // No longer on ground
        isJumping = true; // Set jumping state
    }

    // Update player's visual position in the DOM
    player.style.left = `${playerX}px`;
    player.style.bottom = `${GAME_HEIGHT - playerY - player.offsetHeight}px`;
}

/**
 * Fires a lightning bolt from the player's position.
 */
function fireLightningBolt() {
    if (!lightningActive) { // Only fire if no bolt is currently active (Can change with future leveling features)
        lightningActive = true;
        lightningBolt.style.display = 'block'; // Make bolt visible

        // Position bolt near player, slightly to the right or left
        lightningDirection = 1; // Firing right for simplicity 
        lightningX = playerX + player.offsetWidth; // Start at player's right edge
        lightningY = playerY + (player.offsetHeight / 2) - (lightningBolt.offsetHeight / 2); // Center vertically with player (NEEDS CHANGE)

        lightningDistanceTraveled = 0; // Reset distance for new bolt
    }
}

/**
 * Update the lightning bolt's position and state.
 */
function updateLightningBolt() {
    if (lightningActive) {
        lightningX += LIGHTNING_SPEED * lightningDirection; // Move bolt horizontally
        lightningDistanceTraveled += LIGHTNING_SPEED; // Track distance

        // Update bolt's visual position
        lightningBolt.style.left = `${lightningX}px`;
        lightningBolt.style.bottom = `${GAME_HEIGHT - lightningY - lightningBolt.offsetHeight}px`;

        // Deactivate if it goes out of bounds or exceeds max distance
        if (lightningX < 0 || lightningX > GAME_WIDTH || lightningDistanceTraveled >= LIGHTNING_MAX_DISTANCE) {
            lightningActive = false;
            lightningBolt.style.display = 'none'; // Hide bolt
        }
    }
}

// 6. Main Game Loop


/**
 * Creating loop that updates game state and renders every frame.
 */
function gameLoop() {
    updatePlayer(); // Update player position and state
    updateLightningBolt(); // Update lightning bolt position and state

    // Request the next frame
    requestAnimationFrame(gameLoop);
}


// 7. Event Listener for Lightning Bolt 


document.addEventListener('keydown', (e) => {
    // Check if the key is 'Space' and fire the lightning bolt
    if (e.key === ' ' || e.key === 'Spacebar') { // 'Spacebar' for older browsers (KEEP IN MIND)
        fireLightningBolt();
    }
});


// 8. Initial Setup


// Adjust player's initial Y position to be relative to the top of the game container
playerY = GAME_HEIGHT - player.offsetHeight;

// Start the game loop when the window loads
window.onload = function() {
    gameLoop();
};