/**
 * @file scripts/diagnostic.js
 * @description Utility script to diagnose the environment and database connection.
 * Used for troubleshooting deployment and setup issues.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('+password');
        console.log(`Total users found: ${users.length}`);

        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}) | SuperAdmin: ${u.isSuperAdmin} | Password Hash Start: ${u.password ? u.password.substring(0, 10) : 'MISSING'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
