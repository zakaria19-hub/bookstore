import type { Model } from "mongoose";
import { Types } from "mongoose";
import type { ICategoryDocument } from "../../models/Category.js";
import type { Request, Response } from "express";

class CategoryController {
    private _categoryModel: Model<ICategoryDocument>;

    constructor(categoryModel: Model<ICategoryDocument>) {
        this._categoryModel = categoryModel;
    }


    createCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const name: string = req.body.name;

            if (!name) return res.status(400).json({
                success: false,
                code: 400,
                error: 'name is required',
            })

            const nameExit: object | null = await this._categoryModel.findOne({ name });



            if (nameExit) return res.status(409).json({
                success: false,
                code: 409,
                error: 'name already exist add new name',
            })

            const categoryInfo = await this._categoryModel.create({
                name,
            });

            return res.json({
                success: true,
                message: 'success',
                code: 200,
                data: [categoryInfo]
            });
        } catch (error) {
            return res.json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    }


    getCategory = async (req: Request, res: Response) => {

        const catId = req.params.id;

        const category = await this._categoryModel.findById(catId, { _id: true, name: true })
            .populate("books", "_id title author price quantity published_at")
            .exec();

        if (!category) return res.status(400).json({
            success: false,
            code: 400,
            error: 'category not found'
        })

        return res.json({
            success: true,
            code: 200,
            data: [
                category
            ]
        });

    }

    getCategories = async (req: Request, res: Response) => {
        try {
            const categories = await this._categoryModel
                .find({})
                .populate("books", "_id title author price quantity published_at")
                .exec();
            if (!categories) return res.status(400).json({
                success: false,
                code: 400,
                error: 'categories not found'
            })
            return res.json({ success: true, code: 200, data: categories });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    updateCategory = async (req: Request, res: Response) => {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : undefined;
            const { name } = req.body;

            if (!id) return res.status(400).json({ success: false, code: 400, error: 'Invalid category id' });
            if (!name) return res.status(400).json({
                success: false,
                code: 400,
                error: 'name is required',
            });

            const existing = await this._categoryModel.findOne({ name, _id: { $ne: new Types.ObjectId(id) } });
            if (existing) return res.status(409).json({
                success: false,
                code: 409,
                error: 'name already exists',
            });

            const category = await this._categoryModel.findByIdAndUpdate(id, { name }, { new: true });
            if (!category) return res.status(404).json({
                success: false,
                code: 404,
                error: 'category not found',
            });

            return res.json({ success: true, code: 200, data: [category] });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    deleteCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const category = await this._categoryModel.findByIdAndDelete(id);
            if (!category) return res.status(404).json({
                success: false,
                code: 404,
                error: 'category not found',
            });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };
}

export default CategoryController;