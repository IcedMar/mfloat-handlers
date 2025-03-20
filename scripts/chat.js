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

const urlParams = new URLSearchParams(window.location.search);
const senderId = urlParams.get("senderId");
const senderName = decodeURIComponent(urlParams.get("senderName") || "Unknown User");

const chatHeader = document.querySelector(".chat-header"); 
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-message");
const sendButton = document.getElementById("send-message-button");

// Set sender name in chat header
chatHeader.innerHTML = `<h2>Chat with ${senderName}</h2>`;

// Load messages for this sender
function loadChatMessages() {
    db.collection("messages")
        .where("sender", "==", senderId)
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = ""; // Clear previous messages
            snapshot.forEach(doc => {
                const msg = doc.data();
                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message", msg.type === "sent" ? "sent" : "received");
                messageDiv.innerHTML = `<p>${msg.text}</p><span>${new Date(msg.timestamp).toLocaleTimeString()}</span>`;
                chatMessages.appendChild(messageDiv);
            });

            // Auto-scroll to latest message
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
}

// Send message function
function sendMessage() {
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    db.collection("messages").add({
        sender: senderId,
        text: messageText,
        type: "sent", // Message sent by admin
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    chatInput.value = "";
}

// Event listeners
sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Load chat on page load
if (senderId) {
    loadChatMessages();
} else {
    chatMessages.innerHTML = "<p>No chat selected.</p>";
}