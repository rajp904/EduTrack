import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: false // We maintain indexes explicitly through index script or Mongoose
    });
    console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(` MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
}
