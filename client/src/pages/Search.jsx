
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { searchMemes } from "../api/memes"


function SearchBar({ search, setSearch, onSearch, loading }) {
    return (
        <div className="flex flex-col sm:flex-row gap-2 w-full">
            <input type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="describe your situation..."
                className="flex-1 w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-red-600 text-white font-mono outline-none" />
            <button onClick={onSearch}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-mono font-bold uppercase tracking-widest shrink-0">
                {loading ? "Searching..." : "Find Meme"}
            </button>
        </div>
    )
}

function MemeCard({ meme, onClick }) {

    return (
        <li
            onClick={() => onClick(meme)}
            className="cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all">
            <img
                src={`/api/memes/proxy?url=${encodeURIComponent(meme.image_url)}`}
                alt={meme.name}
                className="w-full h-48 object-cover opacity-90 hover:opacity-100" />

            <div className="p-3">
                <p className="font-mono text-sm text-white uppercase tracking-wider">{meme.name}</p>
                <p className="font-mono text-xs text-red-500 mt-1">{meme.similarity * 100}% match</p>

            </div>
        </li>
    )
}

function MemeList({ memes, onSelect }) {
    if (memes.length === 0) return null
    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {memes.map(m => (
                <MemeCard key={m.id} meme={m} onClick={onSelect} />
            ))}
        </ul>
    )
}
export default function SearchPage() {

    const [search, setSearch] = useState("")
    const [memes, setMemes] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    // called when user clicks Find Meme
    async function handleSearch() {
        if (!search.trim()) return
        setLoading(true)
        const results = await searchMemes(search)
        setMemes(results)
        setLoading(false)
    }

    // called when user clicks a meme card

    function handleSelect(meme) {
        navigate('/editor', { state: { meme } })
    }

    return (<div className="max-w-2xl mx-auto p-6 min-h-screen bg-zinc-950">
        <header className="text-center mb-10 px-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase break-words"> MEME MATRIX</h1>
            <p className="text-red-500 font-mono text-xs md:text-sm tracking-widest uppercase mt-2">
                Describe the situation • AI finds the meme
            </p>
        </header>

        <main className="max-w-3xl mx-auto">
            <SearchBar
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
                loading={loading} />

            {memes.length === 0 && (
                <div className="mt-16 text-center">
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest mb-6">Trending Searches</p>
                    <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                        {[
                            "monday morning feeling",
                            "when the code works",
                            "waiting for reply",
                            "crying in corner",
                            "sports underdog wins"
                        ].map(term => (
                            <button
                                key={term}
                                onClick={() => {
                                    setSearch(term);
                                    // The user can press Enter or click Find Meme to search
                                }}
                                className="px-4 py-2 bg-transparent border border-zinc-800 text-zinc-500 font-mono text-xs uppercase tracking-widest hover:border-red-600 hover:text-white transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <MemeList memes={memes} onSelect={handleSelect} />
        </main>
    </div>
    )
}
