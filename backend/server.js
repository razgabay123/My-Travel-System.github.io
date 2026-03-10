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

        const employee = await employeeQueries.getByUsernameOrCode(username);

        if (!employee) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await verifyPassword(password, employee.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        delete employee.password;

        res.json({ success: true, employee });
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

        const hashedPassword = await hashPassword(newPassword);
        await employeeQueries.updatePassword(hashedPassword, employeeId);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== EMPLOYEE ENDPOINTS ====================

// Get all employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await employeeQueries.getAll();
        employees.forEach(emp => delete emp.password);
        res.json({ employees });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get employee by ID
app.get('/api/employees/:id', async (req, res) => {
    try {
        const employee = await employeeQueries.getById(req.params.id);

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

        const hashedPassword = await hashPassword(password);

        const result = await employeeQueries.create({
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
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Username or worker code already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        const { workerCode, username, name, address, city, phone, route, time, department, company, email, active } = req.body;

        if (!username || !name) {
            return res.status(400).json({ error: 'Username and name are required' });
        }

        await employeeQueries.update({
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
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Username or worker code already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        await employeeQueries.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== DRIVER ENDPOINTS ====================

// Get all drivers
app.get('/api/drivers', async (req, res) => {
    try {
        const drivers = await driverQueries.getAll();
        res.json({ drivers });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create driver
app.post('/api/drivers', async (req, res) => {
    try {
        const { name, phone, route, city, vehicle, passengers } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Driver name is required' });
        }

        const result = await driverQueries.create({
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
app.put('/api/drivers/:id', async (req, res) => {
    try {
        const { name, phone, route, city, vehicle, passengers } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Driver name is required' });
        }

        await driverQueries.update({
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
app.delete('/api/drivers/:id', async (req, res) => {
    try {
        await driverQueries.delete(req.params.id);
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
║   Database: PostgreSQL                      ║
║   Status: ✅ Running                         ║
╚══════════════════════════════════════════════╝
    `);
});

module.exports = app;
