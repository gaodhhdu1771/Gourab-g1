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
mongoose.connect(mongoURI).then(() => console.log("✅ MongoDB Connected"));

const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String, status: { type: String, default: 'Pending' }
}));

const adminEmail = "gourabmon112233@gmail.com";
const adminPass = "goUrab@2008";

// লগইন এপিআই
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === adminEmail && password === adminPass) return res.json({ success: true, role: 'Admin' });
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "Invalid Data!" });
    res.json({ success: true, role: 'User', status: user.status });
});

// রেজিস্ট্রেশন এপিআই
app.post('/api/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true });
    } catch (e) { res.json({ success: false }); }
});

// অ্যাডমিন প্যানেল এপিআই
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(process.env.PORT || 3000);
