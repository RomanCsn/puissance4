import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { ZodError } from 'zod'
import { router } from './routes.ts'

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.use(router)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({ error: 'ValidationError', details: err.flatten() })
    }

    console.error(err)

    const isProd = process.env.NODE_ENV === 'production'
    const message = err instanceof Error ? err.message : 'Unknown error'

    return res.status(500).json({
        error: 'InternalServerError',
        ...(isProd ? {} : { message }),
    })
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`)
})