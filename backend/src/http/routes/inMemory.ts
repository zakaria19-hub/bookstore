import bcrypt from 'bcrypt';
import { Router, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

type MemoryCategory = {
    _id: string;
    name: string;
};

type MemoryBook = {
    _id: string;
    title: string;
    author: string;
    price: number;
    quantity: number;
    published_at: string;
    category: string;
};

type MemoryUser = {
    _id: string;
    fName: string;
    lName: string;
    email: string;
    address: string;
    tel: string;
    passwordHash: string;
};

type MemoryOrderItem = {
    _id: string;
    order: string;
    book: string;
    quantity: number;
};

type MemoryOrder = {
    _id: string;
    user: string;
    orderDate: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
};

const createId = (): string => randomBytes(12).toString('hex');

const createToken = (userId: string, secret: string): string =>
    jwt.sign({ id: userId }, secret, { expiresIn: '7d' });

const createSeedState = async () => {
    const fictionId = createId();
    const technologyId = createId();
    const businessId = createId();
    const demoUserId = createId();

    const categories: MemoryCategory[] = [
        { _id: fictionId, name: 'Fiction' },
        { _id: technologyId, name: 'Technology' },
        { _id: businessId, name: 'Business' },
    ];

    const books: MemoryBook[] = [
        {
            _id: createId(),
            title: 'The Midnight Library',
            author: 'Matt Haig',
            price: 18.99,
            quantity: 12,
            published_at: new Date().toISOString(),
            category: fictionId,
        },
        {
            _id: createId(),
            title: 'Clean Code',
            author: 'Robert C. Martin',
            price: 34.5,
            quantity: 8,
            published_at: new Date().toISOString(),
            category: technologyId,
        },
        {
            _id: createId(),
            title: 'Atomic Habits',
            author: 'James Clear',
            price: 21,
            quantity: 15,
            published_at: new Date().toISOString(),
            category: businessId,
        },
    ];

    const users: MemoryUser[] = [
        {
            _id: demoUserId,
            fName: 'Demo',
            lName: 'User',
            email: 'demo@bookstore.local',
            address: '123 Local Street',
            tel: '+10000000000',
            passwordHash: await bcrypt.hash('demo123', 10),
        },
    ];

    const orders: MemoryOrder[] = [];
    const orderItems: MemoryOrderItem[] = [];

    return { categories, books, users, orders, orderItems };
};

export const createInMemoryRouter = async (secret: string): Promise<Router> => {
    const router = Router();
    const state = await createSeedState();

    const findUser = (userId?: string): MemoryUser | undefined =>
        userId ? state.users.find((user) => user._id === userId) : undefined;

    const buildBookResponse = (book: MemoryBook) => {
        const category = state.categories.find((entry) => entry._id === book.category);
        return {
            ...book,
            category: category ? { _id: category._id, name: category.name } : book.category,
        };
    };

    const buildCategoryResponse = (category: MemoryCategory) => ({
        ...category,
        books: state.books
            .filter((book) => book.category === category._id)
            .map((book) => buildBookResponse(book)),
    });

    const buildOrderResponse = (order: MemoryOrder) => {
        const user = state.users.find((entry) => entry._id === order.user);
        const items = state.orderItems
            .filter((entry) => entry.order === order._id)
            .map((entry) => {
                const book = state.books.find((candidate) => candidate._id === entry.book);
                return {
                    _id: entry._id,
                    quantity: entry.quantity,
                    book: book
                        ? {
                            _id: book._id,
                            title: book.title,
                            author: book.author,
                            price: book.price,
                        }
                        : null,
                };
            })
            .filter((entry) => entry.book !== null);

        return {
            ...order,
            user: user
                ? { fName: user.fName, lName: user.lName, email: user.email }
                : undefined,
            orderItems: items,
        };
    };

    const requireUser = (req: AuthenticatedRequest, res: Response): MemoryUser | undefined => {
        const user = findUser(req.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                code: 401,
                error: 'Unauthorized',
            });
            return undefined;
        }

        return user;
    };

    router.get('/books', (_req, res) => {
        res.status(200).json({
            message: 'success',
            status: 200,
            data: state.books.map((book) => buildBookResponse(book)),
        });
    });

    router.post('/books', authMiddleware, (req, res) => {
        const { title, author, price, category_name, quantity } = req.body;
        if (!author || !title || !price || !category_name) {
            return res.status(400).json({
                success: false,
                code: 400,
                details: ['All this fields is required : author - title - price - category_name'],
            });
        }

        const category = state.categories.find((entry) => entry.name === category_name);
        if (!category) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'Category name is not valid',
            });
        }

        const book: MemoryBook = {
            _id: createId(),
            title,
            author,
            price: Number(price),
            quantity: Number(quantity) || 1,
            published_at: new Date().toISOString(),
            category: category._id,
        };
        state.books.push(book);

        return res.json({
            success: true,
            code: 200,
            data: [buildBookResponse(book)],
        });
    });

    router.get('/books/:id', (req, res) => {
        const book = state.books.find((entry) => entry._id === req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        return res.json({
            success: true,
            code: 200,
            data: [buildBookResponse(book)],
        });
    });

    router.put('/books/:id', authMiddleware, (req, res) => {
        const book = state.books.find((entry) => entry._id === req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        const { title, author, price, quantity } = req.body;
        if (title) book.title = title;
        if (author) book.author = author;
        if (price != null) book.price = Number(price);
        if (quantity != null) book.quantity = Number(quantity);

        return res.json({
            success: true,
            code: 200,
            data: [buildBookResponse(book)],
        });
    });

    router.delete('/books/:id', authMiddleware, (req, res) => {
        const index = state.books.findIndex((entry) => entry._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        state.books.splice(index, 1);
        state.orderItems = state.orderItems.filter((entry) => entry.book !== req.params.id);
        return res.status(204).send();
    });

    router.post('/categories', authMiddleware, (req, res) => {
        const name = String(req.body.name || '').trim();
        if (!name) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'name is required',
            });
        }

        const exists = state.categories.some((entry) => entry.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: 'name already exist add new name',
            });
        }

        const category: MemoryCategory = { _id: createId(), name };
        state.categories.push(category);
        return res.json({
            success: true,
            message: 'success',
            code: 200,
            data: [category],
        });
    });

    router.get('/categories', (_req, res) => {
        res.json({
            success: true,
            code: 200,
            data: state.categories.map((category) => buildCategoryResponse(category)),
        });
    });

    router.get('/categories/:id', (req, res) => {
        const category = state.categories.find((entry) => entry._id === req.params.id);
        if (!category) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'category not found',
            });
        }

        return res.json({
            success: true,
            code: 200,
            data: [buildCategoryResponse(category)],
        });
    });

    router.put('/categories/:id', authMiddleware, (req, res) => {
        const category = state.categories.find((entry) => entry._id === req.params.id);
        const name = String(req.body.name || '').trim();

        if (!category) {
            return res.status(404).json({
                success: false,
                code: 404,
                error: 'category not found',
            });
        }
        if (!name) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'name is required',
            });
        }

        const exists = state.categories.some(
            (entry) => entry._id !== category._id && entry.name.toLowerCase() === name.toLowerCase()
        );
        if (exists) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: 'name already exists',
            });
        }

        category.name = name;
        return res.json({ success: true, code: 200, data: [category] });
    });

    router.delete('/categories/:id', authMiddleware, (req, res) => {
        const index = state.categories.findIndex((entry) => entry._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({
                success: false,
                code: 404,
                error: 'category not found',
            });
        }

        state.categories.splice(index, 1);
        return res.status(204).send();
    });

    router.post('/auth/register', async (req, res) => {
        const { fName, lName, email, address, tel, password } = req.body;

        if (!fName || !lName || !email || !address || !tel || !password) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'fName, lName, email, address, tel and password are required',
            });
        }
        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'password must be at least 6 characters',
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = state.users.find((user) => user.email === normalizedEmail);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                code: 409,
                error: 'email already registered',
            });
        }

        const user: MemoryUser = {
            _id: createId(),
            fName,
            lName,
            email: normalizedEmail,
            address,
            tel,
            passwordHash: await bcrypt.hash(String(password), 10),
        };
        state.users.push(user);

        const token = createToken(user._id, secret);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            code: 201,
            data: {
                user: {
                    _id: user._id,
                    fName: user.fName,
                    lName: user.lName,
                    email: user.email,
                    address: user.address,
                    tel: user.tel,
                },
                token,
            },
        });
    });

    router.post('/auth/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'email and password are required',
            });
        }

        const user = state.users.find((entry) => entry.email === String(email).trim().toLowerCase());
        if (!user) {
            return res.status(401).json({
                success: false,
                code: 401,
                error: 'invalid email or password',
            });
        }

        const isMatch = await bcrypt.compare(String(password), user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 401,
                error: 'invalid email or password',
            });
        }

        const token = createToken(user._id, secret);
        return res.json({
            success: true,
            message: 'Login successful',
            code: 200,
            data: {
                user: {
                    _id: user._id,
                    fName: user.fName,
                    lName: user.lName,
                    email: user.email,
                    address: user.address,
                    tel: user.tel,
                },
                token,
            },
        });
    });

    router.post('/orders', authMiddleware, (req: AuthenticatedRequest, res) => {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'items array with bookId and quantity is required',
            });
        }

        let total = 0;
        const orderLines: MemoryOrderItem[] = [];

        for (const item of items) {
            const bookId = String(item.bookId || '');
            const quantity = Number(item.quantity);
            const book = state.books.find((entry) => entry._id === bookId);

            if (!bookId || !quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'Each item must have bookId and quantity (min 1)',
                });
            }
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

            total += book.price * quantity;
            orderLines.push({
                _id: createId(),
                order: '',
                book: bookId,
                quantity,
            });
        }

        const order: MemoryOrder = {
            _id: createId(),
            user: user._id,
            orderDate: new Date().toISOString(),
            status: 'pending',
            total,
        };
        state.orders.push(order);
        orderLines.forEach((entry) => {
            entry.order = order._id;
            state.orderItems.push(entry);
        });

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            code: 201,
            data: [buildOrderResponse(order)],
        });
    });

    router.get('/orders', authMiddleware, (req: AuthenticatedRequest, res) => {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        return res.json({
            success: true,
            code: 200,
            data: state.orders
                .filter((order) => order.user === user._id)
                .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
                .map((order) => buildOrderResponse(order)),
        });
    });

    router.get('/orders/admin/all', authMiddleware, (_req, res) => {
        return res.json({
            success: true,
            code: 200,
            data: [...state.orders]
                .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
                .map((order) => buildOrderResponse(order)),
        });
    });

    router.patch('/orders/:id/status', authMiddleware, (req, res) => {
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        const status = String(req.body.status || '');
        const order = state.orders.find((entry) => entry._id === req.params.id);

        if (!order || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                code: 400,
                error: 'Valid status required: pending, confirmed, shipped, delivered, cancelled',
            });
        }

        order.status = status as MemoryOrder['status'];
        return res.json({
            success: true,
            code: 200,
            data: [buildOrderResponse(order)],
        });
    });

    router.get('/orders/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        const order = state.orders.find((entry) => entry._id === req.params.id && entry.user === user._id);
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
            data: [buildOrderResponse(order)],
        });
    });

    return router;
};
