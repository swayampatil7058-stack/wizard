import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

const demoReplies = [
  {
    keywords: ["map", "location", "island"],
    reply:
      "🗺️ Map concept: Shadowfall Island! Add an abandoned city, a glowing forest, hidden tunnels, and a volcanic zone. These are ideas for WIZARD, not confirmed game features.",
  },
  {
    keywords: ["weapon", "gun", "loadout"],
    reply:
      "⚔️ Loadout idea: Let players choose a balanced combination of a close-range weapon, a long-range weapon, and healing supplies.",
  },
  {
    keywords: ["team", "squad", "friend"],
    reply:
      "🤝 Squad tip: Communicate enemy locations, share supplies, and plan your safe-zone moves together.",
  },
  {
    keywords: ["survive", "win", "strategy", "battle"],
    reply:
      "🎯 Battle strategy: Track the safe zone, use cover, avoid unnecessary fights, and plan your rotations early!",
  },
  {
    keywords: ["character", "hero", "wizard"],
    reply:
      "🧙 Character idea: Create a scout who can briefly reveal nearby points of interest, balanced by a cooldown. This is a possible WIZARD game concept.",
  },
];

function getDemoReply(message) {
  const text = message.toLowerCase();
  const match = demoReplies.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword))
  );

  return (
    match?.reply ||
    "✨ Interesting idea! Ask me about maps, weapons, characters, survival, or squad strategy!"
  );
}

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to WIZARD AI Demo! 🧙 Ask me about maps, characters, weapons, or strategies.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("wizardUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });


  async function handleSend(event) {
    event.preventDefault();
    const message = input.trim();

    if (!message || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: message },
    ]);

    setInput("");
    setLoading(true);

    try {
      const session = JSON.parse(
        localStorage.getItem("wizardUser") || "null"
      );

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token
            ? { Authorization: `Bearer ${session.token}` }
            : {}),
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "AI request failed.");
      }

      const reply =
        data.reply || data.response || data.message;

      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("AI response was empty. Check the backend response.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", text: reply },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Sorry, WIZARD AI couldn't respond: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }


  function openAuth(mode) {
    setAuthMode(mode);
    setAuthMessage("");
    setPassword("");
    setShowAuth(true);
    document.getElementById("auth")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleAuth(event) {
    event.preventDefault();
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "signup" ? "/api/signup" : "/api/login";

      const body =
        authMode === "signup"
          ? { username: username.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      const session = {
        token: data.token,
        user: data.user,
      };

      localStorage.setItem("wizardUser", JSON.stringify(session));
      setCurrentUser(session);
      setAuthMessage(data.message || "Success!");
      setPassword("");
      setShowAuth(false);
    } catch (error) {
      setAuthMessage(
        error.message === "Failed to fetch"
          ? "Cannot reach the server. Make sure your backend is running on port 5000."
          : error.message
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("wizardUser");
    setCurrentUser(null);
    setAuthMessage("You have logged out.");
    setShowAuth(false);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#home">
          WIZARD<span>.</span>
        </a>

        <nav>
          <a href="#home">HOME</a>
          <a href="#features">FEATURES</a>
          <a href="#ai">WIZARD AI</a>
        </nav>

        <div className="nav-auth">
          {currentUser ? (
            <>
              <span className="welcome-user">
                HI, {currentUser.user.username.toUpperCase()}
              </span>
              <button className="nav-button" onClick={handleLogout}>
                LOG OUT
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-login"
                onClick={() => openAuth("login")}
              >
                LOGIN
              </button>
              <button
                className="nav-button"
                onClick={() => openAuth("signup")}
              >
                SIGN UP ↗
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="tag">THE NEXT BATTLE BEGINS HERE</p>
            <h1>
              ENTER THE
              <br />
              <span>UNKNOWN.</span>
            </h1>
            <p className="hero-description">
              A new battle royale universe is taking shape. Discover the
              concept, explore ideas, and prepare for the arena.
            </p>
            <div className="hero-actions">
              <a className="main-button" href="#features">
                EXPLORE THE WORLD ↗
              </a>
              <a className="secondary-button" href="#ai">
                TRY WIZARD AI
              </a>
            </div>
            <p className="small-note">
              ORIGINAL GAME CONCEPT · IN DEVELOPMENT
            </p>
          </div>

          <div className="portal" aria-label="Glowing purple portal">
            <div className="portal-ring">
              <div className="portal-core">W</div>
            </div>
            <p>THE ARENA AWAITS</p>
          </div>
        </section>

        {showAuth && (
          <section className="auth-section" id="auth">
            <div className="auth-card">
              <button
                type="button"
                className="auth-close"
                onClick={() => setShowAuth(false)}
                aria-label="Close authentication form"
              >
                ×
              </button>

              <p className="tag">WIZARD ACCOUNT</p>
              <h2>
                {authMode === "signup" ? "JOIN THE " : "WELCOME "}
                <span>ARENA.</span>
              </h2>
              <p className="auth-description">
                {authMode === "signup"
                  ? "Create your account and enter the WIZARD universe."
                  : "Log in to your WIZARD account."}
              </p>

              <div className="auth-tabs">
                <button
                  type="button"
                  className={authMode === "login" ? "active" : ""}
                  onClick={() => {
                    setAuthMode("login");
                    setAuthMessage("");
                  }}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  className={authMode === "signup" ? "active" : ""}
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthMessage("");
                  }}
                >
                  SIGN UP
                </button>
              </div>

              <form className="auth-form" onSubmit={handleAuth}>
                {authMode === "signup" && (
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                    required
                  />
                )}

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />

                <input
                  type="password"
                  placeholder="Password (minimum 8 characters)"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  autoComplete={
                    authMode === "signup" ? "new-password" : "current-password"
                  }
                  required
                />

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "PLEASE WAIT..."
                    : authMode === "signup"
                      ? "CREATE ACCOUNT ↗"
                      : "LOGIN ↗"}
                </button>
              </form>

              {authMessage && (
                <p className="auth-message" role="status">
                  {authMessage}
                </p>
              )}

              <p className="auth-switch">
                {authMode === "signup"
                  ? "Already have an account?"
                  : "New to WIZARD?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "signup" ? "login" : "signup");
                    setAuthMessage("");
                  }}
                >
                  {authMode === "signup" ? "Log in" : "Create account"}
                </button>
              </p>
            </div>
          </section>
        )}

        <section className="features-section" id="features">
          <p className="tag">BUILT FOR THE BOLD</p>
          <h2>
            IMAGINE YOUR <span>ADVANTAGE.</span>
          </h2>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon">◈</span>
              <h3>EXPLORE</h3>
              <p>
                Imagine mysterious locations, hidden routes, and a world
                waiting to be discovered.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">✧</span>
              <h3>STRATEGIZE</h3>
              <p>
                Explore possible tactics, smart rotations, and teamwork-focused
                gameplay.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-icon">⌘</span>
              <h3>EVOLVE</h3>
              <p>
                Help shape the ideas and possibilities behind the WIZARD
                universe.
              </p>
            </article>
          </div>
        </section>

        <section className="ai-section" id="ai">
          <p className="tag">INTELLIGENCE ONLINE</p>
          <h2>
            YOUR BATTLE.
            <br />
            <span>YOUR STRATEGY.</span>
          </h2>
          <p className="ai-description">
            Meet the WIZARD AI demo assistant. Ask about game concepts, maps,
            characters, or battle strategies.
          </p>

          <div className="chat-panel">
            <div className="chat-header">
              <div>
                <span className="online-dot"></span>
                <strong>WIZARD AI</strong>
              </div>
              <span className="demo-label">FREE DEMO</span>
            </div>

            <div className="chat-messages" aria-live="polite">
              {messages.map((message, index) => (
                <div
                  className={`chat-message ${message.role}`}
                  key={`${index}-${message.role}`}
                >
                  <span className="message-label">
                    {message.role === "user" ? "YOU" : "WIZARD"}
                  </span>
                  <p>{message.text}</p>
                </div>
              ))}

              {loading && (
                <div className="chat-message assistant">
                  <span className="message-label">WIZARD</span>
                  <p className="typing">
                    Thinking<span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </p>
                </div>
              )}
            </div>

            <form className="chat-form" onSubmit={handleSend}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about maps, weapons, strategy..."
                aria-label="Message WIZARD AI demo"
                maxLength={500}
              />
              <button type="submit" disabled={loading || !input.trim()}>
                {loading ? "..." : "SEND ↗"}
              </button>
            </form>

            <p className="demo-disclaimer">
  AI-powered responses from WIZARD.
</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="logo" href="#home">
          WIZARD<span>.</span>
        </a>
        <p>An original battle royale concept. The journey starts here.</p>
      </footer>
    </div>
  );
}

export default App;

