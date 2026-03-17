const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const tempOtps = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "rahulbharadwaz6@gmail.com",
    pass: "hgqywhssdcvvizgx",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("\n❌ MAIL ERROR:", error.message, "\n");
  } else {
    console.log("\n✅ SUCCESS: Mail Server is ready!\n");
  }
});

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  }),
);

const Item = mongoose.model(
  "Item",
  new mongoose.Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    contactInfo: { type: String, required: true },
    date: { type: Date, default: Date.now },
  }),
);

// --- AUTHENTICATION ROUTES ---

app.post("/api/auth/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    // CHECK 1: Verify if user already exists BEFORE sending OTP
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "This email is already registered. Please login instead.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempOtps[email] = otp;

    const mailOptions = {
      from: '"CampusConnect Security" <rahulbharadwaz6@gmail.com>',
      to: email,
      subject: "CampusConnect - Verify Your Identity",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #00f0ff; border-radius: 10px;">
          <h2 style="color: #00f0ff;">CampusConnect Security</h2>
          <p>Your one-time verification code is:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #333;">
            ${otp}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] OTP sent to ${email}`);
    res.status(200).json({ message: "OTP sent!" });
  } catch (error) {
    console.error("Mailer Error:", error);
    res.status(500).json({ error: "Email delivery failed." });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (tempOtps[email] !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    delete tempOtps[email];
    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("Signup DB Error:", err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "This email is already registered." });
    }
    res.status(400).json({ error: "Database error: " + err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({ message: "Login successful." });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// --- PLATFORM ROUTES ---

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    console.error("Fetch Items Error:", err);
    res.status(500).json({ error: "Failed to fetch items." });
  }
});

app.post("/api/items/add", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Add Item Error:", err);
    res.status(400).json({ error: "Failed to post item: " + err.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`\n🚀 CampusConnect Secure Engine: Running on Port ${PORT}`),
    );
  })
  .catch((err) => console.error("\n❌ Database connection failed:", err));
