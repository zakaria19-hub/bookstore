import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IBook {
    title: string;
    author: string;
    price: number;
    quantity: number;
    published_at?: Date;
    category: Types.ObjectId;
}

export interface IBookDocument extends IBook, Document { }

const BookSchema: Schema<IBookDocument> = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        published_at: {
            type: Date,
            default: Date.now,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export const Book: Model<IBookDocument> =
    mongoose.model<IBookDocument>("Book", BookSchema);