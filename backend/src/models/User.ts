import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import type { NextFunction } from 'express';

export interface IUser {
    fName: string;
    lName: string;
    email: string;
    address: string;
    tel: string;
    password: string;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
    {
        fName: {
            type: String,
            required: true,
            trim: true,
        },
        lName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        tel: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(this: IUserDocument) {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
    'User',
    UserSchema
);
