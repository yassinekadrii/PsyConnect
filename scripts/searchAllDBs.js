const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'config', 'local'].includes(dbName)) continue;
            
            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();
            const connCol = collections.find(c => c.name === 'connections');
            
            if (connCol) {
                const count = await db.collection('connections').countDocuments({});
                console.log(`DB '${dbName}' has collection 'connections' with ${count} records.`);
                if (count > 0) {
                    const sample = await db.collection('connections').find({}).toArray();
                    console.log(`Sample from ${dbName}:`, JSON.stringify(sample));
                }
            }
        }

    } finally {
        await client.close();
    }
}
run();
