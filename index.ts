import express from "express"
import bodyParser from 'body-parser'
import cors from 'cors'

import auth from "./src/routes/auth";
import events from "./src/routes/events";

const app = express()
const port = 3001 || process.env.PORT

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use(auth)
app.use(events)

app.listen(port, () => {
    console.log(`Server started on port - ${port}`)
})
