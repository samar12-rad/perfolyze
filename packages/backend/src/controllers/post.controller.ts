import { Request, Response } from 'express';

export const getPosts = (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Post route is working',
        posts: [],
    });
};
