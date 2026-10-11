import mongoose from 'mongoose';
import UserModel from './server/ride-service/mongo_api/models/User.model';

mongoose.connect('mongodb://127.0.0.1:27017/taxi_db').then(async () => {
  const users = await UserModel.find({});
  console.log("All users:");
  users.forEach(u => console.log(u.email, u.roles, u.is_available, u.location));
  process.exit(0);
});
