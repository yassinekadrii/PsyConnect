const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const docs = await db.collection('prescriptions').find({}).toArray();
        docs.forEach(d => console.log(`Patient: ${d.patient} Doctor: ${d.doctor}`));

    } finally {
        await client.close();
    }
}
run();
