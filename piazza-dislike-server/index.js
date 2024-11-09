// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// console.log(process.env.MONGO_URL)
// 
const app = express();
const port = 3000;

// MongoDB connection URI (replace with your MongoDB details)
const uri = process.env.MONGO_URL 
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

// serve static files (privacy policy)
app.use(express.static('public'))

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectDB();

const db = client.db('piazza-dislikes');
const dislikes = db.collection('dislikes');

// Create indexes for efficient querying
async function createIndexes() {
  try {
    await dislikes.createIndex({ commentId: 1 });
    await dislikes.createIndex({ commentId: 1, userId: 1 }, { unique: true });
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}

createIndexes();

// Get dislike status and count for a comment
app.get('/dislikes/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const userId = req.query.userId;

  try {
    // Get total dislike count
    const totalDislikes = await dislikes.countDocuments({ commentId });
    
    // Check if this IP has disliked
    const hasDisliked = await dislikes.findOne({ commentId, userId }) !== null;

    res.json({ totalDislikes, hasDisliked });
  } catch (error) {
    console.error('Error getting dislikes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle dislike action
app.post('/dislike', async (req, res) => {
  const { commentId, action, userId } = req.body;

  try {
    if (action === 'add') {
      // Add dislike if it doesn't exist
      await dislikes.updateOne(
        { commentId, userId  },
        { $set: { commentId, userId, timestamp: new Date() } },
        { upsert: true }
      );
    } else if (action === 'remove') {
      // Remove dislike
      await dislikes.deleteOne({ commentId, userId});
    }

    const totalDislikes = await dislikes.countDocuments({ commentId });
    res.json({ totalDislikes });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Already disliked' });
    } else {
      console.error('Error updating dislikes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${3000}`);
});
