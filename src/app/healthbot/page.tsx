"use client"
import { useState } from "react";

const HealthChat = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [
      { role: "system", content: "You are a health information assistant. Provide detailed responses fpr the queries." },
      ...messages,
      { role: "user", content: input.trim() },
    ];

    setMessages([...messages, { role: "user", content: input.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/health-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data?.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Failed to fetch response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">🩺 Healthify Chat</h1>

      <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm p-2 rounded-md ${msg.role === "user" ? "bg-blue-100 text-right" : "bg-green-100 text-left"}`}>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Ask about symptoms, conditions..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default HealthChat;
