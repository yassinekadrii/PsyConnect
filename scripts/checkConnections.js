const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Connection = require('../models/Connection');
const User = require('../models/User');

dotenv.config();

async function checkConnections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const connections = await Connection.find({})
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName email');
        
        console.log('--- Current Connections ---');
        connections.forEach(c => {
            console.log(`[${c.status}] Patient: ${c.patient ? c.patient.email : 'Unknown'} <-> Doctor: ${c.doctor ? c.doctor.email : 'Unknown'}`);
        });
        console.log('---------------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkConnections();
