const express = require('express');
const cors = require('cors');
const { initDatabase, employeeQueries, driverQueries, hashPassword, verifyPassword } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization flag
let dbReady = false;

// Initialize database
initDatabase().then(() => {
    dbReady = true;
    console.log('✅ Database ready');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
});

// Middleware to check if database is ready
app.use((req, res, next) => {
    if (!dbReady && !req.path.includes('/health')) {
        return res.status(503).json({ error: 'Database not ready yet, please wait...' });
    }
    next();
});

// ==================== AUTH ENDPOINTS ====================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Find employee by username or worker code
        const employee = employeeQueries.getByUsernameOrCode(username);

        if (!employee) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await verifyPassword(password, employee.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Don't send password back
        delete employee.password;

        res.json({
            success: true,
            employee: employee
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { employeeId, newPassword } = req.body;

        if (!employeeId || !newPassword) {
            return res.status(400).json({ error: 'Employee ID and new password required' });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        employeeQueries.updatePassword(hashedPassword, employeeId);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== EMPLOYEE ENDPOINTS ====================

// Get all employees
app.get('/api/employees', (req, res) => {
    try {
        const employees = employeeQueries.getAll();

        // Remove passwords from response
        employees.forEach(emp => delete emp.password);

        res.json({ employees });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get employee by ID
app.get('/api/employees/:id', (req, res) => {
    try {
        const employee = employeeQueries.getById(req.params.id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        delete employee.password;
        res.json({ employee });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create employee
app.post('/api/employees', async (req, res) => {
    try {
        const { workerCode, username, password, name, address, city, phone, route, time, department, company, email, active } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({ error: 'Username, password, and name are required' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create employee
        const result = employeeQueries.create({
            workerCode: workerCode || null,
            username,
            password: hashedPassword,
            name,
            address: address || null,
            city: city || null,
            phone: phone || null,
            route: route || null,
            time: time || null,
            department: department || null,
            company: company || null,
            email: email || null,
            active: active !== undefined ? active : 1
        });

        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create employee error:', error);
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or worker code already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
    try {
        const { workerCode, username, name, address, city, phone, route, time, department, company, email, active } = req.body;

        if (!username || !name) {
            return res.status(400).json({ error: 'Username and name are required' });
        }

        // Update employee (don't update password here)
        employeeQueries.update({
            id: req.params.id,
            workerCode: workerCode || null,
            username,
            name,
            address: address || null,
            city: city || null,
            phone: phone || null,
            route: route || null,
            time: time || null,
            department: department || null,
            company: company || null,
            email: email || null,
            active: active !== undefined ? active : 1
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Update employee error:', error);
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or worker code already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
    try {
        employeeQueries.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== DRIVER ENDPOINTS ====================

// Get all drivers
app.get('/api/drivers', (req, res) => {
    try {
        const drivers = driverQueries.getAll();
        res.json({ drivers });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create driver
app.post('/api/drivers', (req, res) => {
    try {
        const { name, phone, route, city, vehicle, passengers } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Driver name is required' });
        }

        const result = driverQueries.create({
            name,
            phone: phone || null,
            route: route || null,
            city: city || null,
            vehicle: vehicle || null,
            passengers: passengers || 0
        });

        res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
        console.error('Create driver error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update driver
app.put('/api/drivers/:id', (req, res) => {
    try {
        const { name, phone, route, city, vehicle, passengers } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Driver name is required' });
        }

        driverQueries.update({
            id: req.params.id,
            name,
            phone: phone || null,
            route: route || null,
            city: city || null,
            vehicle: vehicle || null,
            passengers: passengers || 0
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete driver
app.delete('/api/drivers/:id', (req, res) => {
    try {
        driverQueries.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Travel System Backend is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🚀 Travel System Backend Server           ║
║   Port: ${PORT}                              ║
║   Database: SQLite (travel-system.db)       ║
║   Status: ✅ Running                         ║
╚══════════════════════════════════════════════╝
    `);
});

module.exports = app;
