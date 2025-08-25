import User from '../model/userModel.js';

const saveuserDetails = async (req, res) => {
  try {
    const { name, phone, aadhaar } = req.body;

    if (!name || !phone || !aadhaar) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ phone });
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this phone' });
    }

    const user = new User({ name, phone, aadhaar });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export default { saveuserDetails };