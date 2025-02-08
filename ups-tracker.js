// Grab elements
const addButton = document.getElementById('add-button');
const trackingInput = document.getElementById('tracking-input');
const shipmentTable = document.getElementById('shipment-table').getElementsByTagName('tbody')[0];

// Initialize an array to store tracking numbers
let trackingNumbers = [];

// Simulated function to fetch tracking status
function getTrackingStatus(trackingNumber) {
    // For simplicity, we're just mocking the tracking status
    // In a real-world scenario, you could integrate with an API here
    const statusOptions = ["In Transit", "Delivered", "Out for Delivery", "Exception"];
    const randomIndex = Math.floor(Math.random() * statusOptions.length);
    return statusOptions[randomIndex];
}

// Function to add tracking numbers to the table
function addTrackingNumbers() {
    const trackingNumbersText = trackingInput.value.trim();
    const trackingArray = trackingNumbersText.split('\n'); // Split the input by new lines

    // Loop through each tracking number
    trackingArray.forEach((number) => {
        const trimmedNumber = number.trim();
        // Check if the number is not already in the list
        if (trimmedNumber && !trackingNumbers.includes(trimmedNumber)) {
            trackingNumbers.push(trimmedNumber);

            // Create a new table row for each tracking number
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trimmedNumber}</td>
                <td><button class="track-button">Track</button></td>
                <td><span class="status">Loading...</span></td>
            `;
            shipmentTable.appendChild(row);

            // Add the tracking event for this number
            const trackButton = row.querySelector('.track-button');
            const statusSpan = row.querySelector('.status');
            trackButton.addEventListener('click', function () {
                // Simulate getting the tracking status (replace with real API call if necessary)
                const status = getTrackingStatus(trimmedNumber);
                statusSpan.textContent = status;  // Update the status column
            });
        }
    });

    // Clear the input field after adding numbers
    trackingInput.value = '';
}

// Attach event listener to the "Add" button
addButton.addEventListener('click', function () {
    addTrackingNumbers();
});
