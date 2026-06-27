
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { searchMemes } from "../api/memes"


function SearchBar({ search, setSearch, onSearch, loading }) {
    return (
        <div className="flex gap-2">
            <input type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="describe your situation"
                className="px-2 py-1 border rounded-lg outline-none" />
            <button onClick={onSearch}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-lg">
                {loading ? "Searching..." : "Find Meme"}
            </button>
        </div>
    )
}

function MemeCard({ meme, onClick }) {

    return (
        <li
            onClick={() => onClick(meme)}
            className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-md">
            <img
                src={meme.image_url}
                alt={meme.name}
                className="w-full h-48 object-cover" />

            <div className="p-2">
                <p className="font-medium text-sm">{meme.name}</p>
                <p className="text-xs text-gray-500">{meme.similarity * 100}% match</p>

            </div>
        </li>
    )
}

function MemeList({ memes, onSelect }) {
    if (memes.length === 0) return null
    return (
        <ul className="grid grid-cols-2 gap-4 mt-6">
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

    return (<div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6"> Meme Hunt</h1>
        <SearchBar
            search={search}
            setSearch={setSearch}
            onSearch={handleSearch}
            loading={loading} />
        <MemeList memes={memes} onSelect={handleSelect} />

    </div>
    )
}
