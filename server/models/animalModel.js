import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
    {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        name: { type: String, required: true },
        gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
        weight: [{ date: { type: Date }, value: { type: Number, default: 0 } }],
        birthday: { type: Date },
        sterilized: { type: Boolean, default: false },
        breed: { type: String, default: '' },
        bloodType: { type: String, enum: ['A', 'B', 'AB', 'O', ''], default: '' },
        type: { type: String, enum: ['cat', 'dog', 'other', ''], default: '' },
        insulinBrand: { type: String, default: '' },
        admissionDate: { type: Date, default: Date.now },
        sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    },
    { timestamps: true }
);
const Animal = mongoose.model('Animal', animalSchema);
export default Animal;
