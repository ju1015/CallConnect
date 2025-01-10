// var socket=io();

// //local , remote

// let local,remote,peerConnection;
// const rtcSettings={
//     iceServers:[{
//         urls:'stun:stun.l.google.com:19302'
//     }]
// }
// const initialize=async ()=>{
//     socket.on('signalingMessage',handleSignalingMessage);
//     local = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true
//     });
//     document.querySelector('#localVideo').srcObject = local;

//     initiateOffer();
// }

// const initiateOffer=async ()=>{
//     await createPeerConnection();
//     const offer=peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);

//     socket.emit('signalingMessage',JSON.stringify({type:'offer',offer}))
// }

// const createPeerConnection= async()=>{
//     peerConnection=new RTCPeerConnection(rtcSettings);

//     let remote=new MediaStream();
//     document.querySelector('#remoteVideo').srcObject=remote;
//     document.querySelector('#remoteVideo').style.display='block';
//     //document.querySelector('localVideo').classList.add('smallFrame');

//     local.getTracks().forEach(track=>{
//         peerConnection.addTrack(track,local)
//     })

//     peerConnection.ontrack=(event)=>event.streams[0].getTracks.forEach((track)=>remote.addTrack(track));

//     peerConnection.onicecandidate=(event)=>{
//         if (event.candidate) {
//             socket.emit('signalingMessage', JSON.stringify({ type: 'candidate', candidate: event.candidate }));
//         }
//     }
// }

// const handleSignalingMessage=async (message)=>{
//     const {type,offer,answer,candidate}=JSON.parse(message);

//     if(type=='offer') handleOffer(offer);
//     if(type=='answer') handleAnswer(answer);
//     if(type=='candidate' && peerConnection){
//         peerConnection.addIceCandidate(candidate);
//     }
// }

// const handleOffer=async(offer)=>{
//     await createPeerConnection();
//     await peerConnection.setRemoteDescription(offer);

//     const answer=await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);

//     socket.emit('signalingMessage',JSON.stringify({type: "answer",answer}));
// }

// const handleAnswer=async (answer)=>{
//     if(!peerConnection.currentRemoteDescription){
//         peerConnection.setRemoteDescription(answer);
//     }
// };

// initialize();

var socket = io();

// Local stream, remote stream, and peer connection
let local, peerConnection;
const rtcSettings = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

// Initialize the connection
const initialize = async () => {
    socket.on('signalingMessage', handleSignalingMessage);

    local = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });

    // Attach the local stream to the local video element
    document.querySelector('#localVideo').srcObject = local;

    initiateOffer();
};

// Create and send an offer
const initiateOffer = async () => {
    await createPeerConnection();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('signalingMessage', JSON.stringify({ type: 'offer', offer }));
};

// Create a peer connection
const createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(rtcSettings);

    const remote = new MediaStream();
    document.querySelector('#remoteVideo').srcObject = remote;
    document.querySelector('#remoteVideo').style.display = 'block';

    // Add local tracks to the peer connection
    local.getTracks().forEach((track) => {
        peerConnection.addTrack(track, local);
    });

    // Handle incoming remote tracks
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
    };

    // Send ICE candidates to the signaling server
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signalingMessage', JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };
};

// Handle incoming signaling messages
const handleSignalingMessage = async (message) => {
    const { type, offer, answer, candidate } = JSON.parse(message);

    if (type === 'offer') handleOffer(offer);
    if (type === 'answer') handleAnswer(answer);
    if (type === 'candidate' && peerConnection) {
        peerConnection.addIceCandidate(candidate);
    }
};

// Handle incoming offer
const handleOffer = async (offer) => {
    await createPeerConnection();
    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('signalingMessage', JSON.stringify({ type: 'answer', answer }));
};

// Handle incoming answer
const handleAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
};

window.addEventListener('beforeunload',()=>socket.disconnect());

initialize();
