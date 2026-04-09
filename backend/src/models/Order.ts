import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrder {
    user: Types.ObjectId;
    orderDate: Date;
    status: string;
    total: number;
}

export interface IOrderDocument extends IOrder, Document {}

const OrderSchema = new Schema<IOrderDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate: OrderItem junction - many-to-many Order ↔ Book via OrderItem
OrderSchema.virtual('orderItems', {
    ref: 'OrderItem',
    localField: '_id',
    foreignField: 'order',
});

export const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>(
    'Order',
    OrderSchema
);
