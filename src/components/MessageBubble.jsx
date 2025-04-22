import React, { useState } from "react";

const MessageBubble = ({ text, sender }) => {
  const isUser = sender === "user";
  const [speech, setSpeech] = useState(null); // Track the speech instance
  const [isSpeaking, setIsSpeaking] = useState(false); // Track whether speech is playing

  // Handle the speech functionality
  const handleSpeech = () => {
    const newSpeech = new SpeechSynthesisUtterance(text);
    newSpeech.rate = 1;  // Adjust the rate of speech (1 is normal speed)
    newSpeech.pitch = 1; // Adjust the pitch (1 is normal pitch)
    newSpeech.volume = 1; // Adjust volume (1 is max volume)

    // Set the current speech instance to the state
    setSpeech(newSpeech);
    setIsSpeaking(true); // Mark as speaking

    window.speechSynthesis.speak(newSpeech);

    // Listen for when the speech ends to reset the state
    newSpeech.onend = () => {
      setIsSpeaking(false); // Reset the speaking state when done
    };
  };

  // Handle stopping the speech
  const handleStop = () => {
    if (speech) {
      window.speechSynthesis.cancel(); // Stop the current speech
      setIsSpeaking(false); // Reset the speaking state
    }
  };

  return (
    <div className="message-bubble">
      <div className={`${sender === "user" ? "user-message" : "bot-message"}`}>
        {/* Render the message content with HTML formatting (line breaks, etc.) */}
        <div
          className="message-text"
          dangerouslySetInnerHTML={{ __html: text }} // Use dangerouslySetInnerHTML to render HTML content
        />
        {/* Add speaker or stop button depending on speaking state */}
      </div>
              {sender === "bot" && (
          <div className="speech-controls">
            {!isSpeaking ? (
              <button onClick={handleSpeech} className="speech-button">
                🕫 {/* Play button */}
              </button>
            ) : (
              <button onClick={handleStop} className="stop-button">
                ⏹ {/* Stop button */}
              </button>
            )}
          </div>
        )}
    </div>
  );
};

export default MessageBubble;
