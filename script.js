document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('die-form');
    const tableBody = document.getElementById('die-table').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('search-bar');
    let dies = JSON.parse(localStorage.getItem('dies')) || []; // Load dies from localStorage (or start with an empty array)
    let editingDieIndex = null; // To track which die is being edited

    // Display saved dies from localStorage when the page loads
    dies.forEach(die => {
        addDieToTable(die);
    });

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submit (which reloads the page)

        // Create a new FormData object to handle form data (including files)
        const formData = new FormData(form);

        // Get the uploaded image file (if any)
        const image = document.getElementById('image').files[0];

        // Create a die object
        const die = {
            dieName: formData.get('die-name'),
            width: formData.get('width'),
            height: formData.get('height'),
            across: formData.get('across'),
            around: formData.get('around'),
            type: formData.get('type'),
            customer: formData.get('customer'),
            description: formData.get('description'),
            image: image ? convertImageToBase64(image) : null, // Convert image to base64 if file is present
        };

        if (editingDieIndex !== null) {
            // Update the existing die if we're editing
            dies[editingDieIndex] = die;
            // Update the table row with the new die values
            updateDieInTable(editingDieIndex, die);
            editingDieIndex = null; // Reset the editing index
        } else {
            // Add the new die to the array
            dies.push(die);
            // Add the new die to the table
            addDieToTable(die);
        }

        // Save the updated dies array to localStorage
        localStorage.setItem('dies', JSON.stringify(dies));

        // Clear the form after submission
        form.reset();
    });

    // Convert an image to a base64 string
    function convertImageToBase64(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile); // Convert the file to a base64 string
        });
    }

    // Add a new die to the table
    function addDieToTable(die) {
        const row = tableBody.insertRow();

        row.innerHTML = `
            <td>${die.dieName}</td>
            <td>${die.width}</td>
            <td>${die.height}</td>
            <td>${die.across}</td>
            <td>${die.around}</td>
            <td>${die.type}</td>
            <td>${die.customer}</td>
            <td>${die.description}</td>
            <td>
                <button class="view-image">View Image</button>
                <button class="edit-die">Edit</button>
                <button class="delete-die">Delete</button>
            </td>
        `;

        // Attach event listeners to the new buttons
        row.querySelector('.view-image').addEventListener('click', function() {
            viewImage(die.image);
        });
        row.querySelector('.edit-die').addEventListener('click', function() {
            editDie(die, row);
        });
        row.querySelector('.delete-die').addEventListener('click', function() {
            deleteDie(row, die);
        });
    }

    // Function to view the image (opens in a new window)
    function viewImage(imageBase64) {
        if (imageBase64) {
            window.open(imageBase64, '_blank');
        } else {
            alert('No image available');
        }
    }

    // Function to edit a die
    function editDie(die, row) {
        console.log("Editing die", die);

        // Fill in the form with the die data
        document.getElementById('die-name').value = die.dieName;
        document.getElementById('width').value = die.width;
        document.getElementById('height').value = die.height;
        document.getElementById('across').value = die.across;
        document.getElementById('around').value = die.around;
        document.getElementById('type').value = die.type;
        document.getElementById('customer').value = die.customer;
        document.getElementById('description').value = die.description;

        // Set the index of the die being edited
        editingDieIndex = dies.indexOf(die);
    }

    // Function to update a die in the table
    function updateDieInTable(index, die) {
        const row = tableBody.rows[index];

        row.cells[0].textContent = die.dieName;
        row.cells[1].textContent = die.width;
        row.cells[2].textContent = die.height;
        row.cells[3].textContent = die.across;
        row.cells[4].textContent = die.around;
        row.cells[5].textContent = die.type;
        row.cells[6].textContent = die.customer;
        row.cells[7].textContent = die.description;
    }

    // Function to delete a die
    function deleteDie(row, die) {
        if (confirm("Are you sure you want to delete this die?")) {
            // Remove the die from the dies array
            dies.splice(dies.indexOf(die), 1);

            // Save the updated dies array to localStorage
            localStorage.setItem('dies', JSON.stringify(dies));

            // Remove the row from the table
            row.remove();
        }
    }

    // Search functionality for table
    searchInput.addEventListener('input', function () {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tableBody.rows;

        for (let row of rows) {
            const cells = row.cells;
            let rowText = '';

            for (let cell of cells) {
                rowText += cell.textContent.toLowerCase();
            }

            if (rowText.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });

    // New Scheduling Page Functions
    if (window.location.pathname.includes('Scheduling')) {
        initializeScheduling();
    }

    async function initializeScheduling() {
        try {
            const response = await fetch('/api/jobs');
            const jobs = await response.json();
            populateJobs(jobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    }

    function populateJobs(jobs) {
        jobs.forEach(job => {
            const pressContainer = document.querySelector(`.press[data-press="${job.pressNumber}"] .jobs`);
            if (pressContainer) {
                const jobElement = createJobElement(job);
                pressContainer.appendChild(jobElement);
            }
        });
    }

    function createJobElement(job) {
        const jobElement = document.createElement('div');
        jobElement.className = 'job';
        jobElement.draggable = true;
        jobElement.id = `job-${job.id}`;
        jobElement.textContent = job.jobName;
        jobElement.dataset.status = job.status;

        // Add drag event listeners
        jobElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });

        return jobElement;
    }

    // Handle job updates
    async function updateJob(jobId, pressNumber, status) {
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pressNumber,
                    status
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update job');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating job:', error);
            throw error;
        }
    }

    // Context Menu Setup
    const contextMenu = document.getElementById('jobContextMenu');

    if (!contextMenu) {
        console.error('Context menu element not found! Looking for element with ID: jobContextMenu');
    }

    // Add context menu to jobs
    document.addEventListener('contextmenu', function(e) {
        console.log('Right click detected'); // Debug log
        
        const jobRow = e.target.closest('tr.job');
        if (!jobRow) {
            console.log('No job row found at click target');
            return;
        }
        
        e.preventDefault(); // Prevent default context menu
        
        const pressContainer = jobRow.closest('.press-container');
        const press = jobRow.closest('.press');
        
        if (!press || !pressContainer) {
            console.error('Could not find press container');
            return;
        }

        // Get all jobs in this specific press
        const tbody = press.querySelector('tbody');
        const allJobsInPress = Array.from(tbody.querySelectorAll('tr.job'));
        const currentIndex = allJobsInPress.indexOf(jobRow);

        console.log('Right-clicked job:', {
            pressContainer: pressContainer.className,
            press: press.dataset.press,
            jobId: jobRow.id,
            index: currentIndex
        });
        
        // Store job information
        contextMenu.dataset.currentJob = jobRow.id;
        contextMenu.dataset.currentPress = press.dataset.press;
        contextMenu.dataset.currentIndex = currentIndex;
        contextMenu.dataset.isCompleted = pressContainer.classList.contains('completed');
        
        // Position and show menu
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    });

    // Close context menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    // Handle context menu actions
    contextMenu.addEventListener('click', function(e) {
        const item = e.target.closest('.context-menu-item');
        if (!item) return;

        const action = item.dataset.action;
        const currentJobId = contextMenu.dataset.currentJob;
        const currentPress = contextMenu.dataset.currentPress;
        const currentIndex = parseInt(contextMenu.dataset.currentIndex);
        const isCompleted = contextMenu.dataset.isCompleted === 'true';
        
        // Get the exact job row
        const section = isCompleted ? '.completed' : '.in-progress';
        const press = document.querySelector(`.press-container${section} .press[data-press="${currentPress}"]`);
        const tbody = press.querySelector('tbody');
        const jobRows = Array.from(tbody.querySelectorAll('tr.job'));
        const jobRow = jobRows[currentIndex];
        
        if (!jobRow) {
            console.error('Could not find job row');
            contextMenu.style.display = 'none';
            return;
        }

        if (action === 'delete') {
            if (confirm('Are you sure you want to archive this job?')) {
                try {
                    // Get all the job data before removing
                    const cells = jobRow.getElementsByTagName('td');
                    const jobData = {
                        id: jobRow.id,
                        pressNumber: currentPress,
                        timestamp: new Date().toISOString(),
                        data: Array.from(cells).map(cell => cell.textContent),
                        section: isCompleted ? 'completed' : 'in-progress'
                    };

                    // Archive the job
                    const archivedJobs = JSON.parse(localStorage.getItem('archivedJobs') || '[]');
                    archivedJobs.push(jobData);
                    localStorage.setItem('archivedJobs', JSON.stringify(archivedJobs));

                    // Remove the job row
                    jobRow.remove();

                    // Add "no jobs" row if needed
                    if (!tbody.querySelector('tr.job')) {
                        const noJobsRow = document.createElement('tr');
                        noJobsRow.className = 'no-jobs';
                        const td = document.createElement('td');
                        td.colSpan = '11';
                        td.textContent = 'No jobs assigned';
                        noJobsRow.appendChild(td);
                        tbody.appendChild(noJobsRow);
                    }

                    // Save state
                    if (typeof saveCurrentState === 'function') {
                        saveCurrentState();
                    }

                    alert('Job has been moved to archive');
                } catch (error) {
                    console.error('Error during delete:', error);
                    alert('Error archiving job: ' + error.message);
                }
            }
        }

        contextMenu.style.display = 'none';
    });

    // Add new job function
    async function addNewJob(jobData) {
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to add job');
            }
            
            const result = await response.json();
            const jobElement = createJobElement({
                id: result.id,
                ...jobData
            });
            
            const pressContainer = document.querySelector(`.press[data-press="${jobData.pressNumber}"] .jobs`);
            pressContainer.appendChild(jobElement);
            
            return result;
        } catch (error) {
            console.error('Error adding job:', error);
            throw error;
        }
    }

    // Drag and Drop Functions
    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.closest('tr').id);
        ev.target.closest('tr').classList.add('dragging');
    }

    function drop(ev) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const draggedElement = document.getElementById(data);
        const dropZone = ev.target.closest('tbody');
        
        if (dropZone && draggedElement) {
            dropZone.appendChild(draggedElement);
            draggedElement.classList.remove('dragging');
            
            // Get the new press number
            const newPressNumber = dropZone.closest('.press').dataset.press;
            console.log(`Moved to Press ${newPressNumber}`);
            
            // Here you would update the database
            updateJobPress(data, newPressNumber);
        }
    }

    async function updateJobPress(jobId, newPress) {
        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pressNumber: newPress
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update job');
            }
        } catch (error) {
            console.error('Error updating job:', error);
        }
    }

    // Remove any existing event listeners and add new ones
    document.addEventListener('DOMContentLoaded', function() {
        const jobs = document.querySelectorAll('.job');
        jobs.forEach(job => {
            job.setAttribute('draggable', true);
            job.addEventListener('dragstart', drag);
        });
    });

    // Add "No jobs assigned" row to empty tables
    document.querySelectorAll('.jobs-table tbody').forEach(tbody => {
        if (!tbody.querySelector('.job')) {
            const noJobsRow = document.createElement('tr');
            noJobsRow.className = 'no-jobs';
            noJobsRow.innerHTML = '<td colspan="11">No jobs assigned</td>';
            tbody.appendChild(noJobsRow);
        }
    });

    // Update drop function to handle "No jobs" row
    const originalDrop = drop;
    drop = function(ev) {
        const targetTbody = ev.target.closest('tbody');
        if (targetTbody) {
            const noJobsRow = targetTbody.querySelector('.no-jobs');
            if (noJobsRow) {
                noJobsRow.style.display = 'none';
            }
        }
        originalDrop(ev);
    };

    // Existing drag and drop code...
});

document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.press-container')) return;

    // Initialize drag and drop
    function initDragAndDrop() {
        const draggables = document.querySelectorAll('.job');
        const containers = document.querySelectorAll('.press tbody');
        
        draggables.forEach(draggable => {
            draggable.draggable = true;
            
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });
            
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });
        
        containers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const afterElement = getDragAfterElement(container, e.clientY);
                const draggable = document.querySelector('.dragging');
                if (draggable) {
                    if (afterElement == null) {
                        container.appendChild(draggable);
                    } else {
                        container.insertBefore(draggable, afterElement);
                    }
                }
            });
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.job:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Context Menu Setup
    const menu = document.getElementById('jobContextMenu');
    if (!menu) {
        console.error('Context menu element not found');
        return;
    }

    // Add context menu to both sections
    document.addEventListener('contextmenu', function(e) {
        // Try to find job row in both sections
        const jobRow = e.target.closest('tr.job');
        if (!jobRow) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Store both the job ID and the exact row reference
        const pressContainer = jobRow.closest('.press-container');
        const press = jobRow.closest('.press');
        
        if (!press || !pressContainer) {
            console.error('Could not find press container');
            return;
        }

        // Get all jobs in this specific press
        const tbody = press.querySelector('tbody');
        const allJobsInPress = Array.from(tbody.querySelectorAll('tr.job'));
        const currentIndex = allJobsInPress.indexOf(jobRow);

        console.log('Right-clicked job:', {
            pressContainer: pressContainer.className,
            press: press.dataset.press,
            jobId: jobRow.id,
            index: currentIndex
        });
        
        menu.dataset.currentJob = jobRow.id;
        menu.dataset.currentPress = press.dataset.press;
        menu.dataset.currentIndex = currentIndex;
        menu.dataset.isCompleted = pressContainer.classList.contains('completed');
        
        // Position menu
        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
    });

    // Handle menu item clicks
    menu.addEventListener('click', function(e) {
        const item = e.target.closest('.context-menu-item');
        if (!item) return;

        const action = item.dataset.action;
        const currentJobId = menu.dataset.currentJob;
        const currentPress = menu.dataset.currentPress;
        const currentIndex = parseInt(menu.dataset.currentIndex);
        const isCompleted = menu.dataset.isCompleted === 'true';
        
        // Get the exact job row using press number, section, and index
        const section = isCompleted ? '.completed' : '.in-progress';
        const press = document.querySelector(`.press-container${section} .press[data-press="${currentPress}"]`);
        const tbody = press.querySelector('tbody');
        const jobRows = Array.from(tbody.querySelectorAll('tr.job'));
        const jobRow = jobRows[currentIndex];
        
        if (!jobRow) {
            console.error('Could not find job row');
            menu.style.display = 'none';
            return;
        }

        if (action === 'edit') {
            // Handle edit action
            const pressContainer = jobRow.closest('.press');
            if (pressContainer) {
                // Your edit logic here
                console.log('Editing job in press', pressContainer.dataset.press);
            }
        } else if (action === 'complete') {
            // Implement complete logic here
            console.log('Complete functionality to be implemented');
        } else if (action === 'split') {
            const cells = jobRow.getElementsByTagName('td');
            const quantityCell = cells[3];
            const valueCell = cells[6];
            
            if (!quantityCell || !valueCell) {
                console.error('Could not find quantity or value cells');
                return;
            }

            // Rest of your split logic remains the same
            const totalQuantity = parseInt(quantityCell.textContent.replace(/,/g, ''));
            const totalValue = parseFloat(valueCell.textContent.replace(/[^0-9.-]+/g, ''));
            
            const splitQuantity = prompt(`Enter quantity to complete (max ${totalQuantity.toLocaleString()}):`, '');
            
            if (splitQuantity === null) return;
            
            const completedQuantity = parseInt(splitQuantity.replace(/,/g, ''));
            if (isNaN(completedQuantity) || completedQuantity <= 0 || completedQuantity >= totalQuantity) {
                alert('Please enter a valid quantity less than the total.');
                return;
            }
            
            // Calculate remaining values
            const remainingQuantity = totalQuantity - completedQuantity;
            const completedValue = (totalValue * completedQuantity) / totalQuantity;
            const remainingValue = totalValue - completedValue;
            
            // Update original row
            quantityCell.textContent = remainingQuantity.toLocaleString();
            valueCell.textContent = remainingValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Create completed job row
            const completedJob = jobRow.cloneNode(true);
            completedJob.id = jobRow.id + '-completed';
            
            const completedCells = completedJob.getElementsByTagName('td');
            completedCells[3].textContent = completedQuantity.toLocaleString();
            completedCells[6].textContent = completedValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            
            // Move completed job to completed section
            const targetPress = document.querySelector(`.press-container.completed .press[data-press="${currentPress}"] tbody`);
            if (targetPress) {
                const noJobsRow = targetPress.querySelector('.no-jobs');
                if (noJobsRow) {
                    noJobsRow.remove();
                }
                targetPress.appendChild(completedJob);
                initDragAndDrop();
            }
        } else if (action === 'delete' || action === 'archive') { // Check for both delete and archive
            if (confirm('Are you sure you want to archive this job?')) {
                try {
                    // Get all the job data before removing
                    const cells = jobRow.getElementsByTagName('td');
                    const jobData = {
                        id: jobRow.id,
                        pressNumber: currentPress,
                        timestamp: new Date().toISOString(),
                        data: Array.from(cells).map(cell => cell.textContent),
                        section: isCompleted ? 'completed' : 'in-progress'
                    };

                    console.log('Archiving job:', jobData); // Debug log

                    // Get existing archived jobs or initialize empty array
                    const archivedJobs = JSON.parse(localStorage.getItem('archivedJobs') || '[]');
                    
                    // Add new job to archive
                    archivedJobs.push(jobData);
                    
                    // Save updated archive
                    localStorage.setItem('archivedJobs', JSON.stringify(archivedJobs));

                    // Remove the job row from the table
                    const tbody = jobRow.closest('tbody');
                    jobRow.remove();

                    // Check if the tbody is empty and add "no jobs" row if needed
                    if (!tbody.querySelector('tr.job')) {
                        const noJobsRow = document.createElement('tr');
                        noJobsRow.className = 'no-jobs';
                        const td = document.createElement('td');
                        td.colSpan = '11';
                        td.textContent = 'No jobs assigned';
                        noJobsRow.appendChild(td);
                        tbody.appendChild(noJobsRow);
                    }

                    // Save the current state after deletion
                    if (typeof saveCurrentState === 'function') {
                        saveCurrentState();
                    }

                    console.log('Job archived successfully'); // Debug log
                    alert('Job has been moved to archive');
                } catch (error) {
                    console.error('Error during delete:', error);
                }
            }
        }

        menu.style.display = 'none';
    });

    // Close menu on click outside
    document.addEventListener('click', function(e) {
        if (menu && !menu.contains(e.target)) {
            menu.style.display = 'none';
        }
    });

    // Initialize drag and drop
    initDragAndDrop();

    function addNoJobsRow(tbody) {
        // Remove any existing "no jobs" rows first
        const existingNoJobs = tbody.querySelectorAll('.no-jobs');
        existingNoJobs.forEach(row => row.remove());
        
        // Add new "no jobs" row
        const row = document.createElement('tr');
        row.className = 'no-jobs';
        const td = document.createElement('td');
        td.colSpan = '11';
        td.textContent = 'No jobs';
        row.appendChild(td);
        tbody.appendChild(row);
    }

    function ensureNoJobsRows() {
        // Add "no jobs" row to empty presses
        document.querySelectorAll('.press tbody').forEach(tbody => {
            const hasJobs = tbody.querySelector('tr.job');
            const hasNoJobsRow = tbody.querySelector('.no-jobs');
            
            if (!hasJobs && !hasNoJobsRow) {
                addNoJobsRow(tbody);
            } else if (hasJobs && hasNoJobsRow) {
                hasNoJobsRow.remove();
            }
        });
    }

    function saveCurrentState() {
        console.log('Saving state...');
        const allJobs = [];
        
        document.querySelectorAll('tr.job').forEach(job => {
            const pressContainer = job.closest('.press-container');
            const press = job.closest('.press');
            
            if (pressContainer && press) {
                const cells = Array.from(job.cells).map(cell => cell.textContent);
                
                allJobs.push({
                    id: job.id,
                    cells: cells,
                    pressNumber: press.dataset.press,
                    section: pressContainer.classList.contains('completed') ? 'completed' : 'in-progress'
                });
            }
        });
        
        console.log('Saving jobs:', allJobs.length);
        localStorage.setItem('savedJobs', JSON.stringify(allJobs));
    }

    function restoreSavedState() {
        console.log('Loading saved state...');
        
        // Clear all existing rows
        document.querySelectorAll('tr.job, tr.no-jobs').forEach(row => row.remove());
        
        const savedJobs = localStorage.getItem('savedJobs');
        
        if (savedJobs) {
            const jobs = JSON.parse(savedJobs);
            console.log('Found saved jobs:', jobs.length);
            
            jobs.forEach(job => {
                const targetContainer = document.querySelector(
                    `.press-container.${job.section} .press[data-press="${job.pressNumber}"] tbody`
                );
                
                if (targetContainer) {
                    // Create new table row
                    const row = document.createElement('tr');
                    row.id = job.id;
                    row.className = 'job';
                    row.draggable = true;
                    
                    // Add cells
                    job.cells.forEach(cellText => {
                        const td = document.createElement('td');
                        td.textContent = cellText;
                        row.appendChild(td);
                    });
                    
                    // Add to target container
                    targetContainer.appendChild(row);
                }
            });
        }
        
        // Ensure "no jobs" rows are correct
        ensureNoJobsRows();
    }

    // Save state after any changes
    const observer = new MutationObserver(() => {
        console.log('Change detected, saving state...');
        saveCurrentState();
        ensureNoJobsRows();
    });

    document.querySelectorAll('.press-container').forEach(container => {
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    });

    // Initial load of saved state
    restoreSavedState();
    
    // Initialize drag and drop after loading state
    initDragAndDrop();
});

// Wait for both DOM and all resources to load
window.addEventListener('load', function() {
    // Initial state logging
    console.log('=== INITIAL STATE ===');
    logLayoutMetrics();

    // Set up continuous monitoring
    setInterval(logLayoutMetrics, 1000); // Check every second

    // Set up mutation observer for content div
    const content = document.querySelector('.content');
    if (content) {
        const observer = new MutationObserver(function(mutations) {
            console.log('=== MUTATION DETECTED ===');
            console.log('Timestamp:', new Date().toLocaleTimeString());
            mutations.forEach(mutation => {
                console.log('Type:', mutation.type);
                console.log('Target:', mutation.target);
            });
            logLayoutMetrics();
        });

        observer.observe(content, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    // Debug other elements
    console.log('Sidebar width:', getComputedStyle(document.querySelector('.sidebar')).width);
    console.log('Body display:', getComputedStyle(document.body).display);
    console.log('Content width:', getComputedStyle(document.querySelector('.content')).width);
});

function logLayoutMetrics() {
    const content = document.querySelector('.content');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    console.log({
        timestamp: new Date().toLocaleTimeString(),
        contentMargin: getComputedStyle(content).marginLeft,
        contentWidth: getComputedStyle(content).width,
        sidebarWidth: sidebar ? getComputedStyle(sidebar).width : 'no sidebar',
        bodyDisplay: getComputedStyle(body).display,
        bodyWidth: getComputedStyle(body).width,
        windowWidth: window.innerWidth
    });
}
