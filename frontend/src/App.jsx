import { useState } from "react";
import "./App.css";

const initialForm = {
  deviceType: "Smartphone",
  brand: "Apple",
  model: "",
  originalPrice: "",
  age: "",
  ram: "",
  storage: "",
  batteryHealth: "",
  condition: "Good",
  repairHistory: "No Repairs",
  warranty: "No",
};

const devices = [
  ["📱", "Smartphones"],
  ["💻", "Laptops"],
  ["📟", "Tablets"],
  ["⌚", "Smartwatches"],
  ["📷", "Cameras"],
  ["🎮", "Gaming Consoles"],
  ["📺", "TVs"],
  ["🎧", "Headphones"],
];

function App() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const estimatePrice = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!formData.model || !formData.originalPrice || !formData.age || !formData.batteryHealth) {
      setError("Please fill in Model, Original Price, Age and Battery Health.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_type: formData.deviceType,
          brand: formData.brand,
          model: formData.model,
          original_price: Number(formData.originalPrice),
          age: Number(formData.age),
          ram: Number(formData.ram || 0),
          storage: Number(formData.storage || 0),
          battery_health: Number(formData.batteryHealth),
          condition: formData.condition,
          repair_history: formData.repairHistory,
          warranty: formData.warranty,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Prediction failed");
      }

      const data = await response.json();

     setResult({
  minimum: Math.round(data.price_range.low),
  maximum: Math.round(data.price_range.high),
  estimated: Math.round(data.midpoint),
});
    } catch (err) {
      setError(
        "Could not connect to the backend. Make sure FastAPI is running at http://127.0.0.1:8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setResult(null);
    setError("");
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-mark">F</span>
          <span>FairPrice</span>
        </a>

        <nav>
          <a href="#estimator">Estimator</a>
          <a href="#how-it-works">How it works</a>
          <a href="#insights">Market insights</a>
        </nav>

        <a className="nav-button" href="#estimator">Get valuation</a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">USED ELECTRONICS VALUATION</p>
            <h1>
              Know what it’s really worth
              <span> before you buy or sell.</span>
            </h1>
            <p className="hero-text">
              Enter your device details and get an estimated resale range powered
              by a Random Forest machine-learning model.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#estimator">Estimate my device →</a>
              <a className="text-button" href="#how-it-works">See how it works</a>
            </div>

            <div className="trust-row">
              <span>✓ Data-driven estimate</span>
              <span>✓ Price range, not false precision</span>
              <span>✓ Fast results</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="mini-window">
              <div className="window-top">
                <span className="status-dot"></span>
                <span>FairPrice estimator</span>
                <span className="live-badge">LIVE</span>
              </div>
              <div className="mini-content">
                <p className="mini-label">CURRENT ESTIMATE</p>
                <div className="mini-price">₹48,631</div>
                <div className="mini-range">₹43,768 — ₹53,494</div>
                <div className="mini-bar"><span></span></div>
                <div className="mini-grid">
                  <div><small>Condition</small><strong>Good</strong></div>
                  <div><small>Battery</small><strong>92%</strong></div>
                  <div><small>Age</small><strong>1 year</strong></div>
                  <div><small>Warranty</small><strong>Yes</strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="device-strip">
          <p>SUPPORTED ELECTRONICS</p>
          <div className="device-grid">
            {devices.map(([icon, label]) => (
              <div className="device-chip" key={label}>
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="estimator-section" id="estimator">
          <div className="section-heading">
            <p className="eyebrow">DEVICE VALUATION WIZARD</p>
            <h2>Tell us about your device.</h2>
            <p>Complete the details below. Your estimate will be generated using the trained ML model.</p>
          </div>

          <div className="estimator-layout">
            <form className="valuation-card" onSubmit={estimatePrice}>
              <div className="form-progress">
                <span className="active">01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span>05</span>
                <span>06</span>
                <b>Device details</b>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span>01</span>
                  <div>
                    <h3>Device identity</h3>
                    <p>Tell us what you are valuing.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Device type</span>
                    <select name="deviceType" value={formData.deviceType} onChange={handleChange}>
                      <option>Smartphone</option>
                      <option>Laptop</option>
                      <option>Tablet</option>
                      <option>Smartwatch</option>
                      <option>Camera</option>
                      <option>Gaming Console</option>
                      <option>TV</option>
                      <option>Headphones</option>
                    </select>
                  </label>

                  <label>
                    <span>Brand</span>
                    <select name="brand" value={formData.brand} onChange={handleChange}>
                      <option>Apple</option>
                      <option>Samsung</option>
                      <option>OnePlus</option>
                      <option>Google</option>
                      <option>Dell</option>
                      <option>HP</option>
                      <option>Lenovo</option>
                      <option>ASUS</option>
                      <option>Canon</option>
                      <option>Nikon</option>
                      <option>Sony</option>
                      <option>Microsoft</option>
                      <option>LG</option>
                      <option>Bose</option>
                      <option>Xiaomi</option>
                    </select>
                  </label>

                  <label className="full-width">
                    <span>Model</span>
                    <input name="model" value={formData.model} onChange={handleChange} placeholder="e.g. iPhone 15" />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span>02</span>
                  <div>
                    <h3>Original value & age</h3>
                    <p>These help the model understand depreciation.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Original price (₹)</span>
                    <input type="number" min="0" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="70000" />
                  </label>
                  <label>
                    <span>Age (years)</span>
                    <input type="number" min="0" step="0.1" name="age" value={formData.age} onChange={handleChange} placeholder="1" />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span>03</span>
                  <div>
                    <h3>Specifications</h3>
                    <p>Hardware information where applicable.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    <span>RAM (GB)</span>
                    <input type="number" min="0" name="ram" value={formData.ram} onChange={handleChange} placeholder="8" />
                  </label>
                  <label>
                    <span>Storage (GB)</span>
                    <input type="number" min="0" name="storage" value={formData.storage} onChange={handleChange} placeholder="128" />
                  </label>
                  <label>
                    <span>Battery health (%)</span>
                    <input type="number" min="0" max="100" name="batteryHealth" value={formData.batteryHealth} onChange={handleChange} placeholder="92" />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span>04</span>
                  <div>
                    <h3>Physical condition</h3>
                    <p>Choose the closest match.</p>
                  </div>
                </div>

                <div className="choice-grid">
                  {["Excellent", "Good", "Fair", "Poor"].map((item) => (
                    <label className={`choice ${formData.condition === item ? "selected" : ""}`} key={item}>
                      <input type="radio" name="condition" value={item} checked={formData.condition === item} onChange={handleChange} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  <span>05</span>
                  <div>
                    <h3>Repair history</h3>
                    <p>Previous repairs can affect resale value.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Repair history</span>
                    <select name="repairHistory" value={formData.repairHistory} onChange={handleChange}>
                      <option>No Repairs</option>
                      <option>Minor Repair</option>
                      <option>Major Repair</option>
                    </select>
                  </label>
                  <label>
                    <span>Warranty</span>
                    <select name="warranty" value={formData.warranty} onChange={handleChange}>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="form-section final-section">
                <div className="form-section-title">
                  <span>06</span>
                  <div>
                    <h3>Generate valuation</h3>
                    <p>Our trained model will estimate a fair resale range.</p>
                  </div>
                </div>

                {error && <div className="error-box">{error}</div>}

                <div className="button-row">
                  <button className="primary-button submit-button" type="submit" disabled={loading}>
                    {loading ? "Calculating..." : "Calculate fair price →"}
                  </button>
                  <button className="secondary-button" type="button" onClick={resetForm}>Reset</button>
                </div>
              </div>
            </form>

            <aside className="result-panel">
              {!result ? (
                <div className="result-empty">
                  <div className="result-icon">₹</div>
                  <p className="eyebrow">YOUR VALUATION</p>
                  <h3>Your estimate will appear here.</h3>
                  <p>Fill in the device details and click Calculate fair price.</p>
                </div>
              ) : (
                <div className="result-filled">
                  <p className="eyebrow">YOUR ESTIMATED FAIR PRICE</p>
                  <div className="result-range">
                    ₹{result.minimum.toLocaleString("en-IN")} – ₹{result.maximum.toLocaleString("en-IN")}
                  </div>
                  <div className="midpoint">
                    Estimated midpoint: <strong>₹{result.estimated.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="result-line"><span></span></div>
                  <p className="result-note">
                    This is an estimated resale price range, not an exact market price.
                  </p>
                  <button className="secondary-button" onClick={resetForm}>New valuation</button>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>From device details to a transparent estimate.</h2>
          </div>

          <div className="steps-grid">
            <article>
              <span>01</span>
              <h3>Describe your device</h3>
              <p>Enter identity, price, age, specifications and condition details.</p>
            </article>
            <article>
              <span>02</span>
              <h3>ML prediction</h3>
              <p>The FastAPI backend sends the information to the trained Random Forest model.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Fair price range</h3>
              <p>You receive a predicted midpoint with a practical estimated resale range.</p>
            </article>
          </div>
        </section>

        <section className="insights-section" id="insights">
          <div>
            <p className="eyebrow">MARKET INTELLIGENCE</p>
            <h2>Why used-device value changes.</h2>
            <p>
              Age, original value, specifications, physical condition, battery health,
              repairs and warranty can all influence resale value.
            </p>
          </div>
          <div className="insight-card">
            <div className="insight-row"><span>Age</span><b>Depreciation</b></div>
            <div className="insight-row"><span>Condition</span><b>Demand signal</b></div>
            <div className="insight-row"><span>Battery</span><b>Usability</b></div>
            <div className="insight-row"><span>Warranty</span><b>Buyer confidence</b></div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-card">
            <p className="eyebrow">ABOUT FAIRPRICE</p>
            <h2>A cloud-ready valuation platform for used electronics.</h2>
            <p>
              FairPrice combines a React interface, FastAPI REST API and a
              Random Forest regression model. The architecture can later be
              extended with MySQL/AWS RDS and cloud deployment.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>FairPrice</span>
        </div>
        <p>Used Electronics Price Estimator · BTech Project</p>
      </footer>
    </div>
  );
}

export default App;
