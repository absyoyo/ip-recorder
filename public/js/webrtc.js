// public/js/webrtc.js
async function getWebRTCIP() {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate);
      if (!match) return;
      const myIP = match[1];
      pc.onicecandidate = null;
      resolve(myIP);
    };
    // Timeout if no candidate found (e.g. browser blocks WebRTC)
    setTimeout(() => resolve(null), 2000);
  });
}
