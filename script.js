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

    // Handle context menu actions
    document.querySelectorAll('.submenu .context-menu-item').forEach(item => {
        item.addEventListener('click', async function(e) {
            const jobId = document.getElementById('contextMenu').getAttribute('data-current-job');
            const job = document.getElementById(jobId);
            
            try {
                if (this.dataset.action === 'completed') {
                    await updateJob(jobId.replace('job-', ''), job.closest('.press').dataset.press, 'completed');
                    job.classList.add('completed');
                } else if (this.dataset.action === 'split') {
                    // Implement split logic here
                    console.log('Split functionality to be implemented');
                } else if (this.dataset.press) {
                    const targetPress = document.querySelector(`.press[data-press="${this.dataset.press}"] .jobs`);
                    await updateJob(jobId.replace('job-', ''), this.dataset.press, job.dataset.status);
                    targetPress.appendChild(job);
                }
            } catch (error) {
                console.error('Error handling job action:', error);
            }
            
            document.getElementById('contextMenu').style.display = 'none';
        });
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

    // Context Menu
    const contextMenu = document.getElementById('jobContextMenu');
    let activeJob = null;

    // Attach right-click event to job rows
    document.querySelectorAll('.job').forEach(job => {
        job.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            console.log('Right click detected'); // Debug line
            contextMenu.style.display = 'block';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
        });
    });

    // Close menu on any click
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });

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
        const jobRow = e.target.closest('tr.job');
        if (!jobRow) return;
        
        e.preventDefault();
        
        // Store both the job ID and the exact row reference
        const pressContainer = jobRow.closest('.press-container');
        const press = jobRow.closest('.press');
        
        menu.dataset.currentJob = jobRow.id;
        menu.dataset.currentPress = press.dataset.press;
        menu.dataset.currentIndex = Array.from(press.querySelectorAll('tr.job')).indexOf(jobRow);
        
        // Position menu
        const x = e.clientX;
        const y = e.clientY;
        menu.style.display = 'block';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    });

    // Handle menu item clicks
    menu.addEventListener('click', function(e) {
        const item = e.target.closest('.context-menu-item');
        if (!item) return;

        const action = item.dataset.action;
        const currentJobId = menu.dataset.currentJob;
        const currentPress = menu.dataset.currentPress;
        const currentIndex = parseInt(menu.dataset.currentIndex);
        
        // Get the exact job row using both press number and index
        const press = document.querySelector(`.press[data-press="${currentPress}"]`);
        const jobRows = Array.from(press.querySelectorAll('tr.job'));
        const jobRow = jobRows[currentIndex];
        
        if (!jobRow) {
            console.error('Could not find job row');
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
        } else if (action === 'delete') {
            // Get job data before removing
            const pressContainer = jobRow.closest('.press-container');
            const press = jobRow.closest('.press');
            const jobCells = Array.from(jobRow.cells).map(cell => cell.textContent);
            
            // Create archive entry
            const archivedJob = {
                id: jobRow.id,
                cells: jobCells,
                pressNumber: press.dataset.press,
                section: pressContainer.classList.contains('completed') ? 'completed' : 'in-progress'
            };

            // Add to archived jobs
            const archivedJobs = JSON.parse(localStorage.getItem('archivedJobs') || '[]');
            archivedJobs.push(archivedJob);
            localStorage.setItem('archivedJobs', JSON.stringify(archivedJobs));

            // Remove row
            jobRow.remove();

            // Check if we need to add "no jobs" row
            const tbody = press.querySelector('tbody');
            if (!tbody.querySelector('tr.job')) {
                addNoJobsRow(tbody);
            }

            // Save current state
            saveCurrentState();
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
