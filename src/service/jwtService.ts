import jwt from 'jsonwebtoken';
import {Request, Response} from 'express';
import {sendMessage} from "../helpers/sendMessage";
export const generateAccessToken = (data:any, expiresIn = '1800s') => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn });
}

export const authenticateToken =(req: Request<any, any, any >, res: Response<any>, next) => {
    const authHeader = req.headers['authentication'] as string
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, data: any) => {
        if (err) return res.sendStatus(403).json(sendMessage('Invalid token'))
        req.user = data.user || data
        next()
    })
}
