let db;

async function initDatabase() {
    // Load the SQL.js library
    const SQL = await initSqlJs(); // Ensure this line is included
    
    const response = await fetch('path/to/your/database.sqlite'); // Update this path
    const buffer = await response.arrayBuffer();
    const Uint8Array = new window.Uint8Array(buffer);
    db = new SQL.Database(Uint8Array);
}

async function fetchCompanies() {
    const stmt = db.prepare("SELECT name FROM companies");
    const companies = [];
    while (stmt.step()) {
        const row = stmt.get();
        companies.push(row[0]); // Assuming the first column is the company name
    }
    return companies;
}

async function showSuggestions() {
    const companies = await fetchCompanies();
    const inputValue = document.getElementById('companyName').value.toLowerCase();
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    if (inputValue) {
        const filteredCompanies = companies.filter(company =>
            company.toLowerCase().includes(inputValue)
        );

        filteredCompanies.forEach(company => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = company;
            suggestionItem.addEventListener('click', function() {
                document.getElementById('companyName').value = company; // Set input value
                suggestionsList.innerHTML = ''; // Clear suggestions
            });
            suggestionsList.appendChild(suggestionItem);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const addNewCompanyButton = document.getElementById('addNewCompany');
    const addCompanyModal = document.getElementById('addCompanyModal');
    const closeModal = document.getElementById('closeModal');
    const newCompanyForm = document.getElementById('newCompanyForm');

    // Show modal when Add New button is clicked
    addNewCompanyButton.addEventListener('click', function() {
        console.log('Add New clicked'); // Debug log
        addCompanyModal.style.display = 'block';
    });

    // Close modal when X is clicked
    closeModal.addEventListener('click', function() {
        console.log('Close clicked'); // Debug log
        addCompanyModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addCompanyModal) {
            addCompanyModal.style.display = 'none';
        }
    });

    // Handle form submission
    newCompanyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            companyName: document.getElementById('newCompanyName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            country: document.getElementById('country').value,
            contactName: document.getElementById('contactName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value
        };

        console.log('Form submitted:', formData); // Debug log
        
        // Clear form and close modal
        newCompanyForm.reset();
        addCompanyModal.style.display = 'none';
    });
}); 