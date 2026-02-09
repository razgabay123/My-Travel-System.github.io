const fs = require('fs');
const path = require('path');
const { initDatabase, employeeQueries, driverQueries, hashPassword } = require('./database');

async function migrate() {
    console.log('🔄 Starting migration from workers.json to SQLite...\n');

    // Initialize database
    initDatabase();

    // Read workers.json
    const workersJsonPath = path.join(__dirname, '..', 'workers.json');

    if (!fs.existsSync(workersJsonPath)) {
        console.error('❌ workers.json not found!');
        console.log('Expected location:', workersJsonPath);
        process.exit(1);
    }

    const workersData = JSON.parse(fs.readFileSync(workersJsonPath, 'utf8'));

    // Migrate employees
    console.log('📋 Migrating employees...');
    let employeeCount = 0;
    let baseWorkerCode = 8220; // Start from 8220, Omri will get 8228

    for (const emp of workersData.employees) {
        try {
            // Determine worker code
            let workerCode = null;
            if (emp.id === 2) {
                // Omri gets 8228
                workerCode = '8228';
            } else if (emp.workerCode) {
                workerCode = emp.workerCode;
            }
            // Others will have null worker code for now (can be filled later)

            // Hash password
            const hashedPassword = await hashPassword(emp.password || '1234');

            // Insert employee
            employeeQueries.create({
                workerCode: workerCode,
                username: emp.username || emp.name.split(' ').pop(), // Use last name as username if not set
                password: hashedPassword,
                name: emp.name,
                address: emp.address || null,
                city: emp.city || null,
                phone: emp.phone || null,
                route: emp.route || null,
                time: emp.time || null,
                department: emp.department || null,
                company: emp.company || null,
                active: emp.active !== undefined ? emp.active : 1
            });

            employeeCount++;
            console.log(`  ✅ ${emp.name} (${emp.username || emp.name.split(' ').pop()}) ${workerCode ? `[Code: ${workerCode}]` : ''}`);
        } catch (error) {
            console.error(`  ❌ Failed to migrate ${emp.name}:`, error.message);
        }
    }

    console.log(`\n✅ Migrated ${employeeCount} employees\n`);

    // Migrate drivers
    console.log('🚗 Migrating drivers...');
    let driverCount = 0;

    for (const driver of workersData.drivers) {
        try {
            driverQueries.create({
                name: driver.name,
                phone: driver.phone || null,
                route: driver.route || null,
                city: driver.city || null,
                vehicle: driver.vehicle || null,
                passengers: driver.passengers || 0
            });

            driverCount++;
            console.log(`  ✅ ${driver.name} - ${driver.vehicle || 'Unknown vehicle'}`);
        } catch (error) {
            console.error(`  ❌ Failed to migrate driver ${driver.name}:`, error.message);
        }
    }

    console.log(`\n✅ Migrated ${driverCount} drivers\n`);

    // Summary
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   ✅ Migration Complete!                     ║');
    console.log('║                                              ║');
    console.log(`║   Employees: ${employeeCount.toString().padEnd(30)} ║`);
    console.log(`║   Drivers: ${driverCount.toString().padEnd(32)} ║`);
    console.log('║                                              ║');
    console.log('║   Database: travel-system.db                 ║');
    console.log('║   All passwords are hashed with bcrypt       ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('\n💡 Note: Worker codes are optional and can be updated later.');
    console.log('💡 Default password for employees without one: 1234');
    console.log('\n🚀 Run "npm start" to start the backend server!');
}

// Run migration
migrate().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
