import { auth, app } from "../firebase-config.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const senderId = urlParams.get("senderId");
const senderName = decodeURIComponent(urlParams.get("senderName") || "Unknown User");

const chatHeader = document.querySelector(".chat-header");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-message");
const sendButton = document.getElementById("send-message-button");

if (!chatHeader || !chatMessages || !chatInput || !sendButton) {
    console.error("Error: One or more required elements are missing.");
} else {
    chatHeader.innerHTML = `<h2>Chat with ${senderName}</h2>`;

    const messagesRef = collection(db, "messages");

    const loadChatMessages = () => {
        const q = query(messagesRef, where("sender", "==", senderId), orderBy("timestamp", "asc"));
        
        onSnapshot(q, (snapshot) => {
            chatMessages.innerHTML = "";
            snapshot.forEach(doc => {
                const msg = doc.data();
                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message", msg.type === "sent" ? "sent" : "received");
                messageDiv.innerHTML = `<p>${msg.text}</p><span>${new Date(msg.timestamp?.toDate()).toLocaleTimeString()}</span>`;
                chatMessages.appendChild(messageDiv);
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    };

    const sendMessage = async () => {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        await addDoc(messagesRef, {
            sender: senderId,
            text: messageText,
            type: "sent",
            timestamp: serverTimestamp()
        });

        chatInput.value = "";
    };

    sendButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    if (senderId) {
        loadChatMessages();
    } else {
        chatMessages.innerHTML = "<p>No chat selected.</p>";
    }
}
