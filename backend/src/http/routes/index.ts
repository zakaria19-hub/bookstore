
import { Router, type Request, type Response } from 'express'
import { createBookController, createCategoryController, createUserController, createOrderController } from '../../root/composition.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router()

const bookController = createBookController();
const categoryController = createCategoryController();
const userController = createUserController();
const orderController = createOrderController();

// book routes

router.get('/books', bookController.getBooks);
router.post('/books', authMiddleware, bookController.createBook);
router.get('/books/:id', bookController.getBook);
router.put('/books/:id', authMiddleware, bookController.updateBook);
router.delete('/books/:id', authMiddleware, bookController.deleteBook);

// category routes

router.post('/categories', authMiddleware, categoryController.createCategory);
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategory);
router.put('/categories/:id', authMiddleware, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory);

// auth routes

router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);

// order routes (auth required)

router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders', authMiddleware, orderController.getOrders);
router.get('/orders/admin/all', authMiddleware, orderController.getAllOrders);
router.patch('/orders/:id/status', authMiddleware, orderController.updateOrderStatus);
router.get('/orders/:id', authMiddleware, orderController.getOrder);


export default router;