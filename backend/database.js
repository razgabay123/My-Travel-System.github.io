const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

// Initialize database
async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            "workerCode" TEXT UNIQUE,
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
            email TEXT,
            active INTEGER DEFAULT 1,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS drivers (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT,
            route TEXT,
            city TEXT,
            vehicle TEXT,
            passengers INTEGER DEFAULT 0,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed initial data if tables are empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM employees');
    if (parseInt(rows[0].count) === 0) {
        await seedData();
    }

    console.log('✅ Database tables initialized');
}

async function seedData() {
    const hash1234 = '$2b$10$zmaDjCj4JwmQhc7YVRd.huRzdeiCUttq9dzlpFXFCc3/v8LjpCAaK';
    const hashOmri = '$2b$10$Hf.ytieDb9Z.ny4ZF56xcOzcEu2/k118W3HyRPAj.14v0Ekj5eqAq';

    const employees = [
        [null, 'גרסיוטה', hash1234, 'אירנה גרסיוטה', 'חרצית 21', 'מודיעין', '055-66-01117', 'מסלול א', '07:12', null, 'טריילוג', null, 1],
        ['8228', 'בן אליהו', hashOmri, 'עמרי בן אליהו', 'עמק האלה 9', 'מודיעין', '052-377-7468', 'מסלול א', '07:22', 'החזרות', null, null, 1],
        [null, 'מורנוב', hash1234, 'קסניה מורנוב', 'כסלו 33', 'מודיעין', '054-223-4455', 'מסלול א', '07:27', 'שירות לקוחות', null, null, 0],
        [null, 'אלטרס', hash1234, 'שמואל אלטרס', 'חטיבת אלכסנדרוני 3', 'מודיעין', '053-998-7766', 'מסלול ב', '07:31', 'הפצה', null, null, 1],
        [null, 'בן הרוש', hash1234, 'שובל בן הרוש', 'ירח אב 9', 'מודיעין', '050-778-8990', 'מסלול א', '07:45', 'הפצה', null, null, 1],
        [null, 'בן יתח', hash1234, 'מרום בן יתח', 'יגאל ידין 3', 'מודיעין', '050-986-0774', 'מסלול ב', '07:15', 'הפצה', null, null, 1],
        [null, 'דרעי', hash1234, 'אופק דרעי', 'הפיקוס 6', 'מודיעין', '052-668-1853', 'מסלול ב', '07:15', 'הפצה', null, null, 1],
        [null, 'אביבה', hash1234, 'אביבה', 'סלעית 9', 'מודיעין', null, 'מסלול א', '07:00', 'כספים', null, null, 1],
        [null, 'נהוראי', hash1234, 'אור נהוראי', 'חטיבת אלכסנדרוני 3', 'מודיעין', '054-423-8314', 'מסלול ב', '07:00', 'הפצה', null, null, 1],
    ];

    for (const emp of employees) {
        await pool.query(`
            INSERT INTO employees ("workerCode", username, password, name, address, city, phone, route, time, department, company, email, active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, emp);
    }

    const drivers = [
        ['שמוליק', '053-888-7766', 'מסלול א', 'מודיעין', 'מרצדס ספרינטר', 4],
        ['שמוליק', '053-888-7766', 'מסלול ב', 'מודיעין', 'מרצדס ספרינטר', 4],
        ['רפי', '052-999-8877', 'מסלול ג', 'מודיעין', 'מרצדס ספרינטר', 0],
        ['אורי', '054-777-6655', 'מסלול ד', 'מודיעין', 'פולקסווגן קראפטר', 0],
        ['רמי', '050-111-2233', 'מסלול ה', 'מודיעין', 'פולקסווגן קראפטר', 0],
        ['בצלאל', '052-444-5566', 'מסלול ו', 'מודיעין', 'מרצדס ספרינטר', 0],
    ];

    for (const drv of drivers) {
        await pool.query(`
            INSERT INTO drivers (name, phone, route, city, vehicle, passengers)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, drv);
    }

    console.log('✅ Seed data inserted');
}

// Helper functions for employees
const employeeQueries = {
    getAll: async () => {
        const { rows } = await pool.query('SELECT * FROM employees ORDER BY id');
        return rows;
    },

    getById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
        return rows[0] || null;
    },

    getByUsername: async (username) => {
        const { rows } = await pool.query('SELECT * FROM employees WHERE username = $1', [username]);
        return rows[0] || null;
    },

    getByWorkerCode: async (code) => {
        const { rows } = await pool.query('SELECT * FROM employees WHERE "workerCode" = $1', [code]);
        return rows[0] || null;
    },

    getByUsernameOrCode: async (username) => {
        const { rows } = await pool.query(
            'SELECT * FROM employees WHERE username = $1 OR "workerCode" = $2 OR CAST(id AS TEXT) = $3 OR name = $4',
            [username, username, username, username]
        );
        return rows[0] || null;
    },

    create: async (employee) => {
        const { rows } = await pool.query(`
            INSERT INTO employees ("workerCode", username, password, name, address, city, phone, route, time, department, company, email, active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
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
            employee.email || null,
            employee.active !== undefined ? employee.active : 1
        ]);
        return { lastInsertRowid: rows[0].id };
    },

    update: async (employee) => {
        await pool.query(`
            UPDATE employees
            SET "workerCode" = $1,
                username = $2,
                name = $3,
                address = $4,
                city = $5,
                phone = $6,
                route = $7,
                time = $8,
                department = $9,
                company = $10,
                email = $11,
                active = $12,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $13
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
            employee.email || null,
            employee.active !== undefined ? employee.active : 1,
            employee.id
        ]);
    },

    updatePassword: async (password, id) => {
        await pool.query(`
            UPDATE employees SET password = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2
        `, [password, id]);
    },

    delete: async (id) => {
        await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    }
};

// Helper functions for drivers
const driverQueries = {
    getAll: async () => {
        const { rows } = await pool.query('SELECT * FROM drivers ORDER BY id');
        return rows;
    },

    getById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
        return rows[0] || null;
    },

    create: async (driver) => {
        const { rows } = await pool.query(`
            INSERT INTO drivers (name, phone, route, city, vehicle, passengers)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [
            driver.name,
            driver.phone || null,
            driver.route || null,
            driver.city || null,
            driver.vehicle || null,
            driver.passengers || 0
        ]);
        return { lastInsertRowid: rows[0].id };
    },

    update: async (driver) => {
        await pool.query(`
            UPDATE drivers
            SET name = $1,
                phone = $2,
                route = $3,
                city = $4,
                vehicle = $5,
                passengers = $6,
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $7
        `, [
            driver.name,
            driver.phone || null,
            driver.route || null,
            driver.city || null,
            driver.vehicle || null,
            driver.passengers || 0,
            driver.id
        ]);
    },

    delete: async (id) => {
        await pool.query('DELETE FROM drivers WHERE id = $1', [id]);
    }
};

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
    verifyPassword
};
