import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

const router = express.Router();
const users: any[] = [];

router.post('/signup', (async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        if (users.find(user => user.email === email)) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword
        };

        users.push(newUser);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        const response: ApiResponse<{ token: string; user: Omit<typeof newUser, 'password'> }> = {
            success: true,
            data: {
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email
                }
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user'
        });
    }
}) as RequestHandler);


router.post('/login', (async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        const response: ApiResponse<{ token: string; user: Omit<typeof user, 'password'> }> = {
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                }
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
}) as RequestHandler);

export default router;
