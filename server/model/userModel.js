import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            default: '',
        },
        nickname: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        admin: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);
const User = mongoose.model('User', userSchema);

export default User;
