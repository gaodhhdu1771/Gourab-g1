const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// MongoDB কানেকশন
const mongoURI = "mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    status: { type: String, default: 'Pending' }
});
const User = mongoose.model('User', UserSchema);

const adminEmail = "gourabmon112233@gmail.com";
const adminPass = "goUrab@2008";

// লগইন এপিআই
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === adminEmail && password === adminPass) {
            return res.json({ success: true, role: 'Admin' });
        }
        const user = await User.findOne({ email, password });
        if (!user) return res.json({ success: false, message: "ভুল ইমেইল বা পাসওয়ার্ড!" });
        if (user.status === 'Pending') return res.json({ success: false, message: "অ্যাকাউন্ট এখনো একটিভ নয়!" });
        res.json({ success: true, role: 'User' });
    } catch (err) {
        res.json({ success: false, message: "সার্ভার এরর!" });
    }
});

// রেজিস্ট্রেশন এপিআই
app.post('/api/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false, message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে!" });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(process.env.PORT || 3000);
