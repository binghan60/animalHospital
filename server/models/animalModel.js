import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        weight: [{ date: { type: Date }, value: { type: Number } }],
        birthday: { type: Date },
        sterilized: { type: Boolean },
        breed: { type: String },
        bloodType: { type: String, enum: ['A', 'B', 'AB', 'O'] },
        type: { type: String, enum: ['cat', 'dog', 'other'] },
        insulinBrand: { type: String },
        admissionDate: { type: Date },
    },
    { timestamp: true }
);
const Animal = mongoose.model('Animal', animalSchema);
export default Animal;
