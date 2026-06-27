import 'dotenv/config'
import express from "express"
import cors from "cors"
import memesRouter from "./routes/memes.js"

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use('/api/memes', memesRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})