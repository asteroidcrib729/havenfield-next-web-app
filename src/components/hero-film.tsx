"use client";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null); const [playing, setPlaying] = useState(false); const [allowed, setAllowed] = useState(false);const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);const [autoplay,setAutoplay]=useState(false);
  useEffect(() => {const reduced = window.matchMedia('(prefers-reduced-motion: reduce)'); const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection; const update=()=>{setAllowed(!reduced.matches && !connection?.saveData);setAutoplay(window.matchMedia('(min-width: 768px)').matches);};update();reduced.addEventListener('change',update);return()=>reduced.removeEventListener('change',update);}, []);
  return <><Image src="/media/havenfield-hero-poster.jpg" alt="Imagined limestone courtyard home beside an olive tree and reflecting pool" fill priority fetchPriority="high" sizes="100vw" className="object-cover"/>
    {allowed&&!failed && <video ref={video} muted autoPlay={autoplay} loop playsInline preload="none" onLoadedData={()=>setLoaded(true)} onError={()=>setFailed(true)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover ${loaded?"":"opacity-0"}`}><source src="/media/havenfield-hero.mp4" type="video/mp4"/></video>}
    {allowed&&!failed && <button type="button" aria-label={playing?'Pause hero film':'Play hero film'} onClick={()=>{if(playing)video.current?.pause();else void video.current?.play();}} className="absolute right-6 bottom-6 z-10 flex items-center gap-2 border border-white/50 bg-black/25 px-3 py-2 text-[10px] text-white backdrop-blur-sm">{playing?<Pause size={13}/>:<Play size={13}/>} {playing?'Pause hero film':'Play hero film'}</button>}
  </>;
}
