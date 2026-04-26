const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const User = require('../models/User');

dotenv.config();

const doctors = [
    { firstName: 'Nadia', lastName: 'Benamar', specialty: 'Specializes in trauma and post-colonial identity.', email: 'nadia.benamar@psyconnect.local' },
    { firstName: 'Samir', lastName: 'Khelladi', specialty: 'Expert in cognitive behavioral therapy and urban youth anxiety.', email: 'samir.khelladi@psyconnect.local' },
    { firstName: 'Leïla', lastName: 'Ouyed', specialty: 'Known for her work on grief counseling and family systems.', email: 'leila.ouyed@psyconnect.local' },
    { firstName: 'Hakim', lastName: 'Bouzid', specialty: 'Specializes in neuropsychology and addiction recovery.', email: 'hakim.bouzid@psyconnect.local' },
    { firstName: 'Amira', lastName: 'Guessoum', specialty: 'Focuses on child psychology and educational development.', email: 'amira.guessoum@psyconnect.local' },
    { firstName: 'Reda', lastName: 'Chaouchi', specialty: 'Expert in organizational psychology and workplace stress.', email: 'reda.chaouchi@psyconnect.local' },
    { firstName: 'Fatima Zohra', lastName: 'Lounis', specialty: 'Specializes in couples therapy and social adaptation.', email: 'fatima.lounis@psyconnect.local' },
    { firstName: 'Karim', lastName: 'Mebarki', specialty: 'Known for his research on migration and cultural dislocation.', email: 'karim.mebarki@psyconnect.local' },
    { firstName: 'Sonia', lastName: 'Ghazi', specialty: 'Expert in eating disorders and body image in the Maghreb context.', email: 'sonia.ghazi@psyconnect.local' }
];

const patients = Array.from({ length: 5 }, (_, i) => ({
    firstName: 'Patient', lastName: `${i + 1}`, email: `patient${i + 1}@psyconnect.local`
}));

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        let outputText = "PsyConnect Accounts\n===================\n\n";

        // Create Admin
        const admin = new User({
            firstName: 'Admin', lastName: 'PsyConnect', email: 'admin', phone: '+33 6 00 00 00 00',
            password: 'hello', role: 'admin', isSuperAdmin: true, isVerified: true
        });
        await admin.save();
        outputText += `[ADMIN]\nEmail: admin\nPassword: hello\n\n`;

        // Create Doctors
        outputText += `[DOCTORS]\n`;
        for (const doc of doctors) {
            const newDoc = new User({
                firstName: doc.firstName, lastName: doc.lastName, email: doc.email, phone: '+213 5 ' + Math.floor(10000000 + Math.random() * 90000000),
                password: 'password123', role: 'doctor', isVerified: true, specialty: doc.specialty, bio: doc.specialty
            });
            await newDoc.save();
            outputText += `Name: Dr. ${doc.firstName} ${doc.lastName}\nEmail: ${doc.email}\nPassword: password123\nSpecialty: ${doc.specialty}\n\n`;
        }

        // Create Patients
        outputText += `[PATIENTS]\n`;
        for (const pat of patients) {
            const newPat = new User({
                firstName: pat.firstName, lastName: pat.lastName, email: pat.email, phone: '+213 7 ' + Math.floor(10000000 + Math.random() * 90000000),
                password: 'password123', role: 'patient', isVerified: true
            });
            await newPat.save();
            outputText += `Name: ${pat.firstName} ${pat.lastName}\nEmail: ${pat.email}\nPassword: password123\n\n`;
        }

        fs.writeFileSync('accounts.txt', outputText);
        console.log('📝 Created accounts and saved to accounts.txt');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
