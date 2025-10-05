document.addEventListener('DOMContentLoaded', () => {
    // Get the form and input elements from the HTML
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    // Add an event listener for the form's 'submit' event
    signupForm.addEventListener('submit', async (event) => {
        // Prevent the default browser action of submitting the form and reloading the page
        event.preventDefault();

        // Create a user object with the values from the form inputs
        const user = {
            fullName: fullNameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            // Send the user data to your backend API endpoint using fetch
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST', // The HTTP method
                headers: {
                    'Content-Type': 'application/json' // Tell the server we are sending JSON data
                },
                body: JSON.stringify(user) // Convert the JavaScript object to a JSON string
            });

            // Get the response text from the server
            const resultText = await response.text();

            if (response.ok) {
                // If the response is successful (e.g., status 200 OK)
                messageDiv.innerHTML = `<div class="alert alert-success">${resultText}</div>`;
                // Wait for 2 seconds and then redirect to the login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                // If the server returns an error (e.g., status 400 for existing email)
                messageDiv.innerHTML = `<div class="alert alert-danger">${resultText}</div>`;
            }
        } catch (error) {
            // Handle network errors (e.g., if the backend server is not running)
            console.error('Error:', error);
            messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again later.</div>`;
        }
    });
});