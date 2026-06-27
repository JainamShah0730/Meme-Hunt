import express from "express"
import pool from "../database/pool.js"
import { embed } from "../database/ai.js"

const router = express.Router()

router.post('/search', async (req, res) => {
    try {
        const { query } = req.body

        if (!query || query.trim() === '') {
            return res.status(400).json({ error: "Query is required" })
        }
        const vector = await embed(query)

        const { rows } = await pool.query(`
            SELECT id, name, image_url, tags, 
            ROUND((1-(embedding <=> $1::vector))::numeric, 2) AS similarity
            FROM memes
            ORDER BY embedding <=> $1::vector 
            LIMIT 5 `, [`[${vector.join(',')}]`])

        res.json(rows)
    } catch (err) {
        console.error("Search error:", err.message)
        res.status(500).json({ error: 'Something went wrong' })
    }
})

router.get('/proxy', async (req, res) => {
    try {
        const { url } = req.query
        if (!url) return res.status(400).json({ error: "URL IS required" })

        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        res.set('Content-Type', response.headers.get('content-type'))
        res.send(Buffer.from(buffer))
    } catch (err) {
        console.error("Search error:", err.message)
        res.status(500).json({ error: 'Failed to proxy image' })
    }
})

export default router