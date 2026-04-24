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
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone required",
      });
    }

    const otp = generateOTP();
    const hash = hashOtp(phone, otp);

    console.log("OTP:", otp);

    // // ✅ EXACT Postman headers
    // const myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");
    // myHeaders.append("Authorization", process.env.TRACCAR_TOKEN.trim());

    // const raw = JSON.stringify({
    //   to: phone,
    //   message: `Your OTP is ${otp}`,
    // });

    // const requestOptions = {
    //   method: "POST",
    //   headers: myHeaders,
    //   body: raw,
    //   redirect: "follow",
    // };

    // const response = await fetch("https://www.traccar.org/sms", requestOptions);

    // const resultText = await response.text();
    // console.log("TRACCAR RAW RESPONSE:", resultText);
    // console.log(process.env.TRACCAR_TOKEN);

    // const data = JSON.parse(resultText);

    // // ✅ Proper validation
    // if (!data.successCount || data.successCount === 0) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "SMS sending failed",
    //     error: data,
    //   });
    // }

    // return res.json({
    //   success: true,
    //   hash,
    // });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", process.env.TRACCAR_TOKEN);

    const raw = JSON.stringify({
      "to": phone,
      "message": `Otp : ${otp}`
    });

    console.log(raw);
    

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("https://www.traccar.org/sms", requestOptions)
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.log(error));

    return res.json({
      success: true,
      hash: hash
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// 🔹 VERIFY OTP
app.post("/verify-otp", (req, res) => {
  try {
    const { phone, otp, hash } = req.body;

    if (!phone || !otp || !hash) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const newHash = hashOtp(phone, otp);

    if (newHash === hash) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});