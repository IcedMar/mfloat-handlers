import { app } from "../firebase-config.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm"); // Fix: Corrected the ID

    if (!loginForm) {
        console.error("Login form not found! Check if the ID 'loginForm' exists in your HTML.");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const handlerRef = doc(db, "handlers", email);
            const handlerSnap = await getDoc(handlerRef);

            if (handlerSnap.exists() && handlerSnap.data().role === "handler") {
                sessionStorage.setItem("handlerEmail", email);
                sessionStorage.setItem("handlerName", handlerSnap.data().name);
                storeLog(email, "Success", "User logged in successfully.");
                window.location.href = "dashboard.html";
            } else {
                storeLog(email, "Failed", "User not found or not a handler.");
                showPopup("Access denied: You are not assigned as a handler.");
            }
        } catch (error) {
            console.error("Login failed:", error.message);
            storeLog(email, "Failed", error.message);
            showPopup("Login failed: " + error.message);
        }
    });
});


function showPopup(message, type, callback = null) {
    const popup = document.getElementById("popup");
    const popupIcon = document.getElementById("popup-icon");
    const popupMessage = document.getElementById("popup-message");

    // Set icon and message based on success or error
    if (type === "success") {
        popupIcon.innerHTML = "✅"; // Checkmark
        popupIcon.className = "success";
    } else {
        popupIcon.innerHTML = "❌"; // Red X
        popupIcon.className = "error";
    }

    popupMessage.textContent = message;
    popup.style.display = "block";

    // Hide popup after 2 seconds
    setTimeout(() => {
        popup.style.display = "none";
        if (callback) callback(); // Execute callback if provided
    }, 2000);
}

// Function to store login logs in Firestore
async function storeLog(email, status, message) {
    try {
        await addDoc(collection(db, "logs"), {
            email: email,
            status: status,
            message: message,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error storing log:", error.message);
    }
}