document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const loginData = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json(); 

            if (response.ok) {
                // *** THIS IS THE MISSING LINE ***
                // It saves the user's data to the browser's local storage.
                localStorage.setItem('loggedInUser', JSON.stringify(result));

                // Display a personalized welcome message
                messageDiv.innerHTML = `<div class="alert alert-success">Welcome back, ${result.fullName}! Redirecting...</div>`;
                
                // Wait for 2 seconds and then redirect to the homepage
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // If the server returns an error (e.g., wrong password)
                messageDiv.innerHTML = `<div class="alert alert-danger">${result.message || 'Invalid credentials'}</div>`;
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again later.</div>`;
        }
    });
});