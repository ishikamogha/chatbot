
const localBrain = {
    hi: "Hey 👋 Ready to learn something new?",
    hello: "Hello! Ask me literally anything 🌍",
    thanks: "Always happy to help 😄",
    "how are you": "Running on JavaScript and curiosity ⚡"
};


function cleanSearchTerm(input) {
    let term = input.toLowerCase().trim();
    const fillers = [
        "what is", "who is", "define", "tell me about",
        "meaning of", "explain"
    ];
    fillers.forEach(f => {
        if (term.startsWith(f + " ")) {
            term = term.replace(f + " ", "");
        }
    });
    return term;
}


async function searchWikipedia(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.query.search.length) return null;

        
        return data.query.search[0].title;
    } catch (err) {
        console.error("Search error:", err);
        return null;
    }
}


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
    } catch (err) {
        console.error("Summary error:", err);
        return null;
    }
}


function toggleAuth(isSignup) {
    loginPage.style.display = isSignup ? "none" : "block";
    signupPage.style.display = isSignup ? "block" : "none";
}

function handleSignup() {
    const user = {
        name: newName.value,
        email: newEmail.value,
        pass: newPassword.value
    };
    if (!user.email || !user.pass) return alert("Fill all fields");
    localStorage.setItem(user.email, JSON.stringify(user));
    alert("Signup successful");
    toggleAuth(false);
}

function handleLogin() {
    const user = JSON.parse(localStorage.getItem(loginEmail.value));
    if (user && user.pass === loginPassword.value) {
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        location.reload();
    } else {
        alert("Invalid credentials");
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}


function addMsg(type, text) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    messages.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function handleSend() {
    const rawText = userInput.value.trim();
    if (!rawText) return;

    addMsg("user", rawText);
    userInput.value = "";
    typing.style.display = "block";

    let reply = localBrain[rawText.toLowerCase()];

    if (!reply) {
        const cleaned = cleanSearchTerm(rawText);

        
        const pageTitle = await searchWikipedia(cleaned);

        if (pageTitle) {
           
            const wiki = await getWikiSummary(pageTitle);

            if (wiki) {
                reply = `
    🔍 <b>${wiki.title}</b><br><br>
    ${wiki.extract}
`;

            } else {
                reply = "I found data but couldn’t extract a summary 😕";
            }
        } else {
            reply = "No results found. Try different keywords";
        }
    }

    setTimeout(() => {
        typing.style.display = "none";
        addMsg("bot", reply);
    }, 700);
}


window.onload = () => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (user) {
        authContainer.style.display = "none";
        chatPage.style.display = "flex";
        displayUser.innerText = user.name;
    }
};

userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSend();
});
