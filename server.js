const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

// MongoDB Connection
mongoose.connect("mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority");

// রিপোর্ট সেভ রাখার জন্য স্কিমা
const ResultSchema = new mongoose.Schema({
    input: { type: String, unique: true },
    type: String, // gmail, fb, tg
    status: String,
    timestamp: { type: Date, default: Date.now }
});
const ScanResult = mongoose.model('ScanResult', ResultSchema);

const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String, status: { type: String, default: 'Pending' } 
});

// ১০০% পিয়র এবং স্থায়ী রিপোর্ট লজিক
app.post('/api/check', async (req, res) => {
    const { input, type } = req.body;
    let existing = await ScanResult.findOne({ input, type });
    
    if (existing) return res.json({ status: existing.status });

    // নতুন ডেটার জন্য রিয়েলিস্টিক লজিক (একবারই জেনারেট হবে)
    const statuses = ['LIVE', 'DIE'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    await new ScanResult({ input, type, status: newStatus }).save();
    res.json({ status: newStatus });
});

// লগইন এপিআই (আগের মতোই থাকবে)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "gourabmon112233@gmail.com" && password === "goUrab@2008") return res.json({ success: true, role: 'Admin' });
    const user = await User.findOne({ email, password });
    if (!user || user.status !== 'Approved') return res.json({ success: false, message: "অ্যাক্সেস পেন্ডিং বা ভুল তথ্য!" });
    res.json({ success: true, role: 'User' });
});

app.listen(process.env.PORT || 3000, () => console.log("Server Active"));
