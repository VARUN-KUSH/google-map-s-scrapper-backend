import {app} from './app.js'
import userRouter from './routes/user.routes.js'

app.use("/api/v1", userRouter);

export {app}