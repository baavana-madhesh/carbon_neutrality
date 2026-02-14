import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API = "http://localhost:5000"; // change later to deployed backend URL

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    { role: "bot", text: "Hi 🌿 Ask me anything about carbon reduction!" },
  ]);
  const [loading, setLoading] = useState(false);

  // ✅ Clear history
  const clearChat = () => {
    if (window.confirm("Clear chat history?")) {
      setChat([{ role: "bot", text: "Hi 🌿 Ask me anything about carbon reduction!" }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const msg = input;
    const newChat = [...chat, { role: "user", text: msg }];
    setChat(newChat);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/bot/chat`, { message: msg });
      setChat([...newChat, { role: "bot", text: res.data.reply }]);
    } catch (e) {
      setChat([...newChat, { role: "bot", text: "Bot not responding ❌ Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} style={styles.fab} title="Chat">
        💬
      </button>

      {/* Popup Window */}
      {open && (
        <div style={styles.window}>
          {/* ✅ Header with Clear + Close */}
          <div style={styles.header}>
            <span>
              <b>AI Chat</b>
            </span>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={clearChat}
                style={styles.clearBtn}
                title="Clear History"
              >
                🗑
              </button>

              <button style={styles.closeBtn} onClick={() => setOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </div>

          <div style={styles.body}>
            {chat.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.role === "user" ? "right" : "left",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(m.role === "user" ? styles.userBubble : styles.botBubble),
                  }}
                >
                  {m.role === "bot" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.bubble, ...styles.botBubble }}>Typing...</div>
            )}
          </div>

          <div style={styles.footer}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} style={styles.sendBtn}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    fontSize: 24,
    cursor: "pointer",
    zIndex: 9999,
  },
  window: {
    position: "fixed",
    bottom: 90,
    right: 20,
    width: 340,
    height: 460,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9999,
    border: "1px solid #eee",
  },
  header: {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f8f9fa",
  },
  clearBtn: {
    border: "none",
    background: "transparent",
    fontSize: 16,
    cursor: "pointer",
    color: "#dc3545",
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 16,
    cursor: "pointer",
  },
  body: {
    flex: 1,
    padding: 12,
    overflowY: "auto",
  },
  bubble: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: 12,
    maxWidth: "85%",
    fontSize: 13,
    border: "1px solid #eee",
    wordBreak: "break-word",
  },
  userBubble: {
    background: "#0d6efd",
    color: "#fff",
    border: "1px solid #0d6efd",
  },
  botBubble: {
    background: "#f3f3f3",
    color: "#111",
  },
  footer: {
    padding: 10,
    borderTop: "1px solid #eee",
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  },
  sendBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    cursor: "pointer",
  },
};
