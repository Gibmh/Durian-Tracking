import React from 'react';

function ChatBot() {
  return (
    <div>
      <iframe
        src="http://38.242.250.193:8080/chatbot/z7RBE47FbvWwY3JO"
        style={{ width: '83.5vw', height: '87vh',right:"15px", minHeight: '700px',position: "relative", zIndex: "10", float: "right", top: "15px", borderRadius: "8px" }}
        frameborder="0"
        allow="microphone"
        title="Chat Bot" 
      ></iframe>
    </div>
  );
}

export default ChatBot;
