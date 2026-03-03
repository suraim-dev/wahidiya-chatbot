import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // simple user id (can replace later with auth user id)
  const userId = "user_" + localStorage.getItem("chat_user") || crypto.randomUUID();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("chat_user")) {
      localStorage.setItem("chat_user", crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: input,
          userId: localStorage.getItem("chat_user")
        })
      });

      const data = await res.json();

      const botMessage: Message = {
        role: "assistant",
        content: data.reply
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                msg.role === "user" ? "#2c7a7b" : "#edf2f7",
              color: msg.role === "user" ? "white" : "black"
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.message, backgroundColor: "#edf2f7" }}>
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Islamic books, orders, library..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "10px",
    height: "600px",
    overflow: "hidden"
  },
  chatBox: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#f7fafc"
  },
  message: {
    padding: "10px 15px",
    borderRadius: "15px",
    maxWidth: "75%",
    whiteSpace: "pre-wrap"
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1,
    padding: "12px",
    border: "none",
    outline: "none"
  },
  button: {
    padding: "12px 20px",
    border: "none",
    backgroundColor: "#2c7a7b",
    color: "white",
    cursor: "pointer"
  }
};