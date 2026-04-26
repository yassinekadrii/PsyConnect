const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).limit(10).toArray();
        console.log(`Recent messages: ${messages.length}`);
        messages.forEach(m => {
            console.log(`From: ${m.sender} To: ${m.receiver} Content: ${m.content.substring(0, 20)}`);
        });

    } finally {
        await client.close();
    }
}
run();
