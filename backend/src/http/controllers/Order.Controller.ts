import type { Response } from 'express';
import type { Model } from 'mongoose';
import type { IOrderDocument } from '../../models/Order.js';
import type { IOrderItemDocument } from '../../models/OrderItem.js';
import type { IBookDocument } from '../../models/Book.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Types } from 'mongoose';

class OrderController {
    private _orderModel: Model<IOrderDocument>;
    private _orderItemModel: Model<IOrderItemDocument>;
    private _bookModel: Model<IBookDocument>;

    constructor(
        orderModel: Model<IOrderDocument>,
        orderItemModel: Model<IOrderItemDocument>,
        bookModel: Model<IBookDocument>
    ) {
        this._orderModel = orderModel;
        this._orderItemModel = orderItemModel;
        this._bookModel = bookModel;
    }

    createOrder = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response> => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    error: 'Unauthorized',
                });
            }

            const { items } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'items array with bookId and quantity is required',
                });
            }

            const itemsToCreate: { bookId: string; quantity: number; price: number }[] = [];
            let total = 0;

            for (const item of items) {
                const { bookId, quantity } = item;
                if (!bookId || !quantity || quantity < 1) {
                    return res.status(400).json({
                        success: false,
                        code: 400,
                        error: 'Each item must have bookId and quantity (min 1)',
                    });
                }

                const book = await this._bookModel.findById(bookId);
                if (!book) {
                    return res.status(404).json({
                        success: false,
                        code: 404,
                        error: `Book not found: ${bookId}`,
                    });
                }

                if (book.quantity < quantity) {
                    return res.status(400).json({
                        success: false,
                        code: 400,
                        error: `Insufficient stock for "${book.title}". Available: ${book.quantity}`,
                    });
                }

                itemsToCreate.push({ bookId, quantity, price: book.price });
                total += book.price * quantity;
            }

            const order = await this._orderModel.create({
                user: userId,
                total,
                status: 'pending',
            });

            await this._orderItemModel.insertMany(
                itemsToCreate.map(({ bookId, quantity }) => ({
                    order: order._id,
                    book: bookId,
                    quantity,
                }))
            );

            const populatedOrder = await this._orderModel
                .findById(order._id)
                .populate({
                    path: 'orderItems',
                    populate: { path: 'book', select: 'title author price' },
                })
                .populate('user', 'fName lName email')
                .exec();

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                code: 201,
                data: [populatedOrder],
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    getOrders = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response> => {

        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    error: 'Unauthorized',
                });
            }

          

            const orders = await this._orderModel.find({ user: new Types.ObjectId(userId) })
                .populate({
                    path: 'orderItems',
                    populate: { path: 'book', select: 'title author price' },
                })
                .sort({ orderDate: -1 })
                .exec();

            return res.json({
                success: true,
                code: 200,
                data: orders,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    getAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        try {
            const orders = await this._orderModel
                .find({})
                .populate('user', 'fName lName email')
                .populate({
                    path: 'orderItems',
                    populate: { path: 'book', select: 'title author price' },
                })
                .sort({ orderDate: -1 })
                .exec();
            return res.json({ success: true, code: 200, data: orders });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : undefined;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            if (!id || !status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'Valid status required: pending, confirmed, shipped, delivered, cancelled',
                });
            }

            const order = await this._orderModel.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate('user', 'fName lName email');

            if (!order) {
                return res.status(404).json({
                    success: false,
                    code: 404,
                    error: 'Order not found',
                });
            }

            return res.json({ success: true, code: 200, data: [order] });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    getOrder = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response> => {
        try {
            const userId = req.userId;
            const id = typeof req.params.id === 'string' ? req.params.id : undefined;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    error: 'Unauthorized',
                });
            }
            if (!id) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'Invalid order id',
                });
            }

            const order = await this._orderModel
                .findOne({ _id: new Types.ObjectId(id), user: new Types.ObjectId(userId) })
                .populate({
                    path: 'orderItems',
                    populate: { path: 'book', select: 'title author price' },
                })
                .populate('user', 'fName lName email')
                .exec();

            if (!order) {
                return res.status(404).json({
                    success: false,
                    code: 404,
                    error: 'Order not found',
                });
            }

            return res.json({
                success: true,
                code: 200,
                data: [order],
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };
}

export default OrderController;
