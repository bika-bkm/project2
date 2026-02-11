if (window.location.pathname.endsWith("login.html")) {
    const user = localStorage.getItem("user");
    if (user) {
        window.location.href = "index.html";
    }
}

// 🟢 AUTO-REDIRECT IF NOT LOGGED IN (for index page)
if (window.location.pathname.endsWith("index.html")) {
    const user = localStorage.getItem("user");
    if (!user) {
        window.location.href = "login.html";
    }
}

// 🟢 LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                alert("Login successful ✅");
                //
                localStorage.setItem("token", data.token);
                //
                localStorage.setItem("user", JSON.stringify(data.user));
                //Redirect after login
                window.location.href = "index.html";
            } else {
                document.getElementById("loginError").textContent =
                    "Invalid email or password ❌";
            }
        } catch (err) {
            document.getElementById("loginError").textContent =
                "Error connecting to server ⚠️";
        }
    });
}

// 🟢 SIGNUP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                alert("Signup successful");
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "login.html";
            } else {
                const err = await response.json();
                document.getElementById("signupError").textContent = err.message;
            }
        } catch (err) {
            document.getElementById("signupError").textContent =
                "Error connecting to server ⚠️";
        }
    });
}
