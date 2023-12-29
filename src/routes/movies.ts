import {Prisma} from '@prisma/client'
import {Router, Request, Response} from 'express'
import {authenticateToken} from '../service/jwtService'
import prisma from "../service/prismaService";
import cloudinaryClient from "../util/cloudinary";
import {pagination} from "../helpers/pagination";
import {sendMessage} from "../helpers/sendMessage";

const router = Router()

router.get('/movies', authenticateToken, async (req: Request, res: Response) => {
    const {id} = req.user
    const {page = 1, pageSize = 8} = req.query

    try {
        const data = await prisma.movie.findMany({
            where: {
                userId: id
            }
        })

        res.json(pagination(data, +pageSize, +page))
    } catch (e) {
        console.log(e)
        res.sendStatus(400).json(sendMessage(e.message))
    }
})

router.get('/movie/:id', authenticateToken, async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const data = await prisma.movie.findUnique({
            where: {
                id,
            }
        })
        res.json(data)
    } catch (e) {
        console.log(e)
        res.sendStatus(400).json(sendMessage(e.message))
    }
})

router.post('/movie', authenticateToken, async (req: Request<any, any, Prisma.MovieCreateInput>, res: Response) => {
    const {year, title, image} = req.body
    const {id} = req.user
    try {
        const uploadImageData = cloudinaryClient.uploader.upload(image, {
            folder: 'movie',
        })
        uploadImageData.then(async (imageData) => {
            const data = await prisma.movie.create({
                data: {
                    title,
                    year,
                    image: imageData.url,
                    userId: id
                }
            })
            res.json(data)
        }).catch((e) => {
            console.log(e)
            res.sendStatus(400).json(sendMessage(e.message))
        })
    } catch (e) {
        console.log(e)
        res.sendStatus(400).json(sendMessage(e.message))
    }
})

router.patch('/movie/:id', authenticateToken, async (req: Request<any, any, Prisma.MovieUpdateInput>, res: Response) => {
    const {year, title} = req.body
    const {id} = req.params
    const {id: userId} = req.user
    try {
        await prisma.movie.update({
            where: {
                id,
                userId,
            },
            data: {
                year: year,
                title: title,
            }
        }).then((data) => {
            res.json(data)
        })
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

router.delete('/movie/:id', authenticateToken, (req: Request, res: Response) => {
    const {id} = req.params
    try {
        prisma.movie.delete({
            where: {
                id,
                userId: req.user.id
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