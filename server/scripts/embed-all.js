import 'dotenv/config'
import pool from "../database/pool.js"
import { embed } from "../database/ai.js"


async function embedALL() {
    const { rows } = await pool.query(
        'SELECT id,name,description FROM memes WHERE embedding IS NULL'
    )
    console.log(`Found ${rows.length} memes to embed...`)

    for (const meme of rows) {
        const vector = await embed(`${meme.name}. ${meme.description}`)
        await pool.query(
            'UPDATE memes SET embedding = $1 WHERE id = $2',
            [`[${vector.join(",")}]`, meme.id]
        )
        console.log(`✓ ${meme.name}`)
    }
    console.log("\nAll memes embedded!")
    process.exit(0)
}

embedALL().catch(err => {
    console.error(err)
    process.exit(1)
})