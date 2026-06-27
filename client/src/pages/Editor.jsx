import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Editor() {
    const navigate = useNavigate()
    const location = useLocation()
    const canvasRef = useRef()
    const fileInputRef = useRef()

    const meme = location.state?.meme

    const [baseImg, setBaseImg] = useState(null)
    const [texts, setTexts] = useState([
        { id: 'top', text: 'TOP TEXT', x: 300, y: 50 },
        { id: 'bottom', text: 'BOTTOM TEXT', x: 300, y: 550 }
    ])
    const [overlayImages, setOverlayImages] = useState([])
    const [fontSize, setFontSize] = useState(40)
    
    // Dragging state
    const [activeDrag, setActiveDrag] = useState(null)

    useEffect(() => {
        if (!meme) {
            navigate("/")
            return
        }
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = `/api/memes/proxy?url=${encodeURIComponent(meme.image_url)}`
        img.onload = () => {
            setBaseImg(img)
            // Adjust bottom text initial Y based on actual image ratio if we wanted to, 
            // but the render loop will clamp it or we just let them drag it.
        }
    }, [meme, navigate])

    useEffect(() => {
        if (!baseImg || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        const TARGET_WIDTH = 600;
        const scale = TARGET_WIDTH / baseImg.width;
        canvas.width = TARGET_WIDTH;
        canvas.height = baseImg.height * scale;

        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

        overlayImages.forEach(img => {
            ctx.drawImage(img.imgElement, img.x, img.y, img.width, img.height);
        });

        ctx.font = `${fontSize}px Impact`
        ctx.textAlign = "center"
        ctx.lineJoin = "round"
        ctx.lineWidth = fontSize * 0.12
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"

        texts.forEach(t => {
            if (!t.text) return;
            const upper = t.text.toUpperCase()
            ctx.strokeText(upper, t.x, t.y)
            ctx.fillText(upper, t.x, t.y)
        });
        
    }, [baseImg, texts, overlayImages, fontSize])

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const ctx = canvas.getContext("2d");
        ctx.font = `${fontSize}px Impact`;

        // Check texts first (drawn on top)
        for (let i = texts.length - 1; i >= 0; i--) {
            const t = texts[i];
            if (!t.text) continue;
            const width = ctx.measureText(t.text.toUpperCase()).width;
            const height = fontSize;
            const left = t.x - width / 2;
            const right = t.x + width / 2;
            const top = t.y - height;
            const bottom = t.y + 10;
            
            if (mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom) {
                setActiveDrag({ id: t.id, type: 'text', offsetX: mouseX - t.x, offsetY: mouseY - t.y });
                return;
            }
        }

        // Check images
        for (let i = overlayImages.length - 1; i >= 0; i--) {
            const img = overlayImages[i];
            if (mouseX >= img.x && mouseX <= img.x + img.width && mouseY >= img.y && mouseY <= img.y + img.height) {
                setActiveDrag({ id: img.id, type: 'image', offsetX: mouseX - img.x, offsetY: mouseY - img.y });
                return;
            }
        }
    }

    const handleMouseMove = (e) => {
        if (!activeDrag) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        if (activeDrag.type === 'text') {
            setTexts(texts.map(t => 
                t.id === activeDrag.id 
                ? { ...t, x: mouseX - activeDrag.offsetX, y: mouseY - activeDrag.offsetY } 
                : t
            ));
        } else {
            setOverlayImages(overlayImages.map(img => 
                img.id === activeDrag.id 
                ? { ...img, x: mouseX - activeDrag.offsetX, y: mouseY - activeDrag.offsetY } 
                : img
            ));
        }
    }

    const handleMouseUp = () => setActiveDrag(null)

    const handleAddText = () => {
        setTexts([...texts, {
            id: Date.now().toString(),
            text: "",
            x: 300,
            y: 300
        }]);
    }

    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setOverlayImages([...overlayImages, {
                    id: Date.now().toString(),
                    imgElement: img,
                    x: 150,
                    y: 150,
                    width: 150,
                    height: 150 * (img.height / img.width)
                }]);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = null; // reset input
    }

    const handleDownload = () => {
        const canvas = canvasRef.current
        const a = document.createElement("a")
        a.download = `${meme.name}.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
    }

    if (!meme) return null;

    const tags = meme.tags && meme.tags.length > 0 
        ? meme.tags 
        : ["COOL CAT", "SHOCKED CAT"];

    return (
        <div className="min-h-screen md:h-screen w-full bg-zinc-950 flex flex-col md:flex-row font-mono border-t-4 border-red-600 overflow-hidden">
            {/* Left Pane - Canvas */}
            <div 
                className="flex-1 relative flex flex-col items-center py-12 px-4 overflow-y-auto"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px'
                }}
            >
                <button onClick={() => navigate('/')}
                    className="absolute top-6 left-6 text-red-600 font-mono text-xs hover:text-red-400 uppercase tracking-widest z-10 flex items-center gap-2 transition-colors">
                    <span>←</span> ABORT
                </button>

                {/* Header buttons area */}
                <div className="flex flex-wrap justify-center gap-4 mb-12 mt-8 md:mt-0 relative z-10 max-w-lg">
                    <button className="px-6 py-2 bg-red-600 text-white font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500 uppercase">
                        {meme.name}
                    </button>
                    {tags.slice(0, 2).map((tag, i) => (
                        <button key={i} className="px-6 py-2 bg-transparent border border-zinc-800 text-zinc-500 font-bold tracking-widest text-sm hover:text-white transition-colors uppercase">
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Canvas Container */}
                <div className="bg-black p-1 md:p-2 shadow-2xl relative z-10 max-w-full">
                    <canvas 
                        ref={canvasRef} 
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="max-w-full h-auto object-contain cursor-move" 
                        style={{ maxHeight: '65vh' }} 
                    />
                    <p className="text-zinc-600 text-xs text-center mt-3 uppercase tracking-widest">
                        Click and drag text/images on canvas to move them
                    </p>
                </div>
            </div>

            {/* Right Pane - Controls */}
            <div className="w-full md:w-[450px] bg-[#121214] border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col overflow-y-auto">
                <div className="p-4 sm:p-6 md:p-8 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-8 md:mb-10">
                        <h2 className="text-lg md:text-xl font-black text-white tracking-widest flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
                            CONTROL PANEL
                        </h2>
                        <p className="text-zinc-500 text-[10px] md:text-xs mt-2 uppercase tracking-widest font-mono">
                            Awaiting your command...
                        </p>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col gap-6 flex-1">
                        
                        {/* Add Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={handleAddText} className="flex-1 py-3 bg-[#1176b9] text-white font-sans text-sm font-semibold rounded-lg hover:bg-[#0f66a0] transition-colors flex justify-center items-center gap-1">
                                <span className="text-lg leading-none mb-0.5">+</span> Add Text
                            </button>
                            <button onClick={() => fileInputRef.current.click()} className="flex-1 py-3 bg-[#1f1f1f] border border-zinc-800 text-white font-sans text-sm font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors flex justify-center items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Add Image
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleAddImage} hidden accept="image/*" />
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                            {texts.map((t, index) => (
                                <div key={t.id} className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Enter text..."
                                        value={t.text}
                                        onChange={(e) => {
                                            const newTexts = [...texts];
                                            newTexts[index].text = e.target.value;
                                            setTexts(newTexts);
                                        }}
                                        className="w-full px-4 py-3 bg-black border border-zinc-800 focus:border-red-600 text-white font-mono outline-none transition-colors uppercase"
                                    />
                                    <button 
                                        onClick={() => setTexts(texts.filter(item => item.id !== t.id))}
                                        className="px-4 bg-red-900/10 text-red-500 border border-red-900 hover:bg-red-900/30 transition-colors"
                                        title="Remove Text"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {overlayImages.map((img, index) => (
                            <div key={img.id} className="flex items-center justify-between p-3 border border-zinc-800 bg-black">
                                <span className="text-zinc-400 text-xs uppercase">Overlay Image {index + 1}</span>
                                <button 
                                    onClick={() => setOverlayImages(overlayImages.filter(item => item.id !== img.id))}
                                    className="text-red-500 hover:text-red-400 text-xs uppercase"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <div className="mt-4">
                            <label className="block text-xs font-mono text-red-500 uppercase tracking-widest mb-2">
                                &gt; FONT_SIZE // {fontSize}PX
                            </label>
                            <input type="range"
                                min="16"
                                max="100"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full accent-red-600" />
                        </div>

                        {/* Presets */}
                        <div className="mt-4 pt-6 border-t border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs tracking-widest uppercase mb-4">
                                <span className="text-red-500">⚡</span> QUICK PRESETS
                            </div>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        let newTexts = [...texts];
                                        if (newTexts.length === 0) {
                                            newTexts.push({ id: 'top', text: "WHEN YOU FINALLY...", x: 300, y: 50 });
                                            newTexts.push({ id: 'bottom', text: "FIGURE OUT HOW IT WORKS", x: 300, y: 550 });
                                        } else if (newTexts.length === 1) {
                                            newTexts[0].text = "WHEN YOU FINALLY...";
                                            newTexts.push({ id: 'bottom', text: "FIGURE OUT HOW IT WORKS", x: 300, y: 550 });
                                        } else {
                                            newTexts[0].text = "WHEN YOU FINALLY...";
                                            newTexts[newTexts.length - 1].text = "FIGURE OUT HOW IT WORKS";
                                        }
                                        setTexts(newTexts);
                                    }}
                                    className="bg-black border border-zinc-800 p-4 text-left text-zinc-400 text-xs hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-wider font-mono">
                                    "WHEN YOU FINALLY..."
                                </button>
                                <button 
                                    onClick={() => {
                                        let newTexts = [...texts];
                                        if (newTexts.length === 0) {
                                            newTexts.push({ id: 'top', text: "NOBODY:", x: 300, y: 50 });
                                            newTexts.push({ id: 'bottom', text: "ME: DOING THIS ANYWAY", x: 300, y: 550 });
                                        } else if (newTexts.length === 1) {
                                            newTexts[0].text = "NOBODY:";
                                            newTexts.push({ id: 'bottom', text: "ME: DOING THIS ANYWAY", x: 300, y: 550 });
                                        } else {
                                            newTexts[0].text = "NOBODY:";
                                            newTexts[newTexts.length - 1].text = "ME: DOING THIS ANYWAY";
                                        }
                                        setTexts(newTexts);
                                    }}
                                    className="bg-black border border-zinc-800 p-4 text-left text-zinc-400 text-xs hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-wider font-mono">
                                    "NOBODY: / ME:"
                                </button>
                                <button 
                                    onClick={() => {
                                        let newTexts = [...texts];
                                        if (newTexts.length === 0) {
                                            newTexts.push({ id: 'top', text: "POV:", x: 300, y: 50 });
                                            newTexts.push({ id: 'bottom', text: "YOU ARE READING THIS MEME", x: 300, y: 550 });
                                        } else if (newTexts.length === 1) {
                                            newTexts[0].text = "POV:";
                                            newTexts.push({ id: 'bottom', text: "YOU ARE READING THIS MEME", x: 300, y: 550 });
                                        } else {
                                            newTexts[0].text = "POV:";
                                            newTexts[newTexts.length - 1].text = "YOU ARE READING THIS MEME";
                                        }
                                        setTexts(newTexts);
                                    }}
                                    className="bg-black border border-zinc-800 p-4 text-left text-zinc-400 text-xs hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-wider font-mono">
                                    "POV: ..."
                                </button>
                            </div>
                        </div>

                    </div>

                    <button 
                        onClick={handleDownload}
                        className="w-full py-4 mt-8 bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-mono font-bold uppercase tracking-widest transition-all">
                        EXECUTE: DOWNLOAD
                    </button>
                </div>
            </div>
        </div>
    )
}
