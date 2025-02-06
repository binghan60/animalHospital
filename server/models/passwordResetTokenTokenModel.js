import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
    accountType: { type: String, enum: ['hospital', 'user'], required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
});

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
