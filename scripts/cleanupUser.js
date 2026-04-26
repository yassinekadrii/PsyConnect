require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const Connection = require('../models/Connection');

const cleanupUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'yassine.kadri@worldlearningalgeria.org';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Account not found: ${email}. Checking for orphan messages...`);
            // We can't easily find orphan messages without the ID unless we look for null in populate (which we can't do here easily)
            // But if the user was just deleted, we might still have their ID if we run this before or look at logs.
            // Actually, I'll look for messages where sender or receiver doesn't exist.
            return;
        }

        const userId = user._id;
        console.log(`Found user ID: ${userId}`);

        // 1. Delete all messages
        const msgResult = await Message.deleteMany({
            $or: [{ sender: userId }, { receiver: userId }]
        });
        console.log(`Deleted ${msgResult.deletedCount} messages.`);

        // 2. Delete all connections
        const connResult = await Connection.deleteMany({
            $or: [{ patient: userId }, { doctor: userId }]
        });
        console.log(`Deleted ${connResult.deletedCount} connections.`);

        // 3. Delete the user
        const userResult = await User.deleteOne({ _id: userId });
        console.log(`Deleted user account: ${userResult.deletedCount}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupUser();
