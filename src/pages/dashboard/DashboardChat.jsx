import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Send, Paperclip, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatMessages, sendChatMessage } from "@/lib/authApi";
import { format } from "date-fns";

export default function DashboardChat() {
  const { user } = useOutletContext() || {};
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getChatMessages();
      setMessages(data || []);
    } catch (e) {
      console.error("Failed to load messages:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const messageText = message.trim();
    setMessage("");
    try {
      const newMsg = await sendChatMessage(messageText);
      setMessages((m) => [...m, newMsg]);
    } catch (e) {
      console.error("Failed to send message:", e);
      alert("Failed to send message: " + (e.message || "Unknown error"));
      setMessage(messageText); // Restore message on error
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const f of Array.from(files)) {
      setMessages((m) => [
        ...m,
        { id: m.length + 1, role: "user", attachment: f.name, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900" style={{ fontFamily: "Space Grotesk" }}>
          Messages
        </h1>
        <p className="text-neutral-600 text-sm mt-1">Chat with our team. Upload files, images, or documents.</p>
      </div>

      <div className="flex-1 rounded-2xl border border-neutral-200 bg-white flex flex-col overflow-hidden shadow-sm">
        {/* Chat header - Instagram style */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
            {user?.name?.[0] || "E"}
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-900">Elursh Support</p>
            <p className="text-xs text-neutral-500">Typically replies within a few hours</p>
          </div>
        </div>

        {/* Messages - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-500">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isCustomer = msg.sender_role === "customer";
              const time = msg.created_at ? format(new Date(msg.created_at), "h:mm a") : "";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isCustomer
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-neutral-100 text-neutral-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.message_text}</p>
                    <p className={`text-xs mt-1 ${isCustomer ? "text-emerald-100" : "text-neutral-500"}`}>
                      {time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area - Instagram style with attachment */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-neutral-500 hover:text-neutral-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Message..."
              className="flex-1 rounded-full bg-white border-neutral-200"
            />
            <Button
              size="icon"
              className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700"
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
