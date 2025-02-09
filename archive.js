document.addEventListener('DOMContentLoaded', function() {
    loadArchivedJobs();
});

function loadArchivedJobs() {
    const archivedJobs = JSON.parse(localStorage.getItem('archivedJobs') || '[]');
    const tbody = document.getElementById('archiveTableBody');
    
    // Clear existing content
    tbody.innerHTML = '';
    
    if (archivedJobs.length === 0) {
        tbody.innerHTML = '<tr class="no-jobs"><td colspan="13">No archived items</td></tr>';
        return;
    }
    
    archivedJobs.forEach(job => {
        const row = document.createElement('tr');
        row.className = 'job';
        
        // Add all job data cells
        job.cells.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
            row.appendChild(td);
        });
        
        // Add original press cell
        const pressTd = document.createElement('td');
        pressTd.textContent = `Press ${job.pressNumber}`;
        row.appendChild(pressTd);
        
        // Add restore button cell
        const actionTd = document.createElement('td');
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'restore-btn';
        restoreBtn.textContent = 'Restore';
        restoreBtn.onclick = () => restoreJob(job);
        actionTd.appendChild(restoreBtn);
        row.appendChild(actionTd);
        
        tbody.appendChild(row);
    });
}

function restoreJob(job) {
    // Get current archived jobs
    const archivedJobs = JSON.parse(localStorage.getItem('archivedJobs') || '[]');
    
    // Remove job from archived jobs
    const updatedArchivedJobs = archivedJobs.filter(j => j.id !== job.id);
    localStorage.setItem('archivedJobs', JSON.stringify(updatedArchivedJobs));
    
    // Add job back to active jobs
    const activeJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    activeJobs.push(job);
    localStorage.setItem('savedJobs', JSON.stringify(activeJobs));
    
    // Reload archive table
    loadArchivedJobs();
    
    alert('Job restored! Please refresh the schedule page to see the restored job.');
} 