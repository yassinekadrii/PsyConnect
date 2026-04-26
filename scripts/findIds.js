const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function findIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('../models/User');
        const Connection = require('../models/Connection');

        const doctors = await User.find({ role: 'doctor' }).select('firstName lastName email');
        const patients = await User.find({ role: 'patient' }).select('firstName lastName email');

        console.log('Doctors:');
        doctors.forEach(d => console.log(`- ${d.firstName} ${d.lastName} (${d.email}) ID: ${d._id}`));

        console.log('\nPatients:');
        patients.forEach(p => console.log(`- ${p.firstName} ${p.lastName} (${p.email}) ID: ${p._id}`));

        const connRaw = await mongoose.connection.db.collection('connections').find({}).toArray();
        console.log(`\nRaw connections count: ${connRaw.length}`);
        connRaw.forEach(c => console.log(JSON.stringify(c)));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
findIds();
