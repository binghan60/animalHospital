import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        avatar: { type: String, default: '' },
        account: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        email: { type: String, default: '' },
        name: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: null },
        passwordUpdatedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);
const User = mongoose.model('User', userSchema);
export default User;
