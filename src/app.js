import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import homeRouter from './routes/home.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/home", homeRouter)

// http://localhost:8000/api/v1/users/register

export {app}