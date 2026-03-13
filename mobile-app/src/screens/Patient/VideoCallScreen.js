import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCView, mediaDevices } from 'react-native-webrtc';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideoCallScreen({ route, navigation }) {
    const { roomId, receiverId, isVideo = true, isIncoming = false } = route.params;
    const { user } = useAuth();

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [cachedLocalPC, setCachedLocalPC] = useState(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(!isVideo);
    const [callStatus, setCallStatus] = useState(isIncoming ? 'Connecting...' : 'Calling...');

    const socket = useRef(null);

    useEffect(() => {
        socket.current = io(SOCKET_URL);

        socket.current.on('connect', () => {
            console.log('VideoCall Socket Connected:', socket.current.id);
            socket.current.emit('join-room', roomId, user.id);
            if (!isIncoming) {
                socket.current.emit('start-call', { roomId });
            }
        });

        startLocalStream();

        return () => {
            // Cleanup on unmount
            if (cachedLocalPC) {
                cachedLocalPC.close();
            }
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    const startLocalStream = async () => {
        const isFront = true;
        const devices = await mediaDevices.enumerateDevices();

        const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === (isFront ? 'front' : 'environment'))?.deviceId;
        const facingMode = isFront ? 'user' : 'environment';

        try {
            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: isVideo ? {
                    mandatory: {
                        minWidth: 500,
                        minHeight: 300,
                        minFrameRate: 30,
                    },
                    facingMode,
                    optional: (videoSourceId ? [{ sourceId: videoSourceId }] : []),
                } : false,
            });
            setLocalStream(stream);

            if (!isIncoming) {
                setupCallerListeners(stream);
            } else {
                setupReceiverListeners(stream);
            }
        } catch (e) {
            console.error('Error opening camera:', e);
            setCallStatus('Error opening camera/mic');
        }
    };

    const setupCallerListeners = (stream) => {
        socket.current.on('user-connected', async (userId) => {
            console.log('User connected, sending offer...');
            setCallStatus('Ringing...');

            const pc = new RTCPeerConnection(configuration);
            setCachedLocalPC(pc);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate) socket.current.emit('ice-candidate', { roomId, candidate: e.candidate });
            };

            pc.ontrack = (e) => {
                if (e.streams && e.streams[0]) {
                    setRemoteStream(e.streams[0]);
                    setCallStatus('Connected');
                }
            };

            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.current.emit('offer', { type: 'offer', sdp: pc.localDescription, roomId });
            } catch (err) {
                console.error('Error creating offer', err);
            }

            setupSocketListeners(pc);
        });

        // In case the receiver was already in the room, they won't trigger user-connected natively.
        // We wait a few seconds, if nothing happens, maybe send fallback offer?
        // WebRTC standard flow relies on user-connected in this app.
    };

    const setupReceiverListeners = (stream) => {
        socket.current.on('offer', async (data) => {
            console.log('Received offer, creating answer...');

            const pc = new RTCPeerConnection(configuration);
            setCachedLocalPC(pc);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (e) => {
                if (e.candidate) socket.current.emit('ice-candidate', { roomId, candidate: e.candidate });
            };

            pc.ontrack = (e) => {
                if (e.streams && e.streams[0]) {
                    setRemoteStream(e.streams[0]);
                    setCallStatus('Connected');
                }
            };

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.current.emit('answer', { type: 'answer', sdp: pc.localDescription, roomId });
            } catch (err) {
                console.error('Error answering call', err);
            }

            setupSocketListeners(pc);
        });
    };

    // setupCallerListeners and setupReceiverListeners implement the correct handlers

    const setupSocketListeners = (pc) => {
        socket.current.on('answer', async (data) => {
            try {
                if (data.sdp && pc.signalingState !== 'stable') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                }
            } catch (err) {
                console.error('Error setting remote desc', err);
            }
        });

        socket.current.on('ice-candidate', async (data) => {
            try {
                if (data.candidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (err) {
                console.error('Error adding ICE candidate', err);
            }
        });

        socket.current.on('end-call', () => {
            endCall(false);
        });
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (localStream && isVideo) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOff(!isCameraOff);
        }
    };

    const endCall = (emitEvent = true) => {
        if (emitEvent && socket.current) {
            socket.current.emit('end-call', roomId);
        }
        if (cachedLocalPC) cachedLocalPC.close();
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Remote Video (Full Screen) */}
            {remoteStream ? (
                <RTCView
                    streamURL={remoteStream.toURL()}
                    style={styles.remoteVideo}
                    objectFit="cover"
                />
            ) : (
                <View style={styles.remotePlaceholder}>
                    <Ionicons name="person" size={100} color="#fff" style={{ opacity: 0.3 }} />
                    <Text style={styles.statusText}>{callStatus}</Text>
                </View>
            )}

            {/* Local Video (Overlay) */}
            {localStream && isVideo && !isCameraOff && (
                <RTCView
                    streamURL={localStream.toURL()}
                    style={styles.localVideo}
                    objectFit="cover"
                />
            )}

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={[styles.controlBtn, isMuted && styles.controlBtnActive]} onPress={toggleMute}>
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color="white" />
                </TouchableOpacity>

                {isVideo && (
                    <TouchableOpacity style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]} onPress={toggleCamera}>
                        <Ionicons name={isCameraOff ? "videocam-off" : "videocam"} size={28} color="white" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={() => endCall(true)}>
                    <Ionicons name="call" size={28} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: '#000',
    },
    remotePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
    },
    statusText: {
        color: 'white',
        fontSize: 18,
        marginTop: 20,
        fontFamily: 'Inter_500Medium',
    },
    acceptButton: {
        backgroundColor: '#10b981',
        padding: 20,
        borderRadius: 40,
        marginTop: 40,
    },
    localVideo: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 100,
        height: 150,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#333',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        paddingHorizontal: 20,
    },
    controlBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    },
    controlBtnActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    endCallBtn: {
        backgroundColor: '#ef4444',
    }
});
