
import React from "react"
import { useState } from "react"
import { useEffect } from "react"
import { useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Editor() {

    const navigate = useNavigate()
    const location = useLocation()
    const canvasRef = useRef()

    const [topText, setTopText] = useState("")
    const [bottomText, setBottomText] = useState("")
    const [fontSize, setFontSize] = useState(28)

    const meme = location.state?.meme


    if (!meme) {
        navigate("/")
        return null
    }
    useEffect(() => {
        drawMeme()
    }, [topText, bottomText, fontSize, meme])

    function drawMeme() {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `/api/memes/proxy?url=${encodeURIComponent(meme.image_url)}`

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            ctx.font = `${fontSize}px Impact`
            ctx.textAlign = "center"
            ctx.lineJoin = "round"
            ctx.lineWidth = fontSize * 0.12
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"

            function drawText(text, y) {
                const upper = text.toUpperCase()
                ctx.strokeText(upper, canvas.width / 2, y)
                ctx.fillText(upper, canvas.width / 2, y)
            }

            if (topText) drawText(topText, fontSize + 10)
            if (bottomText) drawText(bottomText, canvas.height - 15)

        }
    }
    function handleDownload() {
        const canvas = canvasRef.current
        const a = document.createElement("a")
        a.download = `${meme.name}.png`
        a.href = canvas.toDataURL("image/png")
        a.click()

    }


    return (
        <div className="max-w-2xl mx-auto p-6">
            <button onClick={() => navigate('/')}
                className="mb-4 text-sm text-gray-500 hover:text-black">
                ← Back to search
            </button>

            <h2 className="text-xl font-bold mb-4">{meme.name}</h2>

            <canvas ref={canvasRef}
                className="w-full rounded-lg border" />

            <div className="mt-4 flex flex-col gap-3">
                <input type="text" placeholder="Top text..."
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="px-4 py-2 border rounded-lg outline-none" />

                <input type="text" placeholder="Bottom texrt..."
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="px-4 py-2 border rounded-lg outline-none" />

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Font size </span>
                    <input type="range"
                        min="16"
                        max="60"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="flex-1" />
                    <span className="text-sm w-6"> {fontSize}</span>
                </div>

                <button onClick={handleDownload}
                    className="px-4 py-2 bg-black text-white rounded-lg">
                    Download meme
                </button>
            </div>

        </div>



    )

}