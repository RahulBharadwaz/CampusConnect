import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./index.css";

// --- NAVIGATION ---
const PublicNavbar = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/dashboard")) return null;
  return (
    <nav className="nav-bar">
      <Link to="/" className="logo">
        CampusConnect
      </Link>
      <div className="nav-links">
        <Link to="/login" className="nav-btn-secondary">
          Login
        </Link>
        <Link to="/signup" className="nav-btn-primary">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

// --- HOME PAGE (RESUME-READY) ---
const Home = () => (
  <div className="home-wrapper">
    <section className="hero-section">
      <div className="persona-badge">Next-Gen Campus Ecosystem</div>
      <h1>
        The Digital Pulse of{" "}
        <span className="highlight">Modern Campus Life</span>
      </h1>
      <p>
        The first inter-university network designed for total transparency.
        Seamlessly toggle between your Real Identity and an Anonymous Avatar.
      </p>
      <div
        className="hero-btns"
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <Link to="/signup" className="main-btn">
          Get Started
        </Link>
        <a
          href="#features"
          className="nav-btn-secondary"
          style={{
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
          }}
        >
          See how it works
        </a>
      </div>
    </section>

    <section id="features" className="features-section">
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          One Platform. No Barriers.
        </h2>
        <p
          className="text-muted"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          Bridging the gap between academic accountability and safe student
          expression.
        </p>
      </div>
      <div className="features-grid">
        <div className="feature-card">
          <div className="icon">🎭</div>
          <h3>Dual-Persona Engine</h3>
          <p>
            Post anonymously to raise grievances or use your real identity for
            professional networking.
          </p>
        </div>
        <div className="feature-card">
          <div className="icon">🛡️</div>
          <h3>Institutional Trust</h3>
          <p>
            Secure authentication via college email ensures every user is a
            verified student.
          </p>
        </div>
        <div className="feature-card">
          <div className="icon">🔍</div>
          <h3>Centralized Hub</h3>
          <p>
            From Lost & Found to Peer Tutoring, everything your campus needs in
            one high-performance dashboard.
          </p>
        </div>
      </div>
    </section>

    <section style={{ textAlign: "center", padding: "80px 0" }}>
      <h3
        style={{
          opacity: 0.4,
          fontSize: "0.8rem",
          letterSpacing: "3px",
          marginBottom: "30px",
        }}
      >
        POWERED BY MODERN ARCHITECTURE
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "4rem",
          fontSize: "1.2rem",
          fontWeight: "800",
          opacity: 0.6,
        }}
      >
        <span>MongoDB</span>
        <span>Express</span>
        <span>React</span>
        <span>Node.js</span>
      </div>
    </section>

    <footer
      style={{
        padding: "40px",
        textAlign: "center",
        borderTop: "1px solid var(--border)",
      }}
    >
      <p className="text-muted" style={{ fontSize: "0.8rem" }}>
        © 2026 CampusConnect Network. Verified Academic Access Only.
      </p>
    </footer>
  </div>
);

// --- AUTHENTICATION (GATEKEEPER LOGIC) ---
const AuthPage = ({ type }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestOtp = async () => {
    const collegeEmailRegex = /^[^\s@]+@[^\s@]+\.(edu|ac\.in|edu\.[a-z]{2})$/i;
    if (!collegeEmailRegex.test(email))
      return setError("Institutional email required");
    if (!password || password.length < 6)
      return setError("Password must be at least 6 characters.");

    setIsLoading(true);
    setError("");
    setOtp("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStep(2);
      else setError((await res.json()).error || "Email delivery failed.");
    } catch (err) {
      setError("Backend Offline");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalAuth = async () => {
    const endpoint = type === "login" ? "login" : "signup";
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });
      if (res.ok) navigate("/dashboard");
      else setError((await res.json()).error || "Authentication failed.");
    } catch (err) {
      setError("Connection refused");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            {type === "login" ? "🔑" : "🛡️"}
          </div>
          <h2>{type === "login" ? "Welcome Back" : "Verify Identity"}</h2>
          <p className="text-muted">Enter your institutional credentials</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="auth-form-content">
          {step === 1 ? (
            <>
              <div className="field-group">
                <label>College Email</label>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="submit-btn"
                disabled={isLoading}
                onClick={type === "login" ? handleFinalAuth : requestOtp}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : type === "login" ? (
                  "Enter Portal"
                ) : (
                  "Send OTP"
                )}
              </button>
            </>
          ) : (
            <>
              <div className="field-group">
                <label>6-Digit Code</label>
                <input
                  type="text"
                  placeholder="X X X X X X"
                  maxLength="6"
                  value={otp}
                  className="otp-input"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <button
                className="submit-btn"
                disabled={isLoading}
                onClick={handleFinalAuth}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  "Verify & Initialize"
                )}
              </button>
              <button className="edit-mail-btn" onClick={() => setStep(1)}>
                ← Edit Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD (UPGRADED UI) ---
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("lostfound");
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
    contactInfo: "",
  });

  // New State for Presentation Features
  const [persona, setPersona] = useState("Real Identity");
  const [feedType, setFeedType] = useState("College Feed");

  useEffect(() => {
    if (activeTab === "lostfound") fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/items");
      setItems(await res.json());
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/items/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setFormData({
        itemName: "",
        description: "",
        location: "",
        contactInfo: "",
      });
      fetchItems();
    } catch (err) {
      console.error("Failed to post item", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">CampusConnect</div>

        {/* DUAL PERSONA TOGGLE */}
        <div className="persona-toggle-container">
          <p className="sidebar-label">ACTIVE PERSONA</p>
          <div className="persona-switch">
            <button
              className={persona === "Real Identity" ? "active-real" : ""}
              onClick={() => setPersona("Real Identity")}
            >
              Real
            </button>
            <button
              className={persona === "Anonymous" ? "active-anon" : ""}
              onClick={() => setPersona("Anonymous")}
            >
              Anon
            </button>
          </div>
          <p className="persona-status">
            Posting as:{" "}
            <strong>
              {persona === "Anonymous" ? "Hidden User" : "Rahul B."}
            </strong>
          </p>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">MODULES</p>
          <button
            onClick={() => setActiveTab("lostfound")}
            className={activeTab === "lostfound" ? "active" : ""}
          >
            <span style={{ marginRight: "10px" }}>🔍</span> Lost & Found
          </button>
          <button
            onClick={() => setActiveTab("tutoring")}
            className={activeTab === "tutoring" ? "active" : ""}
          >
            <span style={{ marginRight: "10px" }}>📚</span> Peer Tutoring
          </button>
          <button
            onClick={() => setActiveTab("grievance")}
            className={activeTab === "grievance" ? "active" : ""}
          >
            <span style={{ marginRight: "10px" }}>🛡️</span> Grievance Portal
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={activeTab === "events" ? "active" : ""}
          >
            <span style={{ marginRight: "10px" }}>📅</span> Campus Events
          </button>
        </nav>

        <Link to="/" className="signout-link">
          ⏏ Sign Out
        </Link>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* GLOBAL FEED TOGGLE */}
        <header className="dashboard-header">
          <div className="feed-toggle">
            <button
              className={
                feedType === "College Feed"
                  ? "feed-btn active-feed"
                  : "feed-btn"
              }
              onClick={() => setFeedType("College Feed")}
            >
              College Feed
            </button>
            <button
              className={
                feedType === "Global Feed" ? "feed-btn active-feed" : "feed-btn"
              }
              onClick={() => setFeedType("Global Feed")}
            >
              Global Feed
            </button>
          </div>
        </header>

        {activeTab === "lostfound" ? (
          <div className="module-content fade-in">
            <div className="module-header">
              <h2>Lost & Found Hub</h2>
              <p className="text-muted">
                Live Feed • Broadcasting to {feedType}
              </p>
            </div>

            <div className="glass-panel form-panel">
              <form onSubmit={handleSubmit} className="form-grid">
                <div className="field-group">
                  <label>Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Blue Hydroflask"
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Last Seen Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Library 2nd Floor"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field-group full-width">
                  <label>Description</label>
                  <textarea
                    placeholder="Provide details..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field-group full-width">
                  <label>Contact Details</label>
                  <input
                    type="text"
                    placeholder="Phone number or email"
                    value={formData.contactInfo}
                    onChange={(e) =>
                      setFormData({ ...formData, contactInfo: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" className="submit-btn full-width">
                  Broadcast to {feedType}
                </button>
              </form>
            </div>

            <h3 style={{ marginTop: "3rem", marginBottom: "1.5rem" }}>
              Recent Reports
            </h3>
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className="item-card">
                  <div className="card-badge">Lost Item</div>
                  <h3>{item.itemName}</h3>
                  <p className="location-tag">📍 {item.location}</p>
                  <p className="item-desc">{item.description}</p>
                  <div className="card-footer">
                    <span>Contact:</span> {item.contactInfo}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-muted">
                  No items reported in the {feedType} yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="placeholder-view fade-in">
            <div
              className="icon"
              style={{ fontSize: "4rem", marginBottom: "1rem" }}
            >
              ⚙️
            </div>
            <h2>{activeTab.replace(/([A-Z])/g, " $1").toUpperCase()}</h2>
            <p className="text-muted">Module Integration: Phase 2 Roadmap</p>
            <p style={{ marginTop: "1rem", opacity: 0.5 }}>
              Currently viewing {feedType} with {persona}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
export default function App() {
  return (
    <Router>
      <PublicNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/signup" element={<AuthPage type="signup" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
  