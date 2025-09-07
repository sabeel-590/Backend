const express = require('express');
const app = express();
<<<<<<< HEAD
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

=======
const pool = require('./db');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const QRCode = require('qrcode');
const { Parser } = require('json2csv');

app.use(express.json());

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.dbns1eoe6,
  api_key: process.env.324741222998691,
  api_secret: process.env.RVa0v-2UvHRcYE4-D12ENFw3AQk

});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.mdsabeelkhan08@gmail.com,
    pass: process.env.Sabeel@23271A0590
  }
});

// Event image upload using multer
const upload = multer({ dest: 'uploads/' });

// ================== ROUTES ==================

// Get all events
app.get('/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Create new event
app.post('/events', upload.single('image'), async (req, res) => {
  try {
    let image_url = null;
    if(req.file){
      const result = await cloudinary.uploader.upload(req.file.path);
      image_url = result.secure_url;
    }
    const { host_id, title, date, location, description, capacity } = req.body;
    const result = await pool.query(
      'INSERT INTO events (host_id,title,date,location,description,capacity,image_url) VALUES(,,,,,,) RETURNING *',
      [host_id,title,date,location,description,capacity,image_url]
    );
    res.json(result.rows[0]);
  } catch(err) { res.status(500).send('Server Error'); }
});

// RSVP with capacity check
app.post('/rsvp', async (req, res) => {
  const { user_id, event_id, status } = req.body;
  try {
    const event = await pool.query('SELECT capacity FROM events WHERE id=', [event_id]);
    const rsvpCount = await pool.query('SELECT COUNT(*) FROM rsvps WHERE event_id= AND status=', [event_id,'going']);
    if(parseInt(rsvpCount.rows[0].count) >= event.rows[0].capacity) {
      return res.status(400).send('Event full');
    }
    const result = await pool.query(
      'INSERT INTO rsvps (user_id,event_id,status) VALUES(,,) RETURNING *',
      [user_id,event_id,status]
    );

    // Send email reminder
    const user = await pool.query('SELECT email FROM users WHERE id=',[user_id]);
    transporter.sendMail({
      from: process.env.mdsabeelkhan,
      to: user.rows[0].email,
      subject: 'RSVP Confirmation',
      text: \⁠ You have RSVPed to event ID ${event_id}\ ⁠
    });

    // Generate QR code for check-in
    const qr = await QRCode.toDataURL(\⁠ ${event_id}-${user_id}\ ⁠);
    result.rows[0].qr_code = qr;

    res.json(result.rows[0]);
  } catch(err) { res.status(500).send('Server Error'); }
});

// Export attendees as CSV
app.get('/events/:id/attendees/csv', async (req,res)=>{
  const { id } = req.params;
  try{
    const result = await pool.query('SELECT u.id,u.name,u.email,r.status FROM rsvps r JOIN users u ON u.id=r.user_id WHERE r.event_id=',[id]);
    const parser = new Parser();
    const csv = parser.parse(result.rows);
    res.header('Content-Type','text/csv');
    res.attachment('attendees.csv');
    res.send(csv);
  }catch(err){ res.status(500).send('Server Error'); }
});

// Admin analytics example
app.get('/admin/events/analytics', async (req,res)=>{
  try{
    const result = await pool.query('SELECT e.title, COUNT(r.id) AS rsvp_count FROM events e LEFT JOIN rsvps r ON e.id=r.event_id GROUP BY e.title');
    res.json(result.rows);
  }catch(err){ res.status(500).send('Server Error');}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(\⁠ Server running on port ${PORT}\ ⁠));
>>>>>>> f297e56 (Full-featured backend with all optional features)
