const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments({});
            console.log(`Collection '${col.name}' has ${count} documents.`);
        }

    } finally {
        await client.close();
    }
}
run();
