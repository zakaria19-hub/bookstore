import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrderItem {
    order: Types.ObjectId;
    book: Types.ObjectId;
    quantity: number;
}

export interface IOrderItemDocument extends IOrderItem, Document {}

const OrderItemSchema = new Schema<IOrderItemDocument>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        book: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

export const OrderItem: Model<IOrderItemDocument> =
    mongoose.model<IOrderItemDocument>('OrderItem', OrderItemSchema);
