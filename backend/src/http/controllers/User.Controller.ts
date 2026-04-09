import type { Request, Response } from 'express';
import type { Model } from 'mongoose';
import type { IUserDocument } from '../../models/User.js';
import jwt from 'jsonwebtoken';

class UserController {
    private _userModel: Model<IUserDocument>;

    constructor(userModel: Model<IUserDocument>) {
        this._userModel = userModel;
    }

    private generateToken(userId: string): string {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
    }

    register = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { fName, lName, email, address, tel, password } = req.body;

            if (!fName || !lName || !email || !address || !tel || !password) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'fName, lName, email, address, tel and password are required',
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'password must be at least 6 characters',
                });
            }

            const existingUser = await this._userModel.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    code: 409,
                    error: 'email already registered',
                });
            }

            const user = await this._userModel.create({ fName, lName, email, address, tel, password });
            const token = this.generateToken(user._id.toString());

            return res.status(201).json({
                
                success: true,
                message: 'User registered successfully',
                code: 201,
                data: {
                    user: { _id: user._id, fName: user.fName, lName: user.lName, email: user.email, address: user.address, tel: user.tel },
                    token,
                },
            });
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: 'internal server error',
                code: 500,
            });
        }
    };

    login = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    error: 'email and password are required',
                });
            }

            const user = await this._userModel
                .findOne({ email })
                .select('+password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    error: 'invalid email or password',
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    error: 'invalid email or password',
                });
            }

            const token = this.generateToken(user._id.toString());

            return res.json({
                success: true,
                message: 'Login successful',
                code: 200,
                data: {
                    user: { _id: user._id, fName: user.fName, lName: user.lName, email: user.email, address: user.address, tel: user.tel },
                    token,
                },
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

export default UserController;
