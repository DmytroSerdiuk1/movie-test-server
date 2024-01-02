import {Prisma} from '@prisma/client'
import {Router, Request, Response} from 'express'
import prisma from "../service/prismaService";
import {authenticateToken, generateAccessToken} from "../service/jwtService";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import {sendMessage} from '../helpers/sendMessage';

const router = Router()

router.post('/sign-in', async (req: Request<any, any, Prisma.UserCreateInput>, res: Response) => {
    const {name, password} = req.body
    try {
        const data = await prisma.user.findUnique({
            where: {
                name,
            }
        }).catch(() => {
            res.status(400).json(sendMessage('Name or password is incorrect'))
        })

        if (!data) return res.status(400).json(sendMessage("Name or password is incorrect"))

        bcrypt.compare(password, data.password, (err, result) => {
            if (err) res.status(400).json(err.message)
            if (result) {
                const accessToken = generateAccessToken(data, process.env.ACCESS_TOKEN_EXPIRED_IN)
                const refreshToken = generateAccessToken(data, process.env.REFRESH_TOKEN_EXPIRED_IN)
                console.log('SignIn:', data.name, data.id)
                res.json({
                    user: {
                        id: data.id,
                        name: data.name
                    },
                    accessToken,
                    refreshToken
                })
            } else {
                res.status(400).json(sendMessage("Name or password is incorrect"))
            }
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(sendMessage(e.message))
    }
})

router.post('/sign-up', async (req: Request<any, any, Prisma.UserCreateInput>, res: Response) => {
    const {name, password} = req.body
    try {
        bcrypt.hash(password, Number(process.env.PASSWORD_SALT_ROUNDS), async (err, password) => {
            if (err) throw err
            await prisma.user.create({
                data: {
                    name,
                    password
                },
                select: {
                    id: true,
                    name: true,
                }
            }).then((data) => {
                const accessToken = generateAccessToken(data, process.env.ACCESS_TOKEN_EXPIRED_IN)
                const refreshToken = generateAccessToken(data, process.env.REFRESH_TOKEN_EXPIRED_IN)
                console.log('SignUp:', data.name, data.id)

                res.json({
                    user: data,
                    accessToken,
                    refreshToken
                })
            }).catch(() => {
                res.status(400).json(sendMessage('User already exist'))
            })
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(sendMessage(e.message))
    }
})


router.post('/check-user-exist', authenticateToken, async (req: Request<any, any, Prisma.UserCreateInput>, res: Response) => {
    const {name} = req.user
    console.log('CheckUserExist:', name, req.user.id)
    try {
        const data = await prisma.user.findUnique({
            where: {
                name,
            },
        }).catch(() => {
            res.status(400).json(sendMessage('User not found'))
        })

        res.json({
            user: data
        })
    } catch (e) {
        console.log(e)
        res.sendStatus(400).json(sendMessage(e.message))
    }
})

router.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    if (!refreshToken) {
        return res.status(401).json(sendMessage("No refresh token provided"));
    }
    try {
        const user: any = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
        const accessToken = jwt.sign({user}, process.env.TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRED_IN});
        console.log('Refresh:', user?.name, user.id)

        res.json({
            user,
            accessToken
        })
    } catch (e) {
        console.log(e)
        res.sendStatus(401).json(sendMessage(e.message))
    }
});


export default router
