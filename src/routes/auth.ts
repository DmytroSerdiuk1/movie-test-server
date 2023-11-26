import {Prisma} from '@prisma/client'
import {Router, Request, Response} from 'express'
import prisma from "../service/prismaService";
import {authenticateToken, generateAccessToken} from "../service/jwtService";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const router = Router()

router.post('/sign-in', async (req: Request<any, any, Prisma.UserCreateInput>, res: Response) => {
    const {email, password} = req.body
    try {
        const data = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        if (!data) return res.status(400).json({
            message: 'User not found!',
        })

        bcrypt.compare(password, data.password, (err, result) => {
            if (err) res.status(400).json(err.message)
            if (result) {
                const accessToken = generateAccessToken(data, process.env.ACCESS_TOKEN_EXPIRED_IN)
                const refreshToken = generateAccessToken(data, process.env.REFRESH_TOKEN_EXPIRED_IN)
                console.log('SignIn:', data.email, data.id)
                res.json({user: data, accessToken, refreshToken})
            } else {
                res.status(400).json({
                    message: 'Email or password is incorrect!',
                })
            }
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

router.post('/sign-up', async (req: Request<any, any, Prisma.UserCreateInput>, res: Response) => {
    const {email, password, firstName, lastName} = req.body
    try {
        bcrypt.hash(password, Number(process.env.PASSWORD_SALT_ROUNDS), async (err, password) => {
            if (err) throw err
            await prisma.user.create({
                data: {
                    email,
                    password,
                    firstName,
                    lastName
                }
            }).then((data) => {
                const accessToken = generateAccessToken(data, process.env.ACCESS_TOKEN_EXPIRED_IN)
                const refreshToken = generateAccessToken(data, process.env.REFRESH_TOKEN_EXPIRED_IN)
                console.log('SignUp:', data.email, data.id)

                res.json({
                    user: data,
                    accessToken,
                    refreshToken
                })
            })
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})


router.post('/check-user-exist', authenticateToken, async (req: Request<any, any, Prisma.UserCreateInput>, res: Response) => {
    const {email} = req.user
    console.log('CheckUserExist:', email, req.user.id)
    try {
        const data = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        res.json({
            user: data
        })
    } catch (e) {
        console.log(e)
        res.sendStatus(400).json(e)
    }
})

router.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    if (!refreshToken) {
        return res.status(401).json({
            message: 'Access Denied. No refresh token provided.',
        });
    }
    try {
        const user: any = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
        const accessToken = jwt.sign({user}, process.env.TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN});
        console.log('Refresh:', user?.email, user.id)

        res.json({
            user,
            accessToken
        })
    } catch (e) {
        console.log(e)
        return res.status(400).send('Invalid refresh token.');
    }
});


export default router
