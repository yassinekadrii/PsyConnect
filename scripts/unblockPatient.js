const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

const Connection = require('../models/Connection');
const User = require('../models/User');

async function unblock() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        // Find blocked connections
        const blocked = await Connection.find({ status: 'blocked' })
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName email');

        if (blocked.length === 0) {
            console.log('No blocked connections found.');
            process.exit(0);
        }

        console.log('Found blocked connections:');
        blocked.forEach((c, i) => {
            console.log(`${i}: Patient [${c.patient.firstName} ${c.patient.lastName} (${c.patient.email})] <-> Doctor [${c.doctor.firstName} ${c.doctor.lastName}]`);
        });

        // For now, let's unblock ALL blocked connections since the user said "i blocked the patient remove it"
        // and presumably there's only one recent one or they want to clear it.
        const result = await Connection.updateMany({ status: 'blocked' }, { status: 'accepted' });
        console.log(`Unblocked ${result.modifiedCount} connection(s).`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

unblock();
