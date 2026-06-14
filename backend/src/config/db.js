const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // رابط أطلس الخاص بك مباشرة لحل مشكلة عدم قراءة ملف الـ .env
    const atlasURI = "mongodb+srv://admin:secret123@cluster0.tnjvura.mongodb.net/graduation_hub?retryWrites=true&w=majority&appName=Cluster0";
    
    const conn = await mongoose.connect(atlasURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB error ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;