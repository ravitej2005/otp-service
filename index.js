const express = require("express");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


function hashOtp(phone, otp) {
  const data = `${phone}.${otp}.${process.env.SECRET_KEY}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}


app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone required" });
  }

  const otp = generateOTP();
  const hash = hashOtp(phone, otp);

  try {
    await fetch("https://www.traccar.org/sms", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TRACCAR_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phone,
        message: `Your OTP is ${otp}`,
      }),
    });

    return res.json({
      success: true,
      hash: hash, 
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


app.post("/verify-otp", (req, res) => {
  const { phone, otp, hash } = req.body;

  const newHash = hashOtp(phone, otp);

  if (newHash === hash) {
    return res.json({ success: true, message: "OTP verified" });
  } else {
    return res.json({ success: false, message: "Invalid OTP" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});