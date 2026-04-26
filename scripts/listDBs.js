const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function listAll() {
    try {
        const client = await mongoose.connect(process.env.MONGODB_URI);
        const admin = new mongoose.mongo.Admin(client.connection.db);
        const dbs = await admin.listDatabases();
        console.log('Databases:', dbs.databases.map(d => d.name));

        const currentDb = client.connection.db;
        console.log(`Current DB: ${currentDb.databaseName}`);
        
        const collections = await currentDb.listCollections().toArray();
        console.log('Collections in current DB:', collections.map(c => c.name));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listAll();
