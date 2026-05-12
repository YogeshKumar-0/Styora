import API_CONFIG from "./config.js";
const BASE_URL = API_CONFIG.BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const identifierInput = document.getElementById("identifier");
  const passwordInput = document.getElementById("password");
  const messageDiv = document.getElementById("message");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const identifier = identifierInput.value;
    const password = passwordInput.value;

    const loginData = { password: password };

    // Logic to determine if identifier is email or phone
    if (identifier.includes("@")) {
      loginData.email = identifier;
    } else {
      loginData.phoneNumber = identifier;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        // JWT Token save karo
        localStorage.setItem("authToken", result.token);

        // Backend se direct data uthao (kyunki backend 'user' object nahi bhej raha)
        const userData = {
          fullName: result.fullName,
          email: result.email,
          phoneNumber: result.phoneNumber,
        };

        // Ise 'loggedInUser' key mein save karo
        localStorage.setItem("loggedInUser", JSON.stringify(userData));

        messageDiv.innerHTML = `<div class="alert alert-success">Welcome, ${result.fullName}! Redirecting...</div>`;

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${result.message || "Login failed. Please check your credentials."}</div>`;
      }
    } catch (error) {
      console.error("Login Error:", error);
      messageDiv.innerHTML = `<div class="alert alert-danger">Unable to connect to the server. Please try again later.</div>`;
    }
  });
});
