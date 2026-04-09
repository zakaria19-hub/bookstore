import { model, Schema, Document, Model } from "mongoose";

export interface ICategory {
    name: string
}

export interface ICategoryDocument extends ICategory, Document { };

const CategorySchema = new Schema<ICategoryDocument>({
    name: { type: String, required: true, trim: true }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate: books that belong to this category
CategorySchema.virtual('books', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'category'
});




export const Category: Model<ICategoryDocument> = model('Category', CategorySchema)