import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MOCK_CONVERSATIONS = [
  { id: 1, name: "Eze Ezekiel", email: "eze@example.com", lastMessage: "Hi, I need help with my store", unread: 2 },
  { id: 2, name: "Jane Doe", email: "jane@example.com", lastMessage: "When will my theme be ready?", unread: 0 },
];

export default function ManagerCustomerChat() {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "customer", text: "Hi, I need help with my store", time: "10:28 AM" },
    { id: 2, role: "support", text: "Hi! How can we help you today?", time: "10:30 AM" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((m) => [
      ...m,
      {
        id: m.length + 1,
        role: "support",
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessage("");
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
          {MOCK_CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition-colors ${
                selected?.id === c.id ? "bg-emerald-50" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold shrink-0">
                {c.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900 truncate">{c.name}</p>
                <p className="text-sm text-neutral-500 truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat inbox - same UI as user DashboardChat */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                {selected.name[0]}
              </div>
              <div>
                <p className="font-medium text-neutral-900">{selected.name}</p>
                <p className="text-xs text-neutral-500">{selected.email}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "support" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "support"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-neutral-100 text-neutral-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.role === "support" ? "text-emerald-100" : "text-neutral-500"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
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
