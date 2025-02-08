import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
    {
        account: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        email: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: '' },
        passwordUpdatedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
