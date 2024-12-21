import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
    {
        account: { type: String, required: true },
        password: { type: String, required: true },
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        email: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
