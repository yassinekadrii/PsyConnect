const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        console.log('Searching for blocked connections...');
        const blocked = await db.collection('connections').find({ status: 'blocked' }).toArray();
        
        if (blocked.length === 0) {
            console.log('No blocked connections found. Checking ALL connections...');
            const all = await db.collection('connections').find({}).toArray();
            console.log(`Total connections in DB: ${all.length}`);
            all.forEach(c => console.log(JSON.stringify(c)));
        } else {
            console.log(`Found ${blocked.length} blocked connections.`);
            for (const c of blocked) {
                console.log(`Unblocking: ${JSON.stringify(c)}`);
                await db.collection('connections').updateOne({ _id: c._id }, { $set: { status: 'accepted' } });
            }
            console.log('Unblock complete.');
        }

    } finally {
        await client.close();
    }
}
run();
