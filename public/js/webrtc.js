// public/js/webrtc.js
async function getWebRTCIP() {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = null;
      resolve(myIP);
    };
    // Timeout if no candidate found (e.g. browser blocks WebRTC)
    setTimeout(() => resolve(null), 2000);
  });
}
