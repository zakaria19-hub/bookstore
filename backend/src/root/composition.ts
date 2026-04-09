import type { Model } from "mongoose"
import BooksController from "../http/controllers/Books.Controller.js"
import { Book, type IBookDocument } from "../models/Book.js"
import { Category, type ICategoryDocument } from "../models/Category.js";
import { Order, type IOrderDocument } from "../models/Order.js";
import { OrderItem, type IOrderItemDocument } from "../models/OrderItem.js";
import CategoryController from "../http/controllers/Category.Controller.js";
import UserController from "../http/controllers/User.Controller.js";
import OrderController from "../http/controllers/Order.Controller.js";
import { User, type IUserDocument } from "../models/User.js";


export const createBookController = (): BooksController => {
    const categoryModel: Model<ICategoryDocument> = Category;
    const bookModel: Model<IBookDocument> = Book;
    return new BooksController(bookModel, categoryModel)
}


export const createCategoryController = (): CategoryController => {
    const categoryModel: Model<ICategoryDocument> = Category;
    return new CategoryController(categoryModel)
}

export const createUserController = (): UserController => {
    const userModel: Model<IUserDocument> = User;
    return new UserController(userModel)
}

export const createOrderController = (): OrderController => {
    const orderModel: Model<IOrderDocument> = Order;
    const orderItemModel: Model<IOrderItemDocument> = OrderItem;
    const bookModel: Model<IBookDocument> = Book;
    return new OrderController(orderModel, orderItemModel, bookModel)
}
