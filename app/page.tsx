"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Music2, Printer, RotateCcw, Share2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

type Gender = "male" | "female";
type Tool = "slipper" | "hammer";

const PHRASES = [
  "我可以承認自己的感受，不必再用笑容把一切藏起來。",
  "我允許自己冷靜下來，在行動以前先照顧內在的安全感。",
  "我不必被未知困住，可以帶著勇氣走向下一步。",
  "我可以相信自己，即使別人的聲音很大。",
  "我不必一再重播過去，今天可以重新開始。",
  "我把不屬於自己的責任，溫柔而清楚地放回去。",
  "我值得被善待，也包括被自己善待。",
  "我願意看見新的出口，不讓失望替未來下結論。",
  "我尊重自己的界線，也尊重別人有不同選擇。",
  "我把注意力帶回此刻，讓心慢慢回到身體裡。",
  "我不需要比較，自己的節奏同樣有價值。",
  "我願意放下嫉妒與猜疑，誠實看見真正的需要。",
  "我不必背著怨氣前進，可以把力氣留給自己的生活。",
  "我願意開始，即使現在還沒有百分之百準備好。",
  "我不必成為所有人的救援者，也值得照顧自己。",
];

const toolInfo: Record<Tool, { label: string; emoji: string; phrase: string }> = {
  slipper: { label: "拖鞋", emoji: "🩴", phrase: "鳥事走開！" },
  hammer: { label: "軟槌", emoji: "🔨", phrase: "退散！" },
};

const lineUrl = "https://line.me/R/ti/p/%40158vkyka";
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(lineUrl)}`;

export default function Home() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender>("female");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [tool, setTool] = useState<Tool>("hammer");
  const [hits, setHits] = useState(0);
  const [impact, setImpact] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ nodes: OscillatorNode[]; timer: number } | null>(null);

  const release = Math.min(100, hits * 4);
  const displayName = name.trim() || "這個小人";
  const displayRole = role.trim() || "身分未填";
  const dollSrc = `/dolls/talisman-${gender}-v2.png`;
  const damageClass = useMemo(() => hits >= 20 ? "damage-4" : hits >= 14 ? "damage-3" : hits >= 8 ? "damage-2" : hits >= 3 ? "damage-1" : "", [hits]);
  const [reminderLeft, reminderRight] = splitReminder(PHRASES[phraseIndex]);

  useEffect(() => () => {
    if (ambientRef.current) {
      window.clearInterval(ambientRef.current.timer);
      ambientRef.current.nodes.forEach((node) => { try { node.stop(); } catch {} });
    }
    void audioContextRef.current?.close();
  }, []);

  function getAudioContext() {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  }

  function playEerieChime(ctx: AudioContext, duration = 1.8) {
    const now = ctx.currentTime;
    [174.61, 207.65, 233.08].forEach((frequency, index) => {
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
    ambientRef.current = { nodes, timer: window.setInterval(() => playEerieChime(ctx), 5600) };
  }

  function stopAmbient() {
    if (!ambientRef.current) return;
    window.clearInterval(ambientRef.current.timer);
    ambientRef.current.nodes.forEach((node) => { try { node.stop(); } catch {} });
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
    osc.type = kind === "slipper" ? "square" : "triangle";
    osc.frequency.setValueAtTime(melody[hits % melody.length], now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.13);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  function hit() {
    setHits((count) => Math.min(25, count + 1));
    setImpact(false);
    requestAnimationFrame(() => setImpact(true));
    window.setTimeout(() => setImpact(false), 240);
    if (navigator.vibrate) navigator.vibrate(18);
    if (sound) playHitSound(tool);
  }

  function finish() {
    const ctx = getAudioContext();
    if (ctx && sound) playEerieChime(ctx, 2.4);
    stopAmbient();
    setPhraseIndex(Math.floor(Math.random() * PHRASES.length));
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    stopAmbient();
    setStep(1);
    setHits(0);
    setName("");
    setRole("");
  }

  async function drawResult(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const s = width / 1080;
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    ctx.fillStyle = "#f1dfaa";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#9c251b";
    ctx.lineWidth = 10 * s;
    ctx.setLineDash([18 * s, 12 * s]);
    ctx.strokeRect(38 * s, 38 * s, width - 76 * s, height - 76 * s);
    ctx.setLineDash([]);
    ctx.textAlign = "center";
    ctx.fillStyle = "#8f2118";
    ctx.font = `900 ${58 * s}px Arial`;
    ctx.fillText("元辰小人宮・勒令退散符", width / 2, 118 * s);
    const doll = await load(dollSrc);
    ctx.drawImage(doll, 338 * s, 168 * s, 405 * s, 620 * s);
    ctx.fillStyle = "#7c1e18";
    ctx.font = `800 ${22 * s}px Arial`;
    drawVerticalText(ctx, displayName, 540 * s, 395 * s, 26 * s, 130 * s);
    const roleTop = 395 + Math.min(Array.from(displayName).length, 5) * 26 + 14;
    drawVerticalText(ctx, displayRole, 540 * s, roleTop * s, 26 * s, 130 * s);
    ctx.strokeStyle = "#9c251b";
    ctx.lineWidth = 5 * s;
    ctx.strokeRect(80 * s, 185 * s, 130 * s, 555 * s);
    ctx.strokeRect(870 * s, 185 * s, 130 * s, 555 * s);
    ctx.textAlign = "center";
    ctx.fillStyle = "#21160f";
    ctx.font = `700 ${28 * s}px Arial`;
    drawVerticalText(ctx, reminderLeft, 145 * s, 215 * s, 34 * s, 500 * s);
    drawVerticalText(ctx, reminderRight, 935 * s, 215 * s, 34 * s, 500 * s);
    try { const qr = await load(qrUrl); ctx.drawImage(qr, 98 * s, (height / s - 410) * s, 210 * s, 210 * s); } catch {}
    ctx.textAlign = "left";
    ctx.fillStyle = "#167a3d";
    ctx.font = `800 ${36 * s}px Arial`;
    ctx.fillText("LINE 官方帳號 @158vkyka", 350 * s, (height / s - 325) * s);
    ctx.fillStyle = "#1f1c18";
    ctx.font = `600 ${27 * s}px Arial`;
    ctx.fillText("塔羅｜占星｜催眠｜元辰宮｜祈福疏文", 350 * s, (height / s - 270) * s);
    ctx.font = `500 ${23 * s}px Arial`;
    ctx.fillText("想以民俗祈福寄託心願，可洽少甫疏文服務", 350 * s, (height / s - 220) * s);
    ctx.fillStyle = "#675947";
    ctx.font = `500 ${20 * s}px Arial`;
    ctx.fillText("純屬娛樂、民俗文化與情緒自我探索", 350 * s, (height / s - 175) * s);
    return canvas;
  }

  async function download(kind: "share" | "a4") {
    const canvas = await drawResult(kind === "share" ? 1080 : 1240, kind === "share" ? 1350 : 1754);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = kind === "share" ? "元辰小人宮-退散符-分享圖.png" : "元辰小人宮-退散符-A4.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function shareResult() {
    const canvas = await drawResult(1080, 1350);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = blob ? new File([blob], "元辰小人宮-退散符.png", { type: "image/png" }) : null;
    if (file && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try { await navigator.share({ title: "元辰小人宮", text: "今天的鳥事，退散！", files: [file] }); return; } catch {}
    }
    await download("share");
  }

  return <main className="site-shell"><section className="game-card" aria-live="polite">
    <header className="game-header"><div className="sun-doodle" aria-hidden>令</div><div><p className="eyebrow">少甫的情緒退散儀式</p><h1>元辰小人宮</h1></div><div className="spiral" aria-hidden>敕</div></header>
    <div className="stepper" aria-label={`步驟 ${step}／4`}>{[1, 2, 3, 4].map((number) => <span key={number} className={number <= step ? "active" : ""}>{number}</span>)}</div>

    {step === 1 && <div className="screen screen-enter">
      <div className="burst-title"><h2>今天想讓哪個小人退散？</h2></div>
      <RadioGroup value={gender} onValueChange={(value) => setGender(value as Gender)} className="gender-grid">
        {(["male", "female"] as Gender[]).map((item) => <label key={item} className={`choice-card ${gender === item ? "selected" : ""}`}>
          <RadioGroupItem value={item} className="sr-only" />
          <img src={`/dolls/talisman-${item}-v2.png`} alt={item === "male" ? "男式黃符紙小人" : "女式黃符紙小人"} />
          <strong>{item === "male" ? "男紙人" : "女紙人"}</strong>
        </label>)}
      </RadioGroup>
      <Button className="crayon-button primary" onClick={() => { setStep(2); if (music) startAmbient(); }}>開始退散</Button>
      <p className="privacy-note">不用照片，只把姓名與職位／關係寫上符紙小人。</p>
    </div>}

    {step === 2 && <div className="screen screen-enter">
      <div className="burst-title"><h2>把對方資料寫上小人</h2></div>
      <DollStage src={dollSrc} damageClass="" name={displayName} role={displayRole} />
      <div className="inscription-guide"><strong>紙人怎麼寫？</strong><span>填入姓名與職位／關係，兩項資料會以朱砂字樣直排寫在小人身上。</span></div>
      <div className="field-grid two-fields">
        <label>姓名<input maxLength={12} value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：王大明" /></label>
        <label>職位／關係<input maxLength={12} value={role} onChange={(event) => setRole(event.target.value)} placeholder="例如：主管、前任" /></label>
      </div>
      <Button className="crayon-button primary" onClick={() => setStep(3)}>寫好了，選退散工具</Button>
    </div>}

    {step === 3 && <div className="screen screen-enter">
      <div className="hud"><div><span>敲打</span><strong>{hits}</strong><small>次</small></div><div className="meter"><span>壓力釋放 {release}%</span><Progress value={release} /></div><div className="audio-controls"><label title="背景音樂"><Music2 /><Switch checked={music} onCheckedChange={toggleMusic} aria-label="背景音樂" /></label><label title="敲擊音效">{sound ? <Volume2 /> : <VolumeX />}<Switch checked={sound} onCheckedChange={setSound} aria-label="敲擊音效" /></label></div></div>
      <button className={`hit-zone ${impact ? "is-hit" : ""}`} onClick={hit} aria-label={`使用${toolInfo[tool].label}敲打紙人`}>
        <DollStage src={dollSrc} damageClass={damageClass} name={displayName} role={displayRole} labels={false} />
        <span className={`tool-swing tool-${tool}`}>{toolInfo[tool].emoji}</span>{impact && <span className="impact-word">{toolInfo[tool].phrase}</span>}<span className="hit-hint">點紙人開始敲打，每下都有不同音符</span>
      </button>
      <RadioGroup value={tool} onValueChange={(value) => setTool(value as Tool)} className="tools-grid">{(Object.keys(toolInfo) as Tool[]).map((item) => <label key={item} className={`tool-card ${tool === item ? "selected" : ""}`}><RadioGroupItem value={item} className="sr-only" /><span>{toolInfo[item].emoji}</span><strong>{toolInfo[item].label}</strong></label>)}</RadioGroup>
      <Button className="crayon-button primary" disabled={hits < 5} onClick={finish}>{hits < 5 ? `再敲 ${5 - hits} 下` : "完成退散"}</Button>
    </div>}

    {step === 4 && <div className="screen screen-enter result-screen">
      <div className="burst-title"><h2>你的退散符完成了</h2></div>
      <div className="result-sheet result-triad"><aside className="vertical-reminder reminder-left"><span>{reminderLeft}</span></aside><div className="result-doll"><DollStage src={dollSrc} damageClass="damage-4" name={displayName} role={displayRole} labels={false} /></div><aside className="vertical-reminder reminder-right"><span>{reminderRight}</span></aside></div>
      <div className="download-grid"><Button variant="outline" onClick={() => download("share")}><Download />下載手機分享圖</Button><Button variant="outline" onClick={() => download("a4")}><Printer />下載 A4 列印版</Button></div>
      <Button className="share-button" onClick={shareResult}><Share2 />分享</Button>
      <aside className="line-card"><img src={qrUrl} alt="加入 LINE 官方帳號 @158vkyka 的 QR Code" crossOrigin="anonymous" /><div><a href={lineUrl} target="_blank" rel="noreferrer">LINE 官方帳號 @158vkyka</a><p>塔羅｜占星｜催眠｜元辰宮｜祈福疏文</p><small>想以民俗祈福寄託心願，可洽少甫疏文服務</small></div></aside>
      <p className="disclaimer">純屬娛樂、民俗文化與情緒自我探索，不代替心理、醫療或其他專業協助。</p>
      <Button variant="ghost" onClick={reset}><RotateCcw />重新玩一次</Button>
    </div>}
  </section></main>;
}

function DollStage({ src, damageClass, name, role, labels = true }: { src: string; damageClass: string; name: string; role: string; labels?: boolean }) {
  return <div className={`doll-stage talisman-doll ${damageClass}`}>
    <img className="doll-art" src={src} alt="黃符紙小人" />
    <div className={`doll-inscription ${labels ? "" : "values-only"}`} aria-label={`紙人資料：姓名 ${name}，職位或關係 ${role}`}>
      <span>{labels && <b>姓名</b>}{name}</span><span>{labels && <b>職位</b>}{role}</span>
    </div>
    <span className="bruise" aria-hidden>〽</span><span className="bandage" aria-hidden>鎮</span><span className="smoke" aria-hidden>☁</span><span className="stamp-mark" aria-hidden>退散</span>
  </div>;
}

function drawVerticalText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number, maxHeight: number) {
  let column = 0;
  let offset = 0;
  for (const char of text) {
    if (offset + lineHeight > maxHeight) { column += 1; offset = 0; }
    ctx.fillText(char, x - column * lineHeight, y + offset);
    offset += lineHeight;
  }
}

function splitReminder(text: string): [string, string] {
  const clean = text.replace(/。$/, "");
  const middle = clean.length / 2;
  const punctuation = [...clean].map((char, index) => "，；、".includes(char) ? index : -1).filter((index) => index >= 0);
  const splitAt = punctuation.length ? punctuation.reduce((best, index) => Math.abs(index - middle) < Math.abs(best - middle) ? index : best) + 1 : Math.ceil(middle);
  return [clean.slice(0, splitAt), `${clean.slice(splitAt)}。`];
}
