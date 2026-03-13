let localStream;
let remoteStream;
let screenStream;
let peerConnection;
/**
 * @file public/js/webrtc.js
 * @description WebRTC implementation for video calls and real-time signaling via Socket.io.
 */

const socket = io(); // Connect to the server

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// Initialize call session
async function startCallSession(roomId, currentUserId, options = { video: true, audio: true }) {
    try {
        // Show video modal
        const modal = document.getElementById('videoModal');
        if (modal) modal.style.display = 'flex';

        // Update UI based on type
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const audioPlaceholder = document.getElementById('audioPlaceholder');

        if (!options.video) {
            if (localVideo) localVideo.style.display = 'none';
            if (remoteVideo) remoteVideo.style.display = 'none';
            if (audioPlaceholder) audioPlaceholder.style.display = 'flex';
        } else {
            if (localVideo) localVideo.style.display = 'block';
            if (remoteVideo) remoteVideo.style.display = 'block';
            if (audioPlaceholder) audioPlaceholder.style.display = 'none';
        }

        // Setup socket listeners FIRST to avoid missing incoming offers/candidates
        setupSocketListeners(roomId);

        // Join room immediately so we are ready for offers
        console.log(`Joining room: ${roomId} as user: ${currentUserId}`);
        socket.emit('join-room', roomId, currentUserId);

        // Get local stream
        localStream = await navigator.mediaDevices.getUserMedia(options);
        if (localVideo && options.video) localVideo.srcObject = localStream;

    } catch (error) {
        console.error('Error starting call:', error);
        const msg = error.name === 'NotAllowedError' ?
            'Accès média refusé. Veuillez autoriser l\'accès.' :
            'Impossible d\'accéder à la caméra ou au microphone.';

        if (window.showNotification) {
            showNotification(msg, 'error');
        } else {
            alert(msg);
        }
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

        // Wait for local stream if not ready
        let attempts = 0;
        while (!localStream && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (!localStream) {
            console.error('Local stream still not ready after 5s');
            return;
        }

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

        // Wait for local stream if not ready
        let attempts = 0;
        while (!localStream && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (!localStream) {
            console.warn('Received offer but local stream not ready. Joining room might be needed?');
            // If they received an offer, they must have clicked the button or have a listener.
            return;
        }

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
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    });
    // ... rest of the handlers ...

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
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }
}

async function toggleScreenShare() {
    try {
        if (!screenStream) {
            // Start sharing
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            // Revert back when screen sharing ends (e.g., via browser stop button)
            screenTrack.onended = () => {
                stopScreenShare();
            };

            replaceVideoTrack(screenTrack);
            return true; // Sharing started
        } else {
            // Stop sharing
            stopScreenShare();
            return false; // Sharing stopped
        }
    } catch (error) {
        console.error('Error toggling screen share:', error);
        return null;
    }
}

function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        replaceVideoTrack(videoTrack);
    }
}

function replaceVideoTrack(newTrack) {
    if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(newTrack);
        }
    }
    // Update local preview
    const localVideo = document.getElementById('localVideo');
    if (localVideo && localStream) {
        const tracks = [newTrack, ...localStream.getAudioTracks()];
        localVideo.srcObject = new MediaStream(tracks);
    }
}
