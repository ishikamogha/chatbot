
const localBrain = {
    hi: "Hey 👋 Ready to learn something new?",
    hello: "Hello! Ask me literally anything 🌍",
    thanks: "Always happy to help 😄",
    "how are you": "Running on JavaScript and curiosity ⚡"
};

// AUTH TOGGLE
function toggleAuth(isSignup) {
    loginPage.style.display = isSignup ? "none" : "block";
    signupPage.style.display = isSignup ? "block" : "none";
}

// SIGNUP
function handleSignup() {
    if (!newName.value || !newEmail.value || !newPassword.value) {
        alert("Fill all fields");
        return;
    }

    const user = {
        name: newName.value,
        email: newEmail.value,
        pass: newPassword.value
    };

    localStorage.setItem(user.email, JSON.stringify(user));
    alert("Signup successful 🎉");
    toggleAuth(false);
}

// LOGIN
function handleLogin() {
    const user = JSON.parse(localStorage.getItem(loginEmail.value));

    if (user && user.pass === loginPassword.value) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        showChat(user);
    } else {
        alert("Invalid credentials!");
    }
}

// LOGOUT
function logout() {
    sessionStorage.removeItem("loggedInUser");
    authContainer.style.display = "flex";
    chatPage.style.display = "none";
}

// SHOW CHAT
function showChat(user) {
    authContainer.style.display = "none";
    chatPage.style.display = "flex";
    displayUser.innerText = user.name;
}

// CHAT
function addMsg(type, text) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    messages.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMsg("user", text);
    userInput.value = "";
    typing.style.display = "block";

    let reply = localBrain[text.toLowerCase()] || "Interesting question 🤔";

    setTimeout(() => {
        typing.style.display = "none";
        addMsg("bot", reply);
    }, 700);
}

// PAGE LOAD
window.onload = () => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (user) showChat(user);
};

// ENTER KEY
userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSend();
});
