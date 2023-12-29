import express from "express"
import bodyParser from 'body-parser'
import cors from 'cors'

import auth from "./routes/auth";
import movies from "./routes/movies";

const app = express()
const port = 3001 || process.env.PORT

app.use(bodyParser.urlencoded({ extended: false, limit: '150mb' }))
app.use(bodyParser.json({limit: '150mb'}))
app.use(cors())

app.use(auth)
app.use(movies)


app.listen(port, () => {
    console.log(`Server started on port - ${port}`)
})
