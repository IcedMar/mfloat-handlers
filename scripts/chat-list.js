// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKNdNQrZRs1Fx7FQnTw3GABYbrqihcoMk",
    authDomain: "the-m-float.firebaseapp.com",
    projectId: "the-m-float",
    storageBucket: "the-m-float.firebasestorage.app",
    messagingSenderId: "91662213348",
    appId: "1:91662213348:web:d437c5cea934a21e1c4cf1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const chatList = document.getElementById("chat-list");

// Store seen users to prevent duplicates
let displayedUsers = new Set();

// Load all unique chat users from Firestore
const chatListContainer = document.getElementById("chat-list");

// Load chats with unique senders
function loadChatList() {
    db.collection("messages")
        .orderBy("timestamp", "desc")
        .get()
        .then(snapshot => {
            const uniqueSenders = new Set();
            chatListContainer.innerHTML = ""; // Clear list

            snapshot.forEach(doc => {
                const msg = doc.data();
                if (!uniqueSenders.has(msg.sender)) {
                    uniqueSenders.add(msg.sender);

                    // Fetch sender details from `dealers`
                    db.collection("dealers").doc(msg.sender).get().then(userDoc => {
                        if (userDoc.exists) {
                            const senderName = userDoc.data().name || "Unknown User";
                            const chatItem = document.createElement("div");
                            chatItem.classList.add("chat-item");
                            chatItem.innerHTML = `
                                <p><strong>${senderName}</strong></p>
                                <span>Click to chat</span>
                            `;
                            chatItem.addEventListener("click", () => {
                                window.location.href = `admin-chat.html?senderId=${msg.sender}&senderName=${encodeURIComponent(senderName)}`;
                            });

                            chatListContainer.appendChild(chatItem);
                        }
                    });
                }
            });
        });
}

// Load chat list on page load
loadChatList();