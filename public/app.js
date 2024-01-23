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
                updateUserScoreDisplay(); // Update score on successful login
                updatePrizePotDisplay(); // Update prize pot on successful login
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
                // 0.00001 BSV in Satoshis or change this to the amount you wish to send
                address: '18VcgMd5HsQRGUe2XZe1HB24PZFPC8WKSm',
                // Change this to your own address or a dedicated wallet address
            },
        ];

        const { txid, rawtx } = await panda.sendBsv(paymentParams);
        console.log('Txid', txid);

        document.getElementById('txid').textContent = txid;
        document.getElementById('transaction-info').style.display = 'block';

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
        pushButton.disabled = false;
    } else {
        loginButton.style.display = 'block';
        loggedInIndicator.style.display = 'none';
        pushButton.disabled = true;
    }
}

// Function to fetch the current score for the user
async function fetchCurrentScore(userId) {
    try {
        const response = await fetch(`/get-score/${userId}`);
        const data = await response.json();
        return data.score;
    } catch (error) {
        console.error('Error fetching current score:', error);
        return 0;
    }
}

// Function to update the user's score display
async function updateUserScoreDisplay() {
    if (userId) {
        playerScore = await fetchCurrentScore(userId);
        document.getElementById('player-score').innerText = playerScore;
    }
}

// Function to fetch and update the prize pot display
async function updatePrizePotDisplay() {
    try {
        const response = await fetch('/prize-pot');
        const data = await response.json();
        document.getElementById('prize-pot').innerText = `${data.totalPot} BSV`;
    } catch (error) {
        console.error('Error fetching prize pot:', error);
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
                body: JSON.stringify({ userId }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error updating score.');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Score updated:', data);
                    updateUserScoreDisplay(); // Fetch and display the updated score
                    updateLeaderboard(); // Update the leaderboard after score update
                    updatePrizePotDisplay(); // Update the prize pot display
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
            leaderboardList.innerHTML = '';

            data.data.forEach((player, index) => {
                const truncatedUserId = player.userId.substring(0, 5);
                const listItem = document.createElement('li');
                const rankSpan = document.createElement('span');
                rankSpan.classList.add('leaderboard-rank');
                rankSpan.textContent = `${index + 1}.`;
                const idSpan = document.createElement('span');
                idSpan.classList.add('leaderboard-id');
                idSpan.textContent = truncatedUserId;
                const scoreSpan = document.createElement('span');
                scoreSpan.classList.add('leaderboard-score');
                scoreSpan.textContent = `Score: ${player.score}`;

                listItem.appendChild(rankSpan);
                listItem.appendChild(idSpan);
                listItem.appendChild(scoreSpan);

                leaderboardList.appendChild(listItem);
            });
        })
        .catch((error) => console.error('Error fetching leaderboard:', error));
}

// At initial load, check if the user is already connected to Panda Wallet
window.addEventListener('load', async function () {
    if (panda && panda.isReady) {
        await connectPandaWallet();
        updateLeaderboard(); // Update leaderboard on initial load
        updatePrizePotDisplay(); // Update prize pot display on initial load
    }
});
