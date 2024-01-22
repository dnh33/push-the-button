// Function to initialize Panda Wallet provider
const initProvider = () => {
    if (window.panda && window.panda.isReady) {
        return window.panda;
    } else {
        console.error('Panda Wallet provider not found.');
        return null;
    }
};

const wallet = initProvider();
let playerScore = 0;
let userId = '';

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

// Function to handle payment
async function handlePayment() {
    try {
        const paymentParams = [
            {
                satoshis: 1000,
                address: '18VcgMd5HsQRGUe2XZe1HB24PZFPC8WKSm',
            },
        ];

        const { txid, rawtx } = await panda.sendBsv(paymentParams);
        console.log('Txid', txid);

        // Assuming transaction is successful
        return true;
    } catch (err) {
        console.error('Error handling payment:', err);
        return false;
    }
}

// Function to toggle login button and logged-in indicator
function toggleLoginState(isLoggedIn) {
    const loginButton = document.getElementById('login-button');
    const loggedInIndicator = document.getElementById('logged-in-indicator');
    const pushButton = document.getElementById('push-button');

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        loggedInIndicator.style.display = 'block';
        pushButton.disabled = false; // Enable the button
    } else {
        loginButton.style.display = 'block';
        loggedInIndicator.style.display = 'none';
        pushButton.disabled = true; // Disable the button
    }
}

// Function to check if the user can click
async function canUserClick(userId) {
    try {
        const response = await fetch('/can-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error('You can only click once every 24 hours.');
        }
        return response.json();
    } catch (error) {
        console.error('Error checking click permission:', error);
        throw error;
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

        try {
            const clickCheck = await canUserClick(userId);
            if (!clickCheck.canClick) {
                alert('You can only click once every 24 hours.');
                return;
            }

            const paymentSuccess = await handlePayment();
            if (!paymentSuccess) return;

            fetch('/update-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, score: 1 }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error updating score.');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Score updated:', data);
                    playerScore++;
                    document.getElementById('player-score').innerText =
                        playerScore;
                    updateLeaderboard(); // Update the leaderboard after score update
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert(error.message);
                });
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });

// Event listener to initiate Panda Wallet connection
document
    .getElementById('login-button')
    .addEventListener('click', async function () {
        await connectPandaWallet();
    });

// Function to update the leaderboard
function updateLeaderboard() {
    fetch('/leaderboard')
        .then((response) => response.json())
        .then((data) => {
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = ''; // Clear existing list

            data.data.forEach((player, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${
                    player.userId
                } - Score: ${player.score}`;
                leaderboardList.appendChild(listItem);
            });
        })
        .catch((error) => console.error('Error fetching leaderboard:', error));
}

// At initial load, check if the user is already connected to Panda Wallet
window.addEventListener('load', async function () {
    if (panda && panda.isReady) {
        await connectPandaWallet();
    }

    updateLeaderboard(); // Update leaderboard on initial load
});
