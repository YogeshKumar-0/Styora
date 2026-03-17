document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const identifier = document.getElementById('identifier').value;
        const password = passwordInput.value;

        const loginData = {
            password: password
        };

        // Simple check: if it contains '@', assume email, otherwise assume phone
        if (identifier.includes('@')) {
            loginData.email = identifier;
        } else {
            loginData.phoneNumber = identifier;
        }

        try {
            const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            let result;
            try {
                result = await response.json();
            } catch (e) {
                throw new Error('Invalid response from server');
            }

            if (response.ok) {
                // Save user info AND the JWT token to localStorage
                localStorage.setItem('loggedInUser', JSON.stringify(result));
                localStorage.setItem('authToken', result.token);

                // Display a personalized welcome message
                messageDiv.innerHTML = `<div class="alert alert-success">Welcome back, ${result.fullName}! Redirecting...</div>`;

                // Wait for 2 seconds and then redirect
                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const redirectUrl = urlParams.get('redirect') || 'index.html';
                    window.location.href = redirectUrl;
                }, 2000);
            } else {
                // If the server returns an error (e.g., wrong password)
                messageDiv.innerHTML = `<div class="alert alert-danger">${result.message || 'Invalid credentials'}</div>`;
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message === 'Invalid response from server') {
                messageDiv.innerHTML = `<div class="alert alert-danger">Server error. Please contact support.</div>`;
            } else {
                messageDiv.innerHTML = `<div class="alert alert-danger">Cannot connect to server. Is the backend running?</div>`;
            }
        }
    });
});