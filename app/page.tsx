"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Download, ImagePlus, Music2, Printer, RotateCcw, Share2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

type Gender = "male" | "female";
type Tool = "slipper" | "hammer" | "stamp";

const PHRASES = [
  "我可以承認自己的感受，不必再用笑容把一切藏起來。",
  "我允許自己冷靜下來，在行動以前先照顧內在的安全感。",
  "我不必被未知困住，可以帶著勇氣走向下一步。",
  "我願意把說不出口的擔心，交還給當下可以處理的事。",
  "這份害怕有它的原因，但它不再替我決定人生。",
  "我可以相信自己，即使別人的聲音很大。",
  "我不必一再重播過去，今天可以重新開始。",
  "我把注意力帶回此刻，讓心慢慢回到身體裡。",
  "我允許改變發生，不必緊抓熟悉卻不舒服的狀態。",
  "我能分辨別人的意見，也能守住自己的判斷。",
  "我可以慢一點，疲憊不是失敗。",
  "我願意休息並重新整理，不必靠意志硬撐到底。",
  "我不必因為一個失誤，就否定全部的自己。",
  "我願意接納不完美，也願意繼續往前。",
  "我把不屬於自己的責任，溫柔而清楚地放回去。",
  "我值得被善待，也包括被自己善待。",
  "我不需要比較，自己的節奏同樣有價值。",
  "我允許悲傷流動，也允許快樂再次靠近。",
  "失去不是我的全部，我仍能帶著愛繼續生活。",
  "我願意看見新的出口，不讓失望替未來下結論。",
  "我可以接受幫助，不必什麼都獨自承受。",
  "我尊重自己的界線，也尊重別人有不同選擇。",
  "我放下控制所有人的需要，把力量收回自己身上。",
  "我願意先傾聽，再決定是否需要證明自己。",
  "我可以關心別人，同時保留自己的空間。",
  "我不需要佔有才能確定愛，安全感可以慢慢建立。",
  "我願意放下嫉妒與猜疑，誠實看見真正的需要。",
  "我把批判換成理解，也為自己保留清楚的原則。",
  "我不必背著怨氣前進，可以把力氣留給自己的生活。",
  "我接受現實的樣子，然後選擇能做的下一步。",
  "我可以有自己的方向，不必只照著別人的期待活。",
  "我願意開始，即使現在還沒有百分之百準備好。",
  "我把反覆的念頭放下片刻，讓心獲得一點空間。",
  "我願意聽見內在真正的聲音，答案不必向外追趕。",
  "我把過度熱切放慢，讓分享保有尊重與空間。",
  "我可以堅定，也可以柔軟；改變不等於背叛自己。",
  "我願意把力量用在改善生活，而不是支配別人。",
  "我不必成為所有人的救援者，也值得照顧自己。",
];

const toolInfo: Record<Tool, { label: string; emoji: string; phrase: string }> = {
  slipper: { label: "拖鞋", emoji: "🩴", phrase: "鳥事走開！" },
  hammer: { label: "軟槌", emoji: "🔨", phrase: "退散！" },
  stamp: { label: "退散印", emoji: "🔴", phrase: "今天不內耗！" },
};
const lineUrl = "https://line.me/R/ti/p/%40158vkyka";
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(lineUrl)}`;

export default function Home() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender>("female");
  const [nickname, setNickname] = useState("");
  const [relation, setRelation] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [zoom, setZoom] = useState(112);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [tool, setTool] = useState<Tool>("hammer");
  const [hits, setHits] = useState(0);
  const [impact, setImpact] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ nodes: OscillatorNode[]; timer: number } | null>(null);
  const release = Math.min(100, hits * 4);
  const displayName = nickname.trim() || "這個小人";
  const displayRelation = relation.trim() || "心裡的鳥事";
  const dollSrc = `/dolls/${gender}.png`;

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  useEffect(() => () => {
    if (ambientRef.current) {
      window.clearInterval(ambientRef.current.timer);
      ambientRef.current.nodes.forEach(node => { try { node.stop(); } catch {} });
    }
    void audioContextRef.current?.close();
  }, []);
  const damageClass = useMemo(() => hits >= 20 ? "damage-4" : hits >= 14 ? "damage-3" : hits >= 8 ? "damage-2" : hits >= 3 ? "damage-1" : "", [hits]);

  function handleUpload(file?: File) {
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/.test(file.type)) { alert("請上傳 JPG、PNG 或 WebP 圖片。HEIC 照片請先另存為 JPG。"); return; }
    if (file.size > 12 * 1024 * 1024) { alert("圖片請小於 12MB。"); return; }
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
  }

  function getAudioContext() {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  }

  function playEerieChime(ctx: AudioContext, duration = 1.8) {
    const now = ctx.currentTime;
    const notes = [174.61, 207.65, 233.08];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index === 1 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      osc.detune.value = index * 5 - 4;
      gain.gain.setValueAtTime(0.0001, now + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.018, now + 0.12 + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + index * 0.09);
      osc.stop(now + duration + 0.05);
    });
  }

  function startAmbient(force = false) {
    if ((!music && !force) || ambientRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    void ctx.resume();
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    master.gain.value = 0.025;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    master.connect(filter).connect(ctx.destination);
    const nodes = [55, 82.41, 110].map((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index === 1 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      osc.detune.value = index * 7 - 6;
      gain.gain.value = index === 1 ? 0.32 : 0.22;
      osc.connect(gain).connect(master);
      osc.start();
      return osc;
    });
    playEerieChime(ctx);
    const timer = window.setInterval(() => playEerieChime(ctx), 5600);
    ambientRef.current = { nodes, timer };
  }

  function stopAmbient() {
    if (!ambientRef.current) return;
    window.clearInterval(ambientRef.current.timer);
    ambientRef.current.nodes.forEach(node => { try { node.stop(); } catch {} });
    ambientRef.current = null;
  }

  function toggleMusic(enabled: boolean) {
    setMusic(enabled);
    if (enabled) startAmbient(true); else stopAmbient();
  }

  function playHitSound(kind: Tool) {
    const ctx = getAudioContext();
    if (!ctx) return;
    void ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const melody = [196, 233.08, 261.63, 311.13];
    osc.type = kind === "slipper" ? "square" : kind === "stamp" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(melody[hits % melody.length], now);
    osc.frequency.exponentialRampToValueAtTime(kind === "stamp" ? 82 : 110, now + (kind === "stamp" ? 0.42 : 0.13));
    gain.gain.setValueAtTime(kind === "stamp" ? 0.11 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "stamp" ? 0.5 : 0.16));
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (kind === "stamp" ? 0.52 : 0.18));
  }

  function hit() {
    setHits(n => Math.min(25, n + 1)); setImpact(false); requestAnimationFrame(() => setImpact(true)); window.setTimeout(() => setImpact(false), 240);
    if (navigator.vibrate) navigator.vibrate(18);
    if (sound) playHitSound(tool);
  }
  function finish() { const ctx=getAudioContext(); if(ctx&&sound) playEerieChime(ctx,2.4); stopAmbient(); setPhraseIndex(Math.floor(Math.random()*PHRASES.length)); setStep(4); window.scrollTo({top:0,behavior:"smooth"}); }
  function reset() { stopAmbient(); setStep(1); setHits(0); setNickname(""); setRelation(""); setPhoto(null); setPosition({x:0,y:0}); setZoom(112); setRotation(0); }

  async function drawResult(width:number,height:number) {
    const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=height; const ctx=canvas.getContext("2d")!; const s=width/1080;
    const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});
    ctx.fillStyle="#f8efd9";ctx.fillRect(0,0,width,height);ctx.strokeStyle="#d99811";ctx.lineWidth=10*s;ctx.setLineDash([18*s,12*s]);ctx.strokeRect(38*s,38*s,width-76*s,height-76*s);ctx.setLineDash([]);
    ctx.textAlign="center";ctx.fillStyle="#b73320";ctx.font=`900 ${62*s}px Arial`;ctx.fillText("少甫・勒令退散符",width/2,118*s);
    const doll=await load(dollSrc);ctx.drawImage(doll,55*s,180*s,405*s,610*s);
    if(photo){const face=await load(photo);ctx.save();ctx.beginPath();ctx.ellipse(258*s,330*s,92*s,112*s,0,0,Math.PI*2);ctx.clip();const size=240*s*zoom/100;ctx.filter="saturate(.72) contrast(1.08) sepia(.12)";ctx.translate((258+position.x)*s,(330+position.y)*s);ctx.rotate(rotation*Math.PI/180);ctx.drawImage(face,-size/2,-size/2,size,size);ctx.restore();}
    ctx.textAlign="left";ctx.fillStyle="#7f2118";ctx.font=`700 ${32*s}px Arial`;ctx.fillText(`${displayRelation}・${displayName}`,500*s,235*s);ctx.font=`900 ${68*s}px Arial`;ctx.fillText("勒令退散",500*s,330*s);ctx.fillStyle="#201d18";ctx.font=`600 ${34*s}px Arial`;wrapText(ctx,PHRASES[phraseIndex],500*s,410*s,500*s,54*s);
    ctx.strokeStyle="#bd3a24";ctx.lineWidth=7*s;ctx.strokeRect(510*s,650*s,420*s,82*s);ctx.textAlign="center";ctx.fillStyle="#bd3a24";ctx.font=`800 ${34*s}px Arial`;ctx.fillText("情緒退散提醒",720*s,706*s);
    try{const qr=await load(qrUrl);ctx.drawImage(qr,98*s,(height/s-410)*s,210*s,210*s);}catch{}
    ctx.textAlign="left";ctx.fillStyle="#167a3d";ctx.font=`800 ${36*s}px Arial`;ctx.fillText("LINE 官方帳號 @158vkyka",350*s,(height/s-325)*s);ctx.fillStyle="#1f1c18";ctx.font=`600 ${27*s}px Arial`;ctx.fillText("塔羅｜占星｜催眠｜元辰宮｜祈福疏文",350*s,(height/s-270)*s);ctx.font=`500 ${23*s}px Arial`;ctx.fillText("想以民俗祈福寄託心願，可洽少甫疏文服務",350*s,(height/s-220)*s);ctx.fillStyle="#675947";ctx.font=`500 ${20*s}px Arial`;ctx.fillText("純屬娛樂、民俗文化與情緒自我探索",350*s,(height/s-175)*s);return canvas;
  }
  async function download(kind:"share"|"a4") { const canvas=await drawResult(kind==="share"?1080:1240,kind==="share"?1350:1754);canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=kind==="share"?"少甫-退散符-分享圖.png":"少甫-退散符-A4.png";a.click();URL.revokeObjectURL(url);},"image/png"); }
  async function shareResult(){const canvas=await drawResult(1080,1350);const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,"image/png"));const file=blob?new File([blob],"少甫-退散符.png",{type:"image/png"}):null;if(file&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({title:"少甫・小人退散所",text:"今天的鳥事，退散！",files:[file]});return}catch{}}await download("share");}

  return <main className="site-shell"><section className="game-card" aria-live="polite">
    <header className="game-header"><div className="sun-doodle" aria-hidden>☀</div><div><p className="eyebrow">少甫的情緒退散遊戲</p><h1>少甫・小人退散所</h1></div><div className="spiral" aria-hidden>◎</div></header>
    <div className="stepper" aria-label={`步驟 ${step}／4`}>{[1,2,3,4].map(n=><span key={n} className={n<=step?"active":""}>{n}</span>)}</div>
    {step===1&&<div className="screen screen-enter"><div className="burst-title"><h2>今天想讓哪個小人退散？</h2></div><RadioGroup value={gender} onValueChange={v=>setGender(v as Gender)} className="gender-grid">{(["male","female"] as Gender[]).map(g=><label key={g} className={`choice-card ${gender===g?"selected":""}`}><RadioGroupItem value={g} className="sr-only"/><img src={`/dolls/${g}.png`} alt={g==="male"?"男符紙紙人":"女符紙紙人"}/><strong>{g==="male"?"男紙人":"女紙人"}</strong></label>)}</RadioGroup><div className="music-panel"><Music2/><div><strong>靈異氛圍音樂</strong><small>按下開始後播放，可隨時關閉</small></div><Switch checked={music} onCheckedChange={setMusic} aria-label="靈異氛圍音樂"/></div><Button className="crayon-button primary" onClick={()=>{setStep(2);if(music)startAmbient()}}>開始退散</Button><p className="privacy-note">🔒 照片只在你的裝置內處理，不會上傳或保存</p></div>}
    {step===2&&<div className="screen screen-enter"><div className="burst-title"><h2>放上小人的臉</h2></div><DollStage src={dollSrc} photo={photo} zoom={zoom} rotation={rotation} position={position} onPositionChange={setPosition} onZoomChange={setZoom} onRotationChange={setRotation} editable damageClass="" label={nickname}/><input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>handleUpload(e.target.files?.[0])}/><Button variant="outline" className="upload-button" onClick={()=>fileRef.current?.click()}><ImagePlus/>{photo?"更換照片":"上傳照片"}</Button>{photo&&<div className="gesture-hint"><strong>直接碰照片調整</strong><span>單指拖曳位置｜雙指開合縮放｜雙指旋轉</span><small>縮放 {zoom}%・旋轉 {rotation}°</small></div>}<div className="field-grid"><label>暱稱<input maxLength={10} value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="例如：周柔柔"/></label><label>關係<input maxLength={10} value={relation} onChange={e=>setRelation(e.target.value)} placeholder="例如：前任"/></label></div><Button className="crayon-button primary" onClick={()=>setStep(3)}>下一步：選工具</Button><button className="text-button" onClick={()=>{setPhoto(null);setStep(3)}}>略過照片</button></div>}
    {step===3&&<div className="screen screen-enter"><div className="hud"><div><span>敲打</span><strong>{hits}</strong><small>次</small></div><div className="meter"><span>壓力釋放 {release}%</span><Progress value={release}/></div><div className="audio-controls"><label title="背景音樂"><Music2/><Switch checked={music} onCheckedChange={toggleMusic} aria-label="背景音樂"/></label><label title="敲擊音效">{sound?<Volume2/>:<VolumeX/>}<Switch checked={sound} onCheckedChange={setSound} aria-label="敲擊音效"/></label></div></div><button className={`hit-zone ${impact?"is-hit":""}`} onClick={hit} aria-label={`使用${toolInfo[tool].label}敲打紙人`}><DollStage src={dollSrc} photo={photo} zoom={zoom} rotation={rotation} position={position} damageClass={damageClass} label={displayName} relation={displayRelation}/><span className={`tool-swing tool-${tool}`}>{toolInfo[tool].emoji}</span>{impact&&<span className="impact-word">{toolInfo[tool].phrase}</span>}<span className="hit-hint">點紙人開始敲打，每下都有不同音符</span></button><RadioGroup value={tool} onValueChange={v=>setTool(v as Tool)} className="tools-grid">{(Object.keys(toolInfo) as Tool[]).map(t=><label key={t} className={`tool-card ${tool===t?"selected":""}`}><RadioGroupItem value={t} className="sr-only"/><span>{toolInfo[t].emoji}</span><strong>{toolInfo[t].label}</strong></label>)}</RadioGroup><Button className="crayon-button primary" disabled={hits<5} onClick={finish}>{hits<5?`再敲 ${5-hits} 下`:"完成退散"}</Button></div>}
    {step===4&&<div className="screen screen-enter result-screen"><div className="burst-title"><h2>你的退散符完成了</h2></div><div className="result-sheet"><div className="result-doll"><DollStage src={dollSrc} photo={photo} zoom={zoom} rotation={rotation} position={position} damageClass="damage-4" label={displayName}/></div><div className="cut-line">✂</div><article className="talisman-copy"><span className="ribbon">勒令退散符</span><p className="target">{displayRelation}・{displayName}</p><h2>勒令退散</h2><p className="healing">{PHRASES[phraseIndex]}</p><span className="emotion-seal">情緒退散提醒</span></article></div><div className="download-grid"><Button variant="outline" onClick={()=>download("share")}><Download/>下載手機分享圖</Button><Button variant="outline" onClick={()=>download("a4")}><Printer/>下載 A4 列印版</Button></div><Button className="share-button" onClick={shareResult}><Share2/>分享</Button><aside className="line-card"><img src={qrUrl} alt="加入 LINE 官方帳號 @158vkyka 的 QR Code" crossOrigin="anonymous"/><div><a href={lineUrl} target="_blank" rel="noreferrer">LINE 官方帳號 @158vkyka</a><p>塔羅｜占星｜催眠｜元辰宮｜祈福疏文</p><small>想以民俗祈福寄託心願，可洽少甫疏文服務</small></div></aside><p className="disclaimer">純屬娛樂、民俗文化與情緒自我探索，不代替心理、醫療或其他專業協助。</p><Button variant="ghost" onClick={reset}><RotateCcw/>重新玩一次</Button></div>}
  </section></main>;
}

function DollStage({src,photo,zoom,rotation=0,position,onPositionChange,onZoomChange,onRotationChange,editable=false,damageClass,label,relation}:{src:string;photo:string|null;zoom:number;rotation?:number;position:{x:number;y:number};onPositionChange?:(position:{x:number;y:number})=>void;onZoomChange?:(zoom:number)=>void;onRotationChange?:(rotation:number)=>void;editable?:boolean;damageClass:string;label?:string;relation?:string}){
  const pointsRef=useRef(new Map<number,{x:number;y:number}>());
  const singleRef=useRef<{x:number;y:number;originX:number;originY:number}|null>(null);
  const gestureRef=useRef<{distance:number;angle:number;centerX:number;centerY:number;zoom:number;rotation:number;position:{x:number;y:number}}|null>(null);
  const latestRef=useRef({position,zoom,rotation});
  useEffect(()=>{latestRef.current={position,zoom,rotation}},[position,zoom,rotation]);
  const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

  function metrics(){
    const points=[...pointsRef.current.values()];
    if(points.length<2)return null;
    const [a,b]=points;
    return {distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,centerX:(a.x+b.x)/2,centerY:(a.y+b.y)/2};
  }
  function beginGesture(){const m=metrics();if(!m)return;gestureRef.current={...m,zoom:latestRef.current.zoom,rotation:latestRef.current.rotation,position:{...latestRef.current.position}}}
  function pointerDown(e:ReactPointerEvent<HTMLDivElement>){
    if(!editable||!photo)return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointsRef.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointsRef.current.size===1)singleRef.current={x:e.clientX,y:e.clientY,originX:latestRef.current.position.x,originY:latestRef.current.position.y};
    else{singleRef.current=null;beginGesture()}
  }
  function pointerMove(e:ReactPointerEvent<HTMLDivElement>){
    if(!pointsRef.current.has(e.pointerId))return;
    e.preventDefault();
    pointsRef.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointsRef.current.size>=2){
      if(!gestureRef.current)beginGesture();
      const m=metrics(),base=gestureRef.current;
      if(!m||!base)return;
      let angleDelta=m.angle-base.angle;if(angleDelta>180)angleDelta-=360;if(angleDelta<-180)angleDelta+=360;
      const nextZoom=Math.round(clamp(base.zoom*m.distance/base.distance,80,220));
      const nextRotation=Math.round(clamp(base.rotation+angleDelta,-180,180));
      const nextPosition={x:base.position.x+m.centerX-base.centerX,y:base.position.y+m.centerY-base.centerY};
      latestRef.current={position:nextPosition,zoom:nextZoom,rotation:nextRotation};
      onPositionChange?.(nextPosition);onZoomChange?.(nextZoom);onRotationChange?.(nextRotation);
    }else if(singleRef.current){
      const nextPosition={x:singleRef.current.originX+e.clientX-singleRef.current.x,y:singleRef.current.originY+e.clientY-singleRef.current.y};
      latestRef.current={...latestRef.current,position:nextPosition};onPositionChange?.(nextPosition);
    }
  }
  function pointerEnd(e:ReactPointerEvent<HTMLDivElement>){
    pointsRef.current.delete(e.pointerId);gestureRef.current=null;
    const remaining=[...pointsRef.current.values()][0];
    singleRef.current=remaining?{x:remaining.x,y:remaining.y,originX:latestRef.current.position.x,originY:latestRef.current.position.y}:null;
  }
  function quick(zoomDelta=0,rotationDelta=0){
    const nextZoom=clamp(zoom+zoomDelta,80,220),nextRotation=clamp(rotation+rotationDelta,-180,180);
    onZoomChange?.(nextZoom);onRotationChange?.(nextRotation);
  }
  function resetTransform(){onPositionChange?.({x:0,y:0});onZoomChange?.(112);onRotationChange?.(0)}

  return <div className={`doll-stage ${editable&&photo?"editable-stage":""} ${damageClass}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}>
    {photo&&<div className="face-window"><img src={photo} draggable={false} alt="使用者上傳的紙人臉部" style={{width:`${zoom}%`,height:`${zoom}%`,transform:`translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`}}/></div>}
    <img className="doll-art" src={src} alt="符紙紙人"/>{!photo&&<div className="face-placeholder"><ImagePlus/><span>上傳照片</span></div>}{label&&<span className="name-tag">{label}</span>}{relation&&<span className="relation-tag">{relation}</span>}<span className="bruise" aria-hidden>〽</span><span className="bandage" aria-hidden>OK</span><span className="smoke" aria-hidden>☁</span><span className="stamp-mark" aria-hidden>退散</span>
    {editable&&photo&&<div className="photo-tools" onPointerDown={e=>e.stopPropagation()}>
      <button onClick={()=>quick(-10,0)} aria-label="縮小照片">−</button><button onClick={()=>quick(10,0)} aria-label="放大照片">＋</button><button onClick={()=>quick(0,-15)} aria-label="向左旋轉">↶</button><button onClick={()=>quick(0,15)} aria-label="向右旋轉">↷</button><button className="reset-tool" onClick={resetTransform} aria-label="重設照片">重設</button>
    </div>}
  </div>
}
function wrapText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number){let line="";for(const char of text){const next=line+char;if(ctx.measureText(next).width>maxWidth&&line){ctx.fillText(line,x,y);line=char;y+=lineHeight}else line=next}ctx.fillText(line,x,y)}
