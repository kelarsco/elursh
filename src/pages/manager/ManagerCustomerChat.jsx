import { useState, useEffect, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatConversations, getChatMessages, sendChatMessage, markChatMessagesRead } from "@/lib/managerApi";
import { format } from "date-fns";

export default function ManagerCustomerChat() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const data = await getChatConversations();
      setConversations(data || []);
      // Auto-select first conversation if none selected
      if (!selected && data && data.length > 0) {
        setSelected(data[0]);
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (customerUserId) => {
    if (!customerUserId) return;
    try {
      const data = await getChatMessages(customerUserId);
      setMessages(data || []);
      // Mark messages as read
      await markChatMessagesRead(customerUserId).catch(() => {});
      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      console.error("Failed to load messages:", e);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadConversations();
    // Poll for new conversations every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected?.customer_user_id) {
      loadMessages(selected.customer_user_id);
      // Poll for new messages every 3 seconds when conversation is selected
      const interval = setInterval(() => loadMessages(selected.customer_user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selected?.customer_user_id]);

  const sendMessage = async () => {
    if (!message.trim() || !selected?.customer_user_id) return;
    const messageText = message.trim();
    setMessage("");
    try {
      const newMsg = await sendChatMessage(selected.customer_user_id, messageText);
      setMessages((m) => [...m, newMsg]);
      // Reload conversations to update last message
      loadConversations();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      console.error("Failed to send message:", e);
      alert("Failed to send message: " + (e.message || "Unknown error"));
      setMessage(messageText); // Restore message on error
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Left: conversation list - Instagram DM style */}
      <div className="w-72 border-r border-neutral-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-lg font-semibold text-neutral-900">Customer Chat</h1>
          <p className="text-sm text-neutral-500">Select a conversation to reply</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">No conversations yet</div>
          ) : (
            conversations.map((c) => {
              const displayName = c.name || c.email?.split("@")[0] || "Customer";
              const initial = displayName[0].toUpperCase();
              return (
                <button
                  key={c.customer_user_id}
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition-colors ${
                    selected?.customer_user_id === c.customer_user_id ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 truncate">{displayName}</p>
                    <p className="text-sm text-neutral-500 truncate">{c.last_message || "No messages"}</p>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: chat inbox - same UI as user DashboardChat */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                {(selected.name || selected.email?.split("@")[0] || "C")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-neutral-900">{selected.name || selected.email?.split("@")[0] || "Customer"}</p>
                <p className="text-xs text-neutral-500">{selected.email}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isManager = msg.sender_role === "manager";
                  const time = msg.created_at ? format(new Date(msg.created_at), "h:mm a") : "";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isManager ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isManager
                            ? "bg-emerald-600 text-white rounded-br-md"
                            : "bg-neutral-100 text-neutral-900 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{msg.message_text}</p>
                        <p className={`text-xs mt-1 ${isManager ? "text-emerald-100" : "text-neutral-500"}`}>
                          {time}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 text-neutral-500">
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
