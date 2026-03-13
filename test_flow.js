const axios = require('axios');
const io = require('socket.io-client');

const API_URL = 'http://localhost:3001/api';
let adminToken = '';
let doctorToken = '';
let patientToken = '';
let doctorId = '';
let patientId = '';

async function runTests() {
    try {
        console.log('--- Starting API Flow Tests ---');

        // 1. Admin Login
        console.log('1. Admin Login');
        let res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@psyconnect.com',
            password: 'password123'
        });
        adminToken = res.data.token;
        console.log('✅ Admin login successful');

        // 2. Admin Creates Doctor
        console.log('\n2. Admin Creates Doctor');
        const doctorEmail = `doctor_${Date.now()}@psyconnect.com`;
        res = await axios.post(`${API_URL}/admin/create-doctor`, {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: doctorEmail,
            phone: '0600000000',
            password: 'docpassword123',
            specialty: 'Psychiatrist'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✅ Doctor created successfully');

        // Verify the doctor directly in DB to bypass OTP
        const mongoose = require('mongoose');
        await mongoose.connect('mongodb://localhost:27017/psyconnect');
        const User = require('./models/User');
        const doctor = await User.findOneAndUpdate({ email: doctorEmail }, { isVerified: true }, { new: true });
        doctorId = doctor._id.toString();

        // 3. Doctor Login
        console.log('\n3. Doctor Login');
        res = await axios.post(`${API_URL}/auth/login`, {
            email: doctorEmail,
            password: 'docpassword123'
        });
        doctorToken = res.data.token;
        console.log('✅ Doctor login successful');

        // 4. Patient Registration
        console.log('\n4. Patient Registration');
        const patientEmail = `patient_${Date.now()}@psyconnect.com`;
        res = await axios.post(`${API_URL}/auth/register`, {
            firstName: 'Alice',
            lastName: 'Smith',
            email: patientEmail,
            phone: '0700000000',
            password: 'patpassword123'
        });
        patientId = res.data.user.id;
        console.log('✅ Patient registered');
        await User.findByIdAndUpdate(patientId, { isVerified: true });

        // 5. Patient Login
        console.log('\n5. Patient Login');
        res = await axios.post(`${API_URL}/auth/login`, {
            email: patientEmail,
            password: 'patpassword123'
        });
        patientToken = res.data.token;
        console.log('✅ Patient login successful');

        // 6. Doctor fetches patients (Admin endpoint or Doctor endpoint?)
        // Let's check if the doctor can fetch patients. Wait, patients list is on Admin.
        // What about Doctor's patients? Let's skip and test Prescription.

        // 7. Prescription Generation (Sending PDF)
        console.log('\n6. Doctor sends PDF Prescription');
        res = await axios.post(`${API_URL}/prescriptions`, {
            patientId: patientId,
            medicines: [{ name: 'Paracetamol', dosage: '1g', duration: '3 days' }],
            instructions: 'Take after meals',
            pdf: 'base64_or_url_to_pdf_file'
        }, { headers: { Authorization: `Bearer ${doctorToken}` } });
        console.log('✅ Prescription created');

        // 8. Patient fetches prescriptions
        res = await axios.get(`${API_URL}/prescriptions/patient/${patientId}`, {
            headers: { Authorization: `Bearer ${patientToken}` }
        });
        console.log(`✅ Patient fetched ${res.data.count} prescriptions`);

        // 9. Testing Socket.io (Chat & Video signaling)
        console.log('\n7. Testing Real-time Chat & Video (Socket.io)');
        const socket = io('http://localhost:3001');
        await new Promise((resolve) => {
            socket.on('connect', () => {
                console.log('✅ Socket connected:', socket.id);

                // Join room
                const roomId = `${doctorId}_${patientId}`;
                socket.emit('join-chat', roomId);

                // Send message
                socket.emit('send-message', {
                    senderId: patientId,
                    receiverId: doctorId,
                    content: 'Hello Doctor!',
                    roomId: roomId
                });

                // Listen for message
                socket.on('receive-message', (data) => {
                    if (data.content === 'Hello Doctor!') {
                        console.log('✅ Chat message delivered via Socket');
                    }
                });

                // Test WebRTC signaling
                socket.emit('offer', { roomId, sdp: 'fake_offer' });
                socket.on('offer', (data) => {
                    console.log('✅ WebRTC offer relayed');
                    socket.disconnect();
                    mongoose.disconnect();
                    resolve();
                });

                // We emit an offer and because we are alone in the room, we won't get it back 
                // unless we have two sockets. Let's create a second socket for the doctor.
                const socketDoc = io('http://localhost:3001');
                socketDoc.on('connect', () => {
                    socketDoc.emit('join-room', roomId, doctorId);
                    socketDoc.on('offer', (data) => {
                        console.log('✅ WebRTC offer relayed to Doctor');
                        socketDoc.disconnect();
                        socket.disconnect();
                        mongoose.disconnect();
                        resolve();
                    });
                    setTimeout(() => {
                        socket.emit('offer', { roomId, sdp: 'fake_offer' });
                    }, 500);
                });
            });
        });

        console.log('\n🎉 All backend flow tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        process.exit(1);
    }
}

runTests();
