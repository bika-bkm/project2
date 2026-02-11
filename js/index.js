// Check if logged in
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

// Optional: Load user info
const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("welcomeMsg").textContent =
    `Welcome back, ${user.email || "Guest"}!`;

// Logout button
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});
