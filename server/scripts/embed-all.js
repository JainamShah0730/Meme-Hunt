import 'dotenv/config'
import pool from '../database/pool.js'
import { embed } from '../database/ai.js'

async function embedWithRetry(text, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await embed(text)
        } catch (err) {
            console.log(`  Retry ${i + 1}/${retries} after error: ${err.message}`)
            await new Promise(r => setTimeout(r, 2000)) // wait 2 seconds before retry
        }
    }
    throw new Error(`Failed after ${retries} retries`)
}

async function embedAll() {
    const { rows } = await pool.query(
        'SELECT id, name, description FROM memes WHERE embedding IS NULL'
    )

    console.log(`Found ${rows.length} memes to embed...`)

    for (const meme of rows) {
        try {
            const vector = await embedWithRetry(`${meme.name}. ${meme.description}`)
            await pool.query(
                'UPDATE memes SET embedding = $1 WHERE id = $2',
                [`[${vector.join(',')}]`, meme.id]
            )
            console.log(`✓ ${meme.name}`)
        } catch (err) {
            console.error(`✗ Failed: ${meme.name} — ${err.message}`)
        }

        // Small delay between each meme to avoid rate limiting
        await new Promise(r => setTimeout(r, 500))
    }

    console.log('\nDone!')
    process.exit(0)
}

embedAll().catch(err => {
    console.error(err)
    process.exit(1)
})