const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const userCount = await db.collection('users').countDocuments({});
        console.log(`Total users: ${userCount}`);
        
        const rihab = await db.collection('users').findOne({ firstName: 'rihab' });
        console.log(`Rihab User: ${JSON.stringify(rihab)}`);

        const allUsers = await db.collection('users').find({}).limit(10).toArray();
        allUsers.forEach(u => console.log(`${u.firstName} ${u.lastName} (${u.role})` || 'No name'));

    } finally {
        await client.close();
    }
}
run();
