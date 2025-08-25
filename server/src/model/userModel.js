import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  aadhaar: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);