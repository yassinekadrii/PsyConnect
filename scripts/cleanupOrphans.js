require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const Connection = require('../models/Connection');

const cleanupOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get all valid User IDs
        const users = await User.find({}, '_id');
        const userIds = users.map(u => u._id.toString());
        console.log(`Found ${userIds.length} valid users.`);

        // 2. Cleanup Messages
        const allMessages = await Message.find({});
        let messagesDeleted = 0;
        for (const msg of allMessages) {
            if (!msg.sender || !msg.receiver || 
                !userIds.includes(msg.sender.toString()) || 
                !userIds.includes(msg.receiver.toString())) {
                await Message.deleteOne({ _id: msg._id });
                messagesDeleted++;
            }
        }
        console.log(`Cleaned up ${messagesDeleted} orphan messages.`);

        // 3. Cleanup Connections
        const allConnections = await Connection.find({});
        let connectionsDeleted = 0;
        for (const conn of allConnections) {
            if (!conn.patient || !conn.doctor || 
                !userIds.includes(conn.patient.toString()) || 
                !userIds.includes(conn.doctor.toString())) {
                await Connection.deleteOne({ _id: conn._id });
                connectionsDeleted++;
            }
        }
        console.log(`Cleaned up ${connectionsDeleted} orphan connections.`);

        await mongoose.disconnect();
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanupOrphans();
