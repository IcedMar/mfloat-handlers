import { auth, db, app } from "../firebase-config.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Initialize messaging using the app you already set up
const messaging = getMessaging(app);

// Ensure DOM is loaded before executing scripts
document.addEventListener("DOMContentLoaded", function () {
    // Authentication State Listener
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "index.html";
        }
    });

    // Logout Function
    document.getElementById("logoutBtn").addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });

    // Tab Switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    function openTab(tabName) {
        tabContents.forEach(tab => tab.classList.remove("active"));
        tabButtons.forEach(btn => btn.classList.remove("active"));
        
        document.getElementById(tabName).classList.add("active");
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add("active");
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            openTab(this.dataset.tab);
        });
    });

    const defaultTab = document.querySelector(".tab-btn.active")?.dataset.tab || "users";
    openTab(defaultTab);

    // Load Data
    loadUsers();
    loadAgents();
    loadSupportRequests();
});

// --- User Management ---
async function loadUsers() {
    const usersList = document.getElementById("users-list");
    usersList.innerHTML = "Loading...";

    onSnapshot(collection(db, "users"), (snapshot) => {
        usersList.innerHTML = "";
        snapshot.forEach(doc => {
            const user = doc.data();
            usersList.innerHTML += `
                <tr>
                    <td>${user.idNumber || ''}</td>
                    <td>${doc.id || ''}</td>
                    <td>${user.agentNumber || ''}</td>
                    <td>${user.storeNumber || ''}</td>
                    <td>${user.mpesaNumber || ''}</td>
                    <td>
                        <input type="password" value="*****" id="pin-${doc.id}" disabled>
                        <button onclick="enablePinEdit('${doc.id}')">Edit</button>
                        <button onclick="resetUserPin('${doc.id}')">Reset</button>
                    </td>
                </tr>`;
        });
    }, (error) => console.error("Error loading users:", error));
}

function enablePinEdit(userId) {
    const pinInput = document.getElementById(`pin-${userId}`);
    if (pinInput) {
        pinInput.disabled = false;
        pinInput.focus();
    } else {
        console.error(`Pin input not found for user: ${userId}`);
    }
}

// Make it globally available
window.enablePinEdit = enablePinEdit;


function resetUserPin(userId) {
    const newPin = generateOTP();
    // Your fetch request or Firestore update logic here
    fetch('/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPin })
    })
    .then(response => {
        if (response.ok) {
            showPopup("Temporary PIN sent via SMS!", "success");
        } else {
            response.json().then(errorData => {
                showPopup(`Error resetting PIN: ${errorData.error}`, "error");
            });
        }
    })
    .catch(error => {
        console.error("Error resetting PIN:", error);
        showPopup("Error resetting PIN!", "error");
    });
}

// Make resetUserPin globally available
window.resetUserPin = resetUserPin;


function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// --- Agent Management ---
function loadAgents() {
    const agentsList = document.getElementById("agents-list");
    agentsList.innerHTML = "";

    onSnapshot(collection(db, "agents"), (snapshot) => {
        agentsList.innerHTML = "";
        snapshot.forEach(doc => {
            const agent = doc.data();
            agentsList.innerHTML += `
                <tr>
                    <td>${agent.name || ''}</td>
                    <td>${agent.phone || ''}</td>
                    <td>${agent.idNumber || ''}</td>
                    <td>${agent.referralCode || ''}</td>
                    <td>Loading...</td>
                </tr>`;
        });
    }, (error) => console.error("Error loading agents:", error));
}

// --- Support Requests ---
function loadSupportRequests() {
    const supportList = document.getElementById("support-list");
    supportList.innerHTML = "";

    onSnapshot(query(collection(db, "supportRequests"), orderBy("timestamp", "desc")), (snapshot) => {
        supportList.innerHTML = "";
        snapshot.forEach(doc => {
            const request = doc.data();
            supportList.innerHTML += `
                <tr>
                    <td>${request.idNumber || ''}</td>
                    <td>${request.phoneNumber || ''}</td>
                    <td>${request.requestType || ''}</td>
                    <td>${request.timestamp ? new Date(request.timestamp.toDate()).toLocaleString() : ''}</td>
                    <td><button onclick="resolveRequest('${doc.id}')">Resolve</button></td>
                </tr>`;
        });
    }, (error) => console.error("Error loading support requests:", error));
}

async function resolveRequest(requestId) {
    try {
        await deleteDoc(doc(db, "SupportRequests", requestId));
        showPopup("Request resolved", "success");
    } catch (error) {
        console.error("Error resolving request:", error);
        showPopup("Error resolving request", "error");
    }
}

function searchRequests() {
    const input = document.getElementById('searchRequests').value.toUpperCase();
    const table = document.getElementById('support-list');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = '';
            } else {
                tr[i].style.display = 'none';
            }
        }
    }
}

function searchUsers() {
    const input = document.getElementById('searchUsers').value.toUpperCase();
    const table = document.getElementById('users-list');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[0]; // Assuming ID Number is in the second column (index 1)
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = ''; // Show row
            } else {
                tr[i].style.display = 'none'; // Hide row
            }
        }
    }
}

// Ensure the function is globally available
window.searchUsers = searchUsers;

function searchAgents() {
    const input = document.getElementById('searchAgents').value.toUpperCase();
    const table = document.getElementById('agents-list');
    const tr = table.getElementsByTagName('tr');

    for (let i = 0; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td')[2]; // Third column (index 2) contains the ID Number
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = ''; // Show row
            } else {
                tr[i].style.display = 'none'; // Hide row
            }
        }
    }
}

// Ensure the function is globally available
window.searchAgents = searchAgents;

Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      getToken(messaging, { vapidKey: 'BD3zKtw9VkNSkFnTX0-rlw6JNXu6jOY-H4WWeWc_59jouEEmjYlfVCpwN99QW6Ycr89LMVaCsXvJ9RrJ6fOfGuE' })
        .then((currentToken) => {
          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Optionally, save the token to Firestore or your server so you can target this user later.
          } else {
            console.log('No registration token available.');
          }
        })
        .catch((err) => {
          console.error('An error occurred while retrieving token. ', err);
        });
    } else {
      console.log('Notification permission not granted');
    }
  });
  
  // Handle incoming messages when the app is in the foreground
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // You could show a custom in-app notification here
  });

