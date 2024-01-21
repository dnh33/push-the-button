let playerScore = 0;
let userId = ''; // This will be set after wallet connection

// Check if Panda Wallet is available
if (typeof panda !== 'undefined') {
    console.log('Panda Wallet detected.');
} else {
    console.log('Panda Wallet not detected.');
    alert('Please install Panda Wallet to continue.');
}

// Function to connect to Panda Wallet
async function connectPandaWallet() {
    try {
        if (panda.isReady) {
            const identityPubKey = await panda.connect();
            if (identityPubKey) {
                console.log(
                    'Connected to Panda Wallet with Public Key:',
                    identityPubKey
                );
                userId = identityPubKey; // Use public key as user ID
                toggleLoginState(true);
            } else {
                toggleLoginState(false);
            }
        }
    } catch (error) {
        console.error('Error connecting to Panda Wallet:', error);
    }
}

// Function to toggle login button and logged-in indicator
function toggleLoginState(isLoggedIn) {
    const loginButton = document.getElementById('login-button');
    const loggedInIndicator = document.getElementById('logged-in-indicator');

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        loggedInIndicator.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        loggedInIndicator.style.display = 'none';
    }
}

// Event listener for the game button
document
    .getElementById('push-button')
    .addEventListener('click', async function () {
        if (!userId) {
            alert('Please log in with Panda Wallet to play the game.');
            return;
        }

        playerScore++;
        document.getElementById('player-score').innerText = playerScore;

        // Send the updated score to the backend
        fetch('/update-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, score: 1 }), // Increment score by 1
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Score updated:', data);
                // Optional: Update leaderboard here
            })
            .catch((error) => {
                console.error('Error updating score:', error);
            });
    });

// Event listener to initiate Panda Wallet connection
document
    .getElementById('login-button')
    .addEventListener('click', async function () {
        await connectPandaWallet();
    });

// At initial load, check if the user is already connected to Panda Wallet
window.addEventListener('load', async function () {
    if (typeof panda !== 'undefined' && panda.isReady) {
        // Optionally, automatically attempt to connect to Panda Wallet on load
        await connectPandaWallet();
    }
});
