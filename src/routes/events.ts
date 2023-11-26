import {Prisma} from '@prisma/client'
import {Router, Request, Response} from 'express'
import {authenticateToken} from '../service/jwtService'
import prisma from "../service/prismaService";

const router = Router()

router.get('/events', authenticateToken, async (req: Request, res: Response) => {
    const {id} = req.user
    const {fromDate = new Date(), toDate = new Date()} = req.query
    try {
        const data = await prisma.event.findMany({
            where: {
                authorId: id,
                date: {
                    lte: new Date(toDate as string),
                    gte: new Date(fromDate as string),
                }
            },
            orderBy: [
                {
                    date: 'asc',
                },
                {
                    title: 'asc',
                }
            ]
        })

        res.json(data)
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

router.get('/event/:id', authenticateToken, async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const data = await prisma.event.findUnique({
            where: {
                id,
            },
        })
        res.json(data)
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

router.post('/event', authenticateToken, async (req: Request<any, any, Prisma.EventCreateInput>, res: Response) => {
    const {date, description, title} = req.body
    const {id} = req.user
    try {
        const data = await prisma.event.create({
            data: {
                date: new Date(date),
                authorId: id,
                description,
                title
            }
        })
        res.json(data)
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

router.patch('/event', authenticateToken, async (req: Request<any, any, Prisma.EventUpdateInput>, res: Response) => {
    const {date, description, title, id} = req.body
    const {id: userId} = req.user

    try {
        await prisma.event.update({
            where: {
                id: id as string,
                authorId: userId
            },
            data: {
                ...(date ? {date: new Date(date as string)} : {}),
                ...(description ? {description} : {}),
                ...(title ? {title} : {})
            },
        }).then((data) => {
            res.json(data)
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

router.delete('/event/:id', authenticateToken, (req: Request, res: Response) => {
    const {id} = req.params
    try {
        prisma.event.delete({
            where: {
                id
            }
        }).then((data) => {
            res.json(data)
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

export default router
