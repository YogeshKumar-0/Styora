document.addEventListener('DOMContentLoaded', () => {
    // Get the logged-in user data from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Select the elements we need to update
    const welcomeHeading = document.getElementById('welcome-heading');
    const modalUserName = document.getElementById('modalUserName');
    const modalUserEmail = document.getElementById('modalUserEmail');
    const accountDetailsBody = document.querySelector('#account-details .card-body');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');

    if (loggedInUser) {
        // If a user is logged in, populate the page and modal with their data
        
        // Update the main page heading
        welcomeHeading.textContent = `Welcome, ${loggedInUser.fullName}!`;
        
        // Populate the modal
        modalUserName.textContent = loggedInUser.fullName;
        modalUserEmail.textContent = loggedInUser.email;
        
        // Populate the "Account Details" card
        accountDetailsBody.innerHTML = `
            <form>
                 <div class="mb-3">
                    <label for="profileName" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="profileName" value="${loggedInUser.fullName}">
                </div>
                <div class="mb-3">
                    <label for="profileEmail" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="profileEmail" value="${loggedInUser.email}" readonly>
                </div>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
        `;

        // Add logout functionality to the sidebar logout button
        profileLogoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });

    } else {
        // If no user is logged in, redirect them to the login page
        window.location.href = 'login.html';
    }
});