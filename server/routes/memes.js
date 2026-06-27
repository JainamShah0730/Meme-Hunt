import express from 'express'
import pool from '../database/pool.js'
import { embed } from '../database/ai.js'

const router = express.Router()
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body

        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Query is required' })
        }

        // Set a timeout so the request doesn't hang forever
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Embedding timed out')), 15000)
        )

        const vector = await Promise.race([
            embed(query),
            timeoutPromise
        ])

        const { rows } = await pool.query(`
      SELECT id, name, image_url, tags,
      ROUND((1 - (embedding <=> $1::vector))::numeric, 2) AS similarity
      FROM memes
      ORDER BY embedding <=> $1::vector
      LIMIT 5
    `, [`[${vector.join(',')}]`])

        res.json(rows)
    } catch (err) {
        console.error('Search error:', err.message)
        res.status(500).json({ error: err.message })
    }
})

router.get('/proxy', async (req, res) => {
    try {
        const { url } = req.query
        if (!url) return res.status(400).json({ error: 'URL is required' })

        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        res.set('Content-Type', response.headers.get('content-type'))
        res.send(Buffer.from(buffer))
    } catch (err) {
        console.error('Proxy error:', err.message)
        res.status(500).json({ error: 'Failed to proxy image' })
    }
})

export default router