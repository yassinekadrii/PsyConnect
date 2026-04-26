const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock Data
const mockDoctors = [
    { id: 'doc1', firstName: 'Jean', lastName: 'Dupont', specialty: 'Psychologue Clinicien', location: 'Paris', bio: 'Expert en thérapie cognitive.', profilePicture: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=random' },
    { id: 'doc2', firstName: 'Marie', lastName: 'Curie', specialty: 'Neuropsychologue', location: 'Lyon', bio: 'Spécialiste des troubles de la mémoire.', profilePicture: 'https://ui-avatars.com/api/?name=Marie+Curie&background=random' }
];

const mockPatient = { id: 'pat1', firstName: 'Demo', lastName: 'Patient', email: 'patient@example.com', role: 'patient', profilePicture: 'https://ui-avatars.com/api/?name=Demo+Patient&background=random' };
const mockDoctor = { id: 'doc1', firstName: 'Jean', lastName: 'Dupont', specialty: 'Psychologue Clinicien', role: 'doctor', profilePicture: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=random' };

const mockConversations = [
    { 
        id: 'conv1', 
        otherUser: mockPatient, 
        lastMessage: { content: 'Bonjour Docteur, j\'ai une question.', createdAt: new Date() },
        unreadCount: 0
    }
];

// Mock API
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    if (email.includes('doctor')) {
        res.json({ success: true, token: 'doc-token', user: mockDoctor });
    } else {
        res.json({ success: true, token: 'pat-token', user: mockPatient });
    }
});

app.get('/api/auth/me', (req, res) => {
    const auth = req.headers.authorization;
    if (auth && auth.includes('doc')) res.json({ success: true, user: mockDoctor });
    else res.json({ success: true, user: mockPatient });
});

app.get('/api/user/doctors', (req, res) => res.json({ success: true, doctors: mockDoctors }));
app.get('/api/patient/doctors', (req, res) => res.json({ success: true, doctors: mockDoctors }));

// Messaging
app.get('/api/messages/conversations', (req, res) => res.json({ success: true, conversations: mockConversations }));
app.get('/api/messages/:id', (req, res) => res.json({ success: true, messages: [
    { sender: 'pat1', receiver: 'doc1', content: 'Bonjour Docteur, j\'ai une question.', createdAt: new Date() }
]}));
app.post('/api/messages', (req, res) => res.json({ success: true, message: { ...req.body, createdAt: new Date() } }));

// Prescriptions
app.post('/api/prescriptions', (req, res) => res.json({ success: true, message: 'Prescription enregistrée' }));
app.get('/api/prescriptions', (req, res) => res.json({ success: true, prescriptions: [] }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Doctor Demo Debug Server' }));

const PORT = 3008;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Doctor Demo Debug Server started on port ${PORT}`);
});
