"use client";
import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { Send, Trash2 } from "lucide-react"; 

const WS_URL = "wss://krasirit1234-my-rag-chatbot.hf.space/chat";

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typedText, setTypedText] = useState("");

  const fullText = "่just job เรื่อง jib jib"; 

  const { sendMessage, lastMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true,
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
    onError: () => setIsConnected(false),
  });

  useEffect(() => {
    if (!isConnected) {
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => msg.text !== "กำลังพิมพ์...");
        return [...newMessages, { text: "เชื่อมต่อ backend ไม่ได้ คุงเปิดเซิฟด้วยจ้าาา", sender: "bot" as const }];
      });
      setIsTyping(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (lastMessage !== null) {
      setTimeout(() => {
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.text !== "กำลังพิมพ์...");
          return [...newMessages, { text: lastMessage.data, sender: "bot" as const }];
        });
        setIsTyping(false);
      }, 1500);
    }
  }, [lastMessage]);

  // พิมพ์ข้อความทีละตัว
  useEffect(() => {
    let index = 0;
    setTypedText(""); 
  
    const typeText = () => {
      if (index < fullText.length) {
        setTypedText(fullText.substring(0, index + 1));
        index++;
        setTimeout(typeText, 100);
      } else {
        setTimeout(() => setLoading(false), 500);
      }
    };
  
    typeText();
  }, []);
  

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);
    setMessages((prev) => [...prev, { text: "กำลังพิมพ์...", sender: "bot" as const }]);

    sendMessage(input);
    setInput("");
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <h1 className="text-5xl font-bold text-blue-600">BOSSBOT!</h1>
        <p className="text-xl mt-2 text-gray-700">{typedText || "..."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white text-center p-4 text-2xl font-bold shadow-md">
        B O S S B O T ! - <span className="text-lg">just job เรื่อง jib jib</span>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-center ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && (
              <div className="mr-2">
                <img src="/robot.png" alt="Bot Icon" className="w-8 h-8" />
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-2xl text-black border ${
                msg.sender === "user" ? "bg-blue-500 text-white" : "bg-white border-gray-400"
              } shadow-md`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white flex items-center border-t shadow-md space-x-3">
        {/* ล้างแชท */}
        <button
          className="bg-red-600 text-white p-3 rounded-full shadow-md hover:bg-red-700"
          onClick={handleClearChat}
        >
          <Trash2 size={24} />
        </button>

        <input
          type="text"
          className="flex-1 border rounded-full p-3 text-black focus:outline-none shadow-sm px-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความ..."
        />

        {/* ส่งข้อความ */}
        <button
          className="bg-green-500 text-white p-3 rounded-full shadow-md hover:bg-green-600"
          onClick={handleSendMessage}
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
}
