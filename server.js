const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route: Add a new die record
app.post("/add-die", (req, res) => {
    const { dieName, width, height, across, around, type, customer, description } = req.body;

    const sql = `INSERT INTO dies (dieName, width, height, across, around, type, customer, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [dieName, width, height, across, around, type, customer, description], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "Die added successfully!" });
    });
});

// Route: Get all dies
app.get("/get-dies", (req, res) => {
    db.all("SELECT * FROM dies", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Route: Update a die
app.put("/update-die/:id", (req, res) => {
    const { id } = req.params;
    const { dieName, width, height, across, around, type, customer, description } = req.body;

    const sql = `UPDATE dies SET 
                    dieName = ?, width = ?, height = ?, across = ?, around = ?, 
                    type = ?, customer = ?, description = ?
                 WHERE id = ?`;

    db.run(sql, [dieName, width, height, across, around, type, customer, description, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Die updated successfully!" });
    });
});

// New Routes for Scheduling Page

// Get all jobs
app.get("/api/jobs", (req, res) => {
    const sql = "SELECT * FROM jobs";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add a new job
app.post("/api/jobs", (req, res) => {
    const { jobName, pressNumber, status } = req.body;
    const sql = `INSERT INTO jobs (jobName, pressNumber, status) VALUES (?, ?, ?)`;
    
    db.run(sql, [jobName, pressNumber, status], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "Job added successfully!" });
    });
});

// Update job position/status
app.put("/api/jobs/:id", (req, res) => {
    const { id } = req.params;
    const { pressNumber, status } = req.body;
    const sql = `UPDATE jobs SET pressNumber = ?, status = ? WHERE id = ?`;

    db.run(sql, [pressNumber, status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Job updated successfully!" });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
