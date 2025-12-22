// basic human replies
const localBrain = {
    hi: "Hey 👋",
    hello: "Hello 😄",
    hey: "Hey there!",
    thanks: "You're welcome 😊",
    thankyou: "Anytime 💙",
    bye: "Bye 👋 take care",
    "how are you": "I'm good 😌 how about you?"
};

// clean user question
function cleanSearchTerm(input) {
    let term = input.toLowerCase().trim();
    const fillers = [
        "what is", "who is", "define",
        "tell me about", "meaning of", "explain"
    ];
    fillers.forEach(f => {
        if (term.startsWith(f + " ")) {
            term = term.replace(f + " ", "");
        }
    });
    return term;
}

// search wikipedia
async function searchWikipedia(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.query.search.length) return null;
        return data.query.search[0].title;
    } catch {
        return null;
    }
}

// get wikipedia summary
async function getWikiSummary(title) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.extract) return null;
        return {
            title: data.title,
            extract: data.extract,
            link: data.content_urls.desktop.page
        };
    } catch {
        return null;
    }
}

// auth toggle
function toggleAuth(isSignup) {
    loginPage.style.display = isSignup ? "none" : "block";
    signupPage.style.display = isSignup ? "block" : "none";
}

// signup
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
    alert("Signup successful");
    toggleAuth(false);
}

// login
function handleLogin() {
    const user = JSON.parse(localStorage.getItem(loginEmail.value));
    if (user && user.pass === loginPassword.value) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        showChat(user);
    } else {
        alert("Invalid credentials");
    }
}

// logout
function logout() {
    sessionStorage.clear();
    location.reload();
}

// show chat
function showChat(user) {
    authContainer.style.display = "none";
    chatPage.style.display = "flex";
    displayUser.innerText = user.name;
}

// add message
function addMsg(type, text) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    messages.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// send message
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMsg("user", text);
    userInput.value = "";
    typing.style.display = "block";

    const cleaned = cleanSearchTerm(text);
    let reply = localBrain[cleaned];

    if (!reply) {
        const title = await searchWikipedia(cleaned);
        if (title) {
            const wiki = await getWikiSummary(title);
            if (wiki) {
                reply = `<b>${wiki.title}</b><br><br>${wiki.extract}`;
            } else {
                reply = "Couldn't get details 😕";
            }
        } else {
            reply = "I don’t know this yet 😔";
        }
    }

    setTimeout(() => {
        typing.style.display = "none";
        addMsg("bot", reply);
    }, 600);
}

// on load
window.onload = () => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (user) showChat(user);
};

userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSend();
});
