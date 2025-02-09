document.addEventListener('DOMContentLoaded', function() {
    // Redirect to schedule if already logged in
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'Scheduling.html';
        return;
    }

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check for admin credentials
        if (username === 'admin' && password === 'admin') {
            // Store user info
            localStorage.setItem('currentUser', JSON.stringify({
                username: 'admin',
                role: 'admin'
            }));
            
            // Redirect to schedule
            window.location.href = 'Scheduling.html';
        } else {
            alert('Invalid username or password');
        }
    });
}); 