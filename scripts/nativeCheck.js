const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        console.log(`Connected to DB: ${db.databaseName}`);
        
        const connections = await db.collection('connections').find({}).toArray();
        console.log(`Found ${connections.length} connections in 'connections' collection.`);
        
        connections.forEach(c => {
            console.log(JSON.stringify(c));
        });

        // Also check if there's any other collection that might be used
        const allCollections = await db.listCollections().toArray();
        console.log('All collections:', allCollections.map(c => c.name));

    } finally {
        await client.close();
    }
}
run();
