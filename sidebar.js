// Function to create and insert the sidebar
function createSidebar() {
    const sidebarHTML = `
        <div class="sidebar">
           
            <nav>
                <ul>
                    <li><a href="index.html"><i class="fas fa-home"></i>Dashboard</a></li>
                    <li><a href="work-order.html"><i class="fas fa-file-alt"></i>Work Order</a></li>
                    <li><a href="#"><i class="fas fa-box"></i>Inventory</a></li>
                    <li><a href="#"><i class="fas fa-chart-bar"></i>Reports</a></li>
                </ul>
            </nav>
        </div>
    `;
    
    // Insert the sidebar at the start of the body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Set active class based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.sidebar nav a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Create sidebar when the DOM is loaded
document.addEventListener('DOMContentLoaded', createSidebar); 