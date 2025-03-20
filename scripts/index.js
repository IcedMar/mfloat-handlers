import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKNdNQrZRs1Fx7FQnTw3GABYbrqihcoMk",
  authDomain: "the-m-float.firebaseapp.com",
  projectId: "the-m-float",
  storageBucket: "the-m-float.firebasestorage.app",
  messagingSenderId: "91662213348",
  appId: "1:91662213348:web:d437c5cea934a21e1c4cf1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login Form Handling
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login successful
            showPopup("Login Successful!", "success", () => {
                window.location.href = "dashboard.html"; // Redirect to dashboard
            });

        })
        .catch((error) => {
            // Display error message
            let message = "Invalid email or password!";
            if(error.code === 'auth/user-not-found'){
                message = "User not found.";
            } else if (error.code === 'auth/wrong-password'){
                message = "Incorrect password.";
            }

            errorMessage.textContent = message;
            showPopup(message, "error");
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
