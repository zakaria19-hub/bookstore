import type { Request, Response } from "express"
import { type IBookDocument } from "../../models/Book.js";
import type { Model } from "mongoose";
import type { ICategoryDocument } from "../../models/Category.js";




class BooksController {

    // Class Variables declarations;
    private _bookModel: Model<IBookDocument>;
private _categoryModel: Model<ICategoryDocument>;


    constructor(bookModel: Model<IBookDocument>, categoryModel: Model<ICategoryDocument>) {
        this._bookModel = bookModel;
        this._categoryModel = categoryModel;

    }


    getBooks = async (_req: Request, res: Response): Promise<Response> => {
        try {
            const books = await this._bookModel.find().populate('category', 'name');
            return res.status(200).json({
                message: 'success',
                status: 200,
                data: books
            });
        } catch (error) {
            return res.status(500).json({
                message: 'internal server error please try again.',
                status: 500,
            });

        }
    }

    createBook = async (req: Request, res: Response): Promise<Response> => {

        try {
            const { title, author, price, category_name, quantity } = req.body;

            if (!author || !title || !price || !category_name) return res.status(400).json({
                success: false,
                code: 400,
                details: [
                    'All this fields is required : author - title - price - category_name',
                ]
            })

            const category = await this._categoryModel.findOne({ name: category_name })

            if (!category) return res.status(400).json({
                success: false,
                code: 400,
                error: 'Category name is not valid',
            })

            const createdBook = await this._bookModel.create({
                title,
                author,
                price,
                category: category._id,
                quantity: (quantity as number) || 1
            })

            return res.json({
                success: true,
                code: 200,
                data: [
                    createdBook
                ]
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: 'internal server error please try again.',
                status: 500,
            });

        }



    }

    getBook = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            const book = await this._bookModel.findById(id).populate('category', 'name');
            if (!book) {
                return res.status(404).json({ success: false, message: "Book not found" });
            }

            return res.json({
                success: true,
                code: 200,
                data: [book],
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error please try again.',
                status: 500,
            });
        }
    }

    updateBook = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { title, author, price, quantity } = req.body;

            const book = await this._bookModel.findByIdAndUpdate(
                id,
                { $set: { ...(title && { title }), ...(author && { author }), ...(price != null && { price }), ...(quantity != null && { quantity }) } },
                { new: true, runValidators: true }
            );

            if (!book) {
                return res.status(404).json({ success: false, message: "Book not found" });
            }

            return res.json({
                success: true,
                code: 200,
                data: [book],
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error please try again.',
                status: 500,
            });
        }
    }

    deleteBook = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;

            const book = await this._bookModel.findByIdAndDelete(id);
            if (!book) {
                return res.status(404).json({ success: false, message: "Book not found" });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error please try again.',
                status: 500,
            });
        }
    }


}

export default BooksController