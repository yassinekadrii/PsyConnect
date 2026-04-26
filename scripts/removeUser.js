require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const removeUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'yassine.kadri@worldlearningalgeria.org';
        const result = await User.deleteOne({ email });

        if (result.deletedCount > 0) {
            console.log(`Successfully deleted account: ${email}`);
        } else {
            console.log(`Account not found: ${email}`);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error deleting account:', error);
        process.exit(1);
    }
};

removeUser();
