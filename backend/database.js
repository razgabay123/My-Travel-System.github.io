const initSqlJs = require('sql.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'travel-system.db');
let db = null;
let SQL = null;

// Initialize database
async function initDatabase() {
    // Initialize sql.js
    SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('✅ Existing database loaded');
    } else {
        db = new SQL.Database();
        console.log('✅ New database created');
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workerCode TEXT UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            address TEXT,
            city TEXT,
            phone TEXT,
            route TEXT,
            time TEXT,
            department TEXT,
            company TEXT,
            active INTEGER DEFAULT 1,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            route TEXT,
            city TEXT,
            vehicle TEXT,
            passengers INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Database tables initialized');
    saveDatabase();
}

// Save database to file
function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

// Helper functions for employees
const employeeQueries = {
    getAll: () => {
        const result = db.exec('SELECT * FROM employees ORDER BY id');
        if (result.length === 0) return [];
        return result[0].values.map(row => rowToObject(result[0].columns, row));
    },

    getById: (id) => {
        const result = db.exec('SELECT * FROM employees WHERE id = ?', [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0].columns, result[0].values[0]);
    },

    getByUsername: (username) => {
        const result = db.exec('SELECT * FROM employees WHERE username = ?', [username]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0].columns, result[0].values[0]);
    },

    getByWorkerCode: (code) => {
        const result = db.exec('SELECT * FROM employees WHERE workerCode = ?', [code]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0].columns, result[0].values[0]);
    },

    getByUsernameOrCode: (username) => {
        const result = db.exec('SELECT * FROM employees WHERE username = ? OR workerCode = ?', [username, username]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0].columns, result[0].values[0]);
    },

    create: (employee) => {
        db.run(`
            INSERT INTO employees (workerCode, username, password, name, address, city, phone, route, time, department, company, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            employee.workerCode || null,
            employee.username,
            employee.password,
            employee.name,
            employee.address || null,
            employee.city || null,
            employee.phone || null,
            employee.route || null,
            employee.time || null,
            employee.department || null,
            employee.company || null,
            employee.active !== undefined ? employee.active : 1
        ]);
        saveDatabase();

        // Get last insert ID
        const result = db.exec('SELECT last_insert_rowid() as id');
        return { lastInsertRowid: result[0].values[0][0] };
    },

    update: (employee) => {
        db.run(`
            UPDATE employees
            SET workerCode = ?,
                username = ?,
                name = ?,
                address = ?,
                city = ?,
                phone = ?,
                route = ?,
                time = ?,
                department = ?,
                company = ?,
                active = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            employee.workerCode || null,
            employee.username,
            employee.name,
            employee.address || null,
            employee.city || null,
            employee.phone || null,
            employee.route || null,
            employee.time || null,
            employee.department || null,
            employee.company || null,
            employee.active !== undefined ? employee.active : 1,
            employee.id
        ]);
        saveDatabase();
    },

    updatePassword: (password, id) => {
        db.run(`
            UPDATE employees
            SET password = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [password, id]);
        saveDatabase();
    },

    delete: (id) => {
        db.run('DELETE FROM employees WHERE id = ?', [id]);
        saveDatabase();
    }
};

// Helper functions for drivers
const driverQueries = {
    getAll: () => {
        const result = db.exec('SELECT * FROM drivers ORDER BY id');
        if (result.length === 0) return [];
        return result[0].values.map(row => rowToObject(result[0].columns, row));
    },

    getById: (id) => {
        const result = db.exec('SELECT * FROM drivers WHERE id = ?', [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0].columns, result[0].values[0]);
    },

    create: (driver) => {
        db.run(`
            INSERT INTO drivers (name, phone, route, city, vehicle, passengers)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            driver.name,
            driver.phone || null,
            driver.route || null,
            driver.city || null,
            driver.vehicle || null,
            driver.passengers || 0
        ]);
        saveDatabase();

        const result = db.exec('SELECT last_insert_rowid() as id');
        return { lastInsertRowid: result[0].values[0][0] };
    },

    update: (driver) => {
        db.run(`
            UPDATE drivers
            SET name = ?,
                phone = ?,
                route = ?,
                city = ?,
                vehicle = ?,
                passengers = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            driver.name,
            driver.phone || null,
            driver.route || null,
            driver.city || null,
            driver.vehicle || null,
            driver.passengers || 0,
            driver.id
        ]);
        saveDatabase();
    },

    delete: (id) => {
        db.run('DELETE FROM drivers WHERE id = ?', [id]);
        saveDatabase();
    }
};

// Convert SQL row to object
function rowToObject(columns, values) {
    const obj = {};
    columns.forEach((col, i) => {
        obj[col] = values[i];
    });
    return obj;
}

// Password hashing utilities
async function hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
}

async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
    initDatabase,
    employeeQueries,
    driverQueries,
    hashPassword,
    verifyPassword,
    saveDatabase
};
