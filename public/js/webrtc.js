let localStream;
let remoteStream;
let peerConnection;
const socket = io(); // Connect to the server

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Initialize video call
async function startVideoCallSession(roomId, currentUserId) {
    try {
        // Show video modal
        const modal = document.getElementById('videoModal');
        if (modal) modal.style.display = 'flex';

        // Get local stream
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const localVideo = document.getElementById('localVideo');
        if (localVideo) localVideo.srcObject = localStream;

        // Join room
        console.log(`Joining room: ${roomId} as user: ${currentUserId}`);
        socket.emit('join-room', roomId, currentUserId);

        // Setup socket listeners
        setupSocketListeners(roomId);

    } catch (error) {
        console.error('Error starting video call:', error);
        alert('Impossible d\'accéder à la caméra ou au microphone.');
        endCallSession();
    }
}

function setupSocketListeners(roomId) {
    socket.off('user-connected');
    socket.off('offer');
    socket.off('answer');
    socket.off('ice-candidate');
    socket.off('user-disconnected');

    socket.on('user-connected', async (userId) => {
        console.log('User connected:', userId);
        createPeerConnection(roomId);

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { type: 'offer', sdp: offer, roomId });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    });

    socket.on('offer', async (data) => {
        console.log('Received offer');
        if (!peerConnection) createPeerConnection(roomId);

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', { type: 'answer', sdp: answer, roomId: data.roomId });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    });

    socket.on('answer', async (data) => {
        console.log('Received answer');
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    });

    socket.on('ice-candidate', async (data) => {
        try {
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    });

    socket.on('user-disconnected', (userId) => {
        console.log('User disconnected:', userId);
        if (document.getElementById('remoteVideo')) {
            document.getElementById('remoteVideo').srcObject = null;
        }
        // Optional: End call if peer disconnects?
        // endCallSession();
    });
}

function createPeerConnection(roomId) {
    if (peerConnection) return;

    peerConnection = new RTCPeerConnection(rtcConfig);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', { candidate: event.candidate, roomId });
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('Received remote track');
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) remoteVideo.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
}

function endCallSession() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    const modal = document.getElementById('videoModal');
    if (modal) modal.style.display = 'none';

    // Reload page or reset specific UI elements if needed
    // window.location.reload(); 
}
