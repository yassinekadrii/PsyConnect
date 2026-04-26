let localStream;
let remoteStream;
let screenStream;
let peerConnection;
let currentRoomId = null;

/**
 * @file public/js/webrtc.js
 * @description WebRTC implementation for video calls and real-time signaling via Socket.io.
 */

const socket = io(); // Connect to the server

const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
};

// Initialize call session
async function startCallSession(roomId, currentUserId, options = { video: true, audio: true }) {
    console.log('--- WEBRTC START SESSION ---');
    currentRoomId = roomId;
    console.log('Room ID:', roomId);
    console.log('User ID:', currentUserId);
    console.log('Options:', JSON.stringify(options));
    console.log('Socket Connected:', socket.connected);

    try {
        if (!socket || !socket.connected) {
            console.warn('Socket not connected at call start. Attempting to proceed...');
        }

        // Check for Secure Context
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            const warning = '⚠️ L\'accès à la caméra/micro nécessite une connexion sécurisée (HTTPS). Les appels risquent de ne pas fonctionner.';
            console.error(warning);
            if (window.showNotification) showNotification(warning, 'error');
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Média non supporté ou non autorisé (Vérifiez HTTPS)');
        }

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
        console.log(`Joining Room: ${roomId}`);
        socket.emit('join-room', roomId, currentUserId);

        // Get local stream
        localStream = await navigator.mediaDevices.getUserMedia(options);
        console.log('✅ Local Media Stream Acquired');
        
        if (localVideo && options.video) {
            localVideo.srcObject = localStream;
            localVideo.play().catch(e => console.warn('Autoplay prevented on local video', e));
        }

    } catch (error) {
        console.error('❌ WebRTC Session Error:', error);
        const msg = error.name === 'NotAllowedError' ?
            'Accès média refusé. Veuillez autoriser l\'accès.' :
            `Erreur d'appel: ${error.message || 'Problème de connexion'}`;

        if (window.showNotification) {
            showNotification(msg, 'error');
        } else {
            alert(msg);
        }
        endCallSession(false);
    }
}

// Queue for candidates received before peerConnection is ready
let iceCandidateQueue = [];

function setupSocketListeners(roomId) {
    console.log('--- SETTING UP SIGNALING LISTENERS ---');
    socket.off('user-connected');
    socket.off('offer');
    socket.off('answer');
    socket.off('ice-candidate');
    socket.off('user-disconnected');
    socket.off('hangup');

    socket.on('user-connected', async (userId) => {
        console.log('👤 Peer Joined:', userId);

        // Wait for local stream if not ready
        let attempts = 0;
        while (!localStream && attempts < 10) {
            console.log('...Waiting for local stream...');
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (!localStream) {
            console.error('Local stream still not ready after 5s');
            return;
        }

        createPeerConnection(roomId);

        try {
            console.log('➡️ Creating Offer');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { type: 'offer', sdp: offer, roomId });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    });

    socket.on('offer', async (data) => {
        console.log('⬅️ Received Offer');

        // Wait for local stream if not ready
        let attempts = 0;
        while (!localStream && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (!localStream) {
            console.warn('Received offer but local stream not ready.');
            return;
        }

        if (!peerConnection) createPeerConnection(roomId);

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('answer', { type: 'answer', sdp: answer, roomId: data.roomId });
            console.log('➡️ Sent Answer');

            // Process queued candidates
            processIceQueue();
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    });

    socket.on('answer', async (data) => {
        console.log('⬅️ Received Answer');
        try {
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
                processIceQueue();
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    });

    socket.on('ice-candidate', async (data) => {
        console.log('⬅️ Received ICE Candidate');
        if (peerConnection && peerConnection.remoteDescription) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        } else {
            console.log('...Queuing ICE Candidate (PC/Remote not ready)...');
            iceCandidateQueue.push(data.candidate);
        }
    });

    socket.on('user-disconnected', (userId) => {
        console.log('👤 Peer Disconnected:', userId);
        if (document.getElementById('remoteVideo')) {
            document.getElementById('remoteVideo').srcObject = null;
        }
        // If peer disconnected (socket lost), end the visual session
        endCallSession(false);
    });

    socket.on('hangup', () => {
        console.log('⬅️ Received Hangup Signal');
        endCallSession(false);
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

function endCallSession(manual = true) {
    console.log('--- ENDING CALL SESSION ---');
    if (manual && currentRoomId) {
        console.log('➡️ Sending Hangup Signal for Room:', currentRoomId);
        socket.emit('hangup', { roomId: currentRoomId });
    }

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

    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }

    currentRoomId = null;
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

function processIceQueue() {
    if (!peerConnection || !peerConnection.remoteDescription) return;
    console.log(`Processing ${iceCandidateQueue.length} queued candidates`);
    iceCandidateQueue.forEach(async (candidate) => {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('Error processing queued candidate', e);
        }
    });
    iceCandidateQueue = [];
}
