const BASE = import.meta.env.VITE_API_URL || '/api'

export async function searchMemes(query) {
    const res = await fetch(`${BASE}/memes/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    })
    return res.json()
}