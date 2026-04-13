const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// MongoDB কানেকশন (এখানে আপনার নিজের MongoDB URI দিন)
const mongoURI = "mongodb+srv://gourabadmin:gourab2006@cluster0.xiyfnuj.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ Database Ready"));

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    status: { type: String, default: 'Pending' }
});
const User = mongoose.model('User', UserSchema);

// Admin Info
const ADMIN_EMAIL = "gourabmon112233@gmail.com";
const ADMIN_PASS = "goUrab@2008";

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) return res.json({ success: true, role: 'Admin' });
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "User Not Found!" });
    if (user.status !== 'Approved') return res.json({ success: false, message: "অ্যাডমিন অনুমোদন দেয়নি!" });
    res.json({ success: true, role: 'User' });
});

// Register API (১০০+ ইউজার আইডি রিকোয়েস্ট যাবে)
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true });
    } catch (e) { res.json({ success: false, message: "Email already exists!" }); }
});

// Admin Panel APIs
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/api/admin/action', async (req, res) => {
    const { userId, action } = req.body;
    await User.findByIdAndUpdate(userId, { status: action });
    res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(process.env.PORT || 3000);
