const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const updateNadia = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Sample Base64 PDF (very small placeholder)
        const sampleBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJ9fX19IKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFszIDAgUl0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA1MAo+PgpzdHJlYW0KQlQKIF9GMSAxMiBUZgogNzIgNzIwIFRkCiAoRHIuIE5hZGlhIEJlbmFtYXIgLSBQcm9mZXNzaW9uYWwgQ1YpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjMxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzMxCiUlRU9G';

        const certificationBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJ9fX19IKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFszIDAgUl0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA2MAo+PgpzdHJlYW0KQlQKIF9GMSAxMiBUZgogNzIgNzIwIFRkCiAoRHIuIE5hZGlhIEJlbmFtYXIgLSBEaXBsb21lIGRlIFBzeWNob2xvZ2llKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDIzMSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjM0MQolJUVPRg==';

        const result = await User.findOneAndUpdate(
            { email: 'nadia.benamar@psyconnect.local' },
            { 
                cv: sampleBase64,
                certification: certificationBase64,
                profilePicture: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?w=400&h=400&fit=crop' // Adding a nice profile picture too
            },
            { new: true }
        );

        if (result) {
            console.log('✅ Updated Dr. Nadia Benamar\'s profile with CV and certification.');
            process.exit(0);
        } else {
            console.log('❌ Dr. Nadia Benamar not found.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error updating Nadia\'s profile:', error);
        process.exit(1);
    }
};

updateNadia();
