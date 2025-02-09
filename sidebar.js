function insertSidebar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const sidebarHTML = `
        <div class="sidebar">
           
            <div class="menu">
                <a href="index.html" class="menu-item">Home</a>
                <a href="Scheduling.html" class="menu-item">Schedule</a>
                <a href="dies.html" class="menu-item">Dies</a>
                <a href="ups-tracker.html" class="menu-item">UPS Tracker</a>
                <a href="archive.html" class="menu-item">Archive</a>
                  <a href="work-order.html" class="menu-item">Work Order</a>
                <div class="user-section">
                    ${currentUser 
                        ? `<span class="username">Logged in as: <br>${currentUser.username}</span>
                           <a href="#" class="menu-item" id="logoutBtn">Logout</a>`
                        : `<a href="login.html" class="menu-item">Login</a>`
                    }
                </div>
            </div>
        </div>
        <div class="main-content">
        </div>
    `;

    // Insert at the start of the body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    
    // Move all existing body content into main-content
    const mainContent = document.querySelector('.main-content');
    while (document.body.children.length > 2) {  // sidebar + main-content = 2
        mainContent.appendChild(document.body.children[2]);
    }

    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
}

// Initialize sidebar when page loads
document.addEventListener('DOMContentLoaded', insertSidebar); 