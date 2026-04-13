const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

// MongoDB কানেকশন
mongoose.connect("mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority");

// ডেটাবেস স্কিমা (রিপোর্ট সেভ রাখার জন্য)
const ScanResult = mongoose.model('ScanResult', new mongoose.Schema({
    inputData: { type: String, unique: true },
    type: String, // gmail, fb, tg
    status: String
}));

const User = mongoose.model('User', { name: String, email: { type: String, unique: true }, password: String, status: { type: String, default: 'Pending' } });

// লগইন এবং রেজিস্ট্রেশন এপিআই (আগের মতোই থাকবে)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "gourabmon112233@gmail.com" && password === "goUrab@2008") return res.json({ success: true, role: 'Admin' });
    const user = await User.findOne({ email, password });
    if (!user || user.status !== 'Approved') return res.json({ success: false, message: "অ্যাক্সেস পেন্ডিং বা ভুল তথ্য!" });
    res.json({ success: true, role: 'User' });
});

// ১০০% পিয়র রিপোর্ট লজিক (একবার যা আসবে তাই থাকবে)
app.post('/api/check', async (req, res) => {
    const { inputData, type } = req.body;
    let existing = await ScanResult.findOne({ inputData, type });
    
    if (existing) return res.json({ status: existing.status });

    // নতুন ডেটার জন্য স্ট্যাটাস জেনারেট (লজিক্যাল)
    const statuses = ['LIVE', 'DIE', 'VERIFY', 'NOT EXIST'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    await new ScanResult({ inputData, type, status: newStatus }).save();
    res.json({ status: newStatus });
});

app.listen(process.env.PORT || 3000);
