const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const doctors = await db.collection('users').find({ role: 'doctor' }).limit(2).toArray();
        const patients = await db.collection('users').find({ role: 'patient' }).limit(5).toArray();

        if (doctors.length === 0 || patients.length === 0) {
            console.log('No users found to create connections.');
            process.exit(0);
        }

        console.log(`Using Doctor: ${doctors[0].firstName} and Patient: ${patients[0].firstName}`);
        
        for (let i = 0; i < patients.length; i++) {
            await db.collection('connections').updateOne(
                { patient: patients[i]._id, doctor: doctors[0]._id },
                { 
                    $set: { 
                        status: 'accepted', 
                        requestedBy: 'patient',
                        updatedAt: new Date()
                    },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true }
            );
        }

        const count = await db.collection('connections').countDocuments({});
        console.log(`Connections count after bulk insert: ${count}`);

    } finally {
        await client.close();
    }
}
run();
