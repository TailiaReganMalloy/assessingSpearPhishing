const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const viewsRoutes = require('./routes/viewsRoutes');
const messageRoutes = require('./routes/messageRoutes'); // Import message routes

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.static('public')); // Serve static files (CSS, JS)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes); // Use message routes
app.use('/', viewsRoutes); // Use views routes for the root path

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));