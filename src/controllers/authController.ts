import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role = email === 'admin@autosaas.com' ? 'admin' : 'user';
        const user = await User.create({ name, email, password, role });
        const token = generateToken(user._id.toString());

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Always true for cross-site cookies
            sameSite: 'none', // Required for cross-site cookies
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email || '',
            role: user.role,
            apiKey: user.apiKey,
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await (user as any).comparePassword(password))) {
            const token = generateToken(user._id.toString());

            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // Always true for cross-site cookies
                sameSite: 'none', // Required for cross-site cookies
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email || '',
                role: user.role,
                apiKey: user.apiKey,
                plan: user.plan,
                subscriptionStatus: user.subscriptionStatus,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(0),
    });
    res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: Response) => {
    res.json(req.user);
};
