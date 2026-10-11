const mongoose = require('mongoose');
const mongoURI = 'mongodb://127.0.0.1:27017/taxi_hauling_db'; // Assuming standard URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log("Total users:", users.length);
    if(users.length > 0) {
      console.log("First user:", JSON.stringify(users[0], null, 2));
    }
    const user1 = await db.collection('users').findOne({ id: 1 });
    console.log("User 1:", user1);
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
