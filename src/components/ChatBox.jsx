import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageBubble from "./MessageBubble";

// Initialize the socket connection
const socket = io("https://flaskbackenddogapp-production.up.railway.app");


const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(Date.now().toString());
  const [currentResponse, setCurrentResponse] = useState(""); // Tracks current bot response
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Log when connected to socket server
    socket.on("connect", () => {
      console.log("Connected to socket server!");
    });

    // Handle bot's response and append it to the current response
    socket.on("bot_response", (data) => {
      console.log("Received bot response:", data.response); // Log the response
      setCurrentResponse((prev) => prev + data.response); // Append the bot's response
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Cleanup socket listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("bot_response");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (currentResponse) {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];

        if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].sender === "bot") {
          updatedMessages[updatedMessages.length - 1].text = currentResponse; // Update last message in place
        }
        return updatedMessages;
      });
      scrollToBottom();
    }
  }, [currentResponse]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { sender: "user", text: input }]);
    setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "" }]); // Empty placeholder for bot response

    setCurrentResponse(""); // Clear previous response before streaming starts
    socket.emit("user_message", { session_id: sessionId, message: input });

    setInput("");
  };

  const generateSummary = async () => {
    // Ask for user's email
    const email = prompt("Please enter your email to receive the summary:");

    if (!email) {
      alert("Email is required to send the summary.");
      return;
    }

    try {
      // Send email and session ID to the backend to generate and email the summary
      const response = await axios.post("https://flaskbackenddogapp-production.up.railway.app/generate_summary", {
        session_id: sessionId,
        email: email,
      });

      alert("Summary has been sent to your email!");
    } catch (error) {
      console.error("Error generating and sending the summary:", error);
    }
  };

  const downloadChat = async () => {
    try {
      const response = await axios.post("https://flaskbackenddogapp-production.up.railway.app/download_chat", { session_id: sessionId }, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `chat_session_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading chat:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Krypto..."
        />
        <button onClick={sendMessage}>➔</button>
      </div>
      <div className="buttons">
        <button onClick={generateSummary}>Generate Summary</button>
        <button onClick={downloadChat}>Download Chat</button>
      </div>
    </div>
  );
};

export default ChatBox;
