const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.static(__dirname));

const mongoURI = "mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI).then(() => console.log("✅ Ultra Secure DB Active"));

const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String, status: { type: String, default: 'Pending' }, createdAt: { type: Date, default: Date.now }
}));

const adminEmail = "gourabmon112233@gmail.com";
const adminPass = "goUrab@2008";

// লগইন এপিআই (সব হাইড থাকবে লগইন ছাড়া)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === adminEmail && password === adminPass) return res.json({ success: true, role: 'Admin' });
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "User Not Found!" });
    if (user.status !== 'Approved') return res.json({ success: false, message: "অ্যাডমিন এখনও অনুমোদন দেয়নি!" });
    res.json({ success: true, role: 'User' });
});

// একাউন্ট রিকোয়েস্ট (তাত্ক্ষণিক রিকোয়েস্ট যাবে)
app.post('/api/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true });
    } catch (e) { res.json({ success: false, message: "Email already exists!" }); }
});

app.get('/api/users', async (req, res) => {
    const users = await User.find().sort({createdAt: -1});
    res.json(users);
});

app.post('/api/admin/action', async (req, res) => {
    const { userId, action } = req.body;
    await User.findByIdAndUpdate(userId, { status: action });
    res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(process.env.PORT || 3000);
