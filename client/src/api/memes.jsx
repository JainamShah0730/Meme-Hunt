const BASE = '/api'

export async function searchMemes(query) {
    const res = await fetch(`${BASE}/memes/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    })
    return res.json()
}