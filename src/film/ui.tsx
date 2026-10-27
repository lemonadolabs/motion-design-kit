// The example product screen (Lemonado's Creatives screen with the Ask AI panel), rebuilt in code from
// a screen recording of the app. Replace it with your own product's screens (docs/REBUILD-UI.md). Laid out in app space (2000 x 1125) like the launch film,
// placed on the stage by <ProductWindow>. Vitalé (fictional brand) is the workspace.
import React from 'react';
import {Img} from 'remotion';
import {
  BarChart3, Calendar, Check, ChevronDown, Ellipsis, ExternalLink, House, Images, LayoutGrid, Link2, Palette, Cable, SquarePlus, CalendarClock, Globe,
  Search, Settings, SquarePen, X, ArrowUp, ArrowUpDown, TrendingDown, Bell, Play,
} from 'lucide-react';
import {display, pub, ui} from '../lib/grammar';
import {PlatformIcons} from '../lib/icons';
import {Mark} from '../lib/brand';

export const APP_W = 2000;
export const APP_H = 1125;

export const A = {
  ink: '#1c1917',
  text2: '#44403c',
  text3: '#78716c',
  text4: '#a8a29e',
  line: 'rgba(28,25,23,0.08)',
  pill: 'rgba(255,255,255,0.78)',
  bubble: '#FCDCD3',
  bubbleB: '#F5BDAE',
};

// Ad creatives in the product shots. The kit ships no images: each ad is a neutral placeholder tile.
// Put your own (fictional) ad images in public/ads/ and swap <AdImage> for <Img src={pub(...)} />.
const AD_TONES = ['#E9E6F5', '#E3EEF0', '#F2E8E1', '#E6EBE2', '#EFE6EC', '#E4E8F2'];
export const AdImage: React.FC<{n: number; style?: React.CSSProperties}> = ({n, style}) => (
  <div style={{...style, background: `linear-gradient(150deg, ${AD_TONES[n % AD_TONES.length]}, #D9D9DE)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <svg width="18%" viewBox="0 0 24 24" fill="none" stroke="rgba(11,21,43,0.28)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4.5-4.5L6 21" />
    </svg>
  </div>
);

export type Ad = {img: number; title: string; kind: 'Video' | 'Image'; plat: string[]; imp: number; ctr: number; hook: number | null};
export const ADS: Record<number, Ad> = {
  7: {img: 7, title: 'VT12 | Spin class | v3', kind: 'Video', plat: ['meta', 'ig'], imp: 42180, ctr: 2.31, hook: 34.2},
  1: {img: 1, title: 'VT08 | Yoga can | v2', kind: 'Video', plat: ['tiktok'], imp: 38904, ctr: 2.08, hook: 31.8},
  9: {img: 9, title: 'VT15 | Ice bowl party | v1', kind: 'Video', plat: ['meta', 'ig'], imp: 51330, ctr: 1.86, hook: 28.4},
  3: {img: 3, title: 'VT04 | Cans on ice | v4', kind: 'Video', plat: ['tiktok'], imp: 29412, ctr: 1.12, hook: 22.1},
  5: {img: 5, title: 'VT02 | Metro tunnel | v2', kind: 'Video', plat: ['meta'], imp: 24076, ctr: 0.98, hook: 17.6},
  2: {img: 2, title: 'VT01 | Billboard | v1', kind: 'Video', plat: ['meta', 'ig'], imp: 33519, ctr: 0.74, hook: 12.3},
  4: {img: 4, title: 'VT09 | Hand and lime | v2', kind: 'Image', plat: ['meta', 'ig'], imp: 27650, ctr: 1.64, hook: null},
  0: {img: 0, title: 'VT03 | Daily nutrition | v1', kind: 'Image', plat: ['meta'], imp: 18240, ctr: 1.42, hook: null},
  6: {img: 6, title: 'VT10 | Pour evolved | v1', kind: 'Image', plat: ['meta', 'ig'], imp: 21115, ctr: 1.27, hook: null},
  8: {img: 8, title: 'VT06 | Same hydration | v2', kind: 'Image', plat: ['meta'], imp: 16890, ctr: 1.05, hook: null},
};
export const INITIAL = [4, 1, 0, 9, 6, 3, 8, 7];
export const SORTED = [7, 1, 9, 3, 5, 2];
export const FATIGUED = [3, 2];
export const PICKED = [7, 1, 9];

// ---------- layout ----------
export const MAIN_L = 316;
export const mainR = (open: number) => 1984 + (1595 - 1984) * open;
export const GAP = 18;
export const GRID_TOP = 186;
export const colW = (open: number) => (mainR(open) - MAIN_L - 3 * GAP) / 4;
export const imgH = (cw: number) => cw * 1.28;
export const cardH = (cw: number) => imgH(cw) + 128;
export const slotXY = (slot: number, open: number) => {
  const cw = colW(open);
  return {x: MAIN_L + (slot % 4) * (cw + GAP), y: GRID_TOP + Math.floor(slot / 4) * (cardH(cw) + GAP), w: cw};
};
/** The Ask AI button in the filter row (app px), so scenes can aim the camera and cursor at it. */
export const askBtn = (open: number) => ({x: mainR(open) - 104, y: 74, w: 104, h: 40});
export const PANEL = {x: 1610, y: 16, w: 374, h: 1093};

// ---------- background + sidebar ----------
export const AppBg: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #FDF9F6 0%, #FBF0EA 45%, #F8E3DA 100%)'}} />
);

const NAV: [string, React.FC<any>][] = [['Home', House], ['Creatives', Images], ['Studio', Palette], ['Connectors', Cable], ['Skills', SquarePlus], ['Routines', CalendarClock], ['Portal', Globe]];

export const Sidebar: React.FC = () => (
  <div style={{position: 'absolute', left: 16, top: 16, width: 268, height: 1093, borderRadius: 20, background: 'rgba(255,255,255,0.74)', border: `1px solid ${A.line}`, fontFamily: ui, color: A.ink}}>
    <div style={{position: 'absolute', left: 20, top: 24, display: 'flex', alignItems: 'center', gap: 10}}>
      <div style={{width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(145deg, #F4F6EE, #C9D6B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontWeight: 700, fontSize: 13, color: '#5E7A45'}}>V</div>
      <span style={{fontSize: 18, fontWeight: 600}}>Vitalé</span>
      <ChevronDown size={16} color={A.text4} />
    </div>
    <div style={{position: 'absolute', right: 18, top: 27, display: 'flex', gap: 14}}>
      <Bell size={19} color={A.text4} strokeWidth={1.7} />
      <Settings size={19} color={A.text4} strokeWidth={1.7} />
    </div>
    <div style={{position: 'absolute', left: 20, top: 74, display: 'flex', alignItems: 'center', gap: 12, fontSize: 17, fontWeight: 500}}>
      <SquarePen size={19} strokeWidth={1.7} />
      New chat
    </div>
    {NAV.map(([n, Icon], i) => (
      <div key={n} style={{position: 'absolute', left: 10, right: 10, top: 118 + i * 44, height: 40, borderRadius: 11, background: n === 'Creatives' ? 'rgba(28,25,23,0.065)' : 'transparent', display: 'flex', alignItems: 'center', gap: 13, paddingLeft: 12, fontSize: 17, fontWeight: n === 'Creatives' ? 600 : 500, color: n === 'Creatives' ? A.ink : A.text2}}>
        <Icon size={19} strokeWidth={1.6} color={n === 'Creatives' ? A.ink : A.text3} />
        {n}
      </div>
    ))}
    <div style={{position: 'absolute', left: 22, top: 450, fontSize: 14, color: A.text4, fontWeight: 500}}>Saved views</div>
    {[0.62, 0.48, 0.7, 0.55, 0.4].map((w, i) => (
      <div key={i} style={{position: 'absolute', left: 22, top: 492 + i * 40, display: 'flex', alignItems: 'center', gap: 13}}>
        <LayoutGrid size={17} strokeWidth={1.6} color={A.text4} />
        <div style={{width: 190 * w, height: 9, borderRadius: 5, background: 'rgba(28,25,23,0.09)'}} />
      </div>
    ))}
    <div style={{position: 'absolute', left: 16, right: 16, bottom: 18, display: 'flex', alignItems: 'center', gap: 11, fontSize: 16, color: A.text2}}>
      <div style={{width: 32, height: 32, borderRadius: '50%', background: '#EDE6E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600}}>TH</div>
      <span><b style={{fontWeight: 600, color: A.ink}}>Alex</b> · Acme Agency</span>
    </div>
  </div>
);

// ---------- top tabs + filter row ----------
const Pill: React.FC<{x: number; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, w, children, style}) => (
  <div style={{position: 'absolute', left: x, top: 74, width: w, height: 40, padding: w ? 0 : '0 14px', borderRadius: 11, background: A.pill, border: `1px solid ${A.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15.5, fontWeight: 500, color: A.text2, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

export const TopBar: React.FC<{open: number; sort: string; count?: number; press?: number; askGlow?: number; part?: 'all' | 'rest' | 'ask'}> = ({open, sort, count = 0, press = 0, askGlow = 0, part = 'all'}) => {
  const R = mainR(open);
  const b = askBtn(open);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: ui}}>
      {part !== 'ask' && <>
      <div style={{position: 'absolute', left: MAIN_L + 4, top: 22, height: 36, display: 'flex', alignItems: 'center', gap: 30, fontSize: 16.5, fontWeight: 500, color: A.text3}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}><Search size={17} strokeWidth={1.7} />Discover</span>
        <span style={{background: 'rgba(28,25,23,0.07)', color: A.ink, borderRadius: 10, padding: '6px 13px', margin: '0 -13px'}}>Ads</span>
        <span>Accounts</span>
        <span>Campaigns</span>
        <span>Ad sets</span>
        <span>Funnel</span>
      </div>
      <div style={{position: 'absolute', left: R - 230, top: 22, height: 36, display: 'flex', alignItems: 'center', gap: 26, fontSize: 16.5, fontWeight: 500, color: A.text3}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>Shares<span style={{width: 22, height: 22, borderRadius: 11, background: '#8b7cf6', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>5</span></span>
        <span>Settings</span>
      </div>
      <Pill x={MAIN_L}><Calendar size={16} strokeWidth={1.7} color={A.text3} />Oct 14 - 21, 2026<ChevronDown size={15} color={A.text4} /></Pill>
      <Pill x={MAIN_L + 222}><BarChart3 size={16} strokeWidth={1.7} color={A.text3} />Metrics</Pill>
      <Pill x={MAIN_L + 348}><ArrowUpDown size={16} strokeWidth={1.7} color={A.text3} />Sort: {sort}<ChevronDown size={15} color={A.text4} /></Pill>
      <Pill x={R - 262} w={96}><LayoutGrid size={16} strokeWidth={1.7} color={A.text3} />View</Pill>
      <Pill x={R - 156} w={42}><Ellipsis size={18} color={A.text3} /></Pill>
      </>}
      {part !== 'rest' && <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 11, background: A.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15.5, fontWeight: 600, transform: `scale(${1 - 0.07 * press})`, boxShadow: askGlow > 0 ? `0 0 0 ${4 * askGlow}px rgba(236,78,56,${0.22 * askGlow})` : undefined}}>
        Ask AI{count > 0 && <span style={{fontWeight: 500, opacity: 0.75}}>{count}</span>}
      </div>}
    </div>
  );
};

export const Chip: React.FC<{x: number; k: number; children: React.ReactNode}> = ({x, k, children}) => (
  <div style={{position: 'absolute', left: x, top: 132, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.85)', border: `1px solid ${A.line}`, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 9, fontFamily: ui, fontSize: 15, fontWeight: 500, color: A.text2, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 10}px) scale(${0.9 + 0.1 * k})`, transformOrigin: '0 50%', whiteSpace: 'nowrap'}}>
    {children}
  </div>
);

// ---------- creative card ----------
const fmt = (v: number) => Math.round(v).toLocaleString('en-US');
export const Card: React.FC<{
  ad: Ad; w: number; check?: number; veil?: number; tag?: number; ring?: number; hookHi?: number; style?: React.CSSProperties;
}> = ({ad, w, check = 0, veil = 0, tag = 0, ring = 0, hookHi = 0, style}) => {
  const ih = imgH(w);
  const rows: [string, string][] = [
    ['Impressions', fmt(ad.imp)],
    ['CTR', ad.ctr.toFixed(2) + '%'],
    ['Hook rate', ad.hook === null ? '–' : ad.hook.toFixed(1) + '%'],
  ];
  return (
    <div style={{position: 'absolute', width: w, height: cardH(w), borderRadius: 16, background: '#fff', border: `1px solid ${A.line}`, boxShadow: '0 1px 2px rgba(28,25,23,0.04)', fontFamily: ui, ...style}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: w, height: ih, background: '#EFE9E4'}}>
          <AdImage n={ad.img} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
        </div>
        <div style={{position: 'absolute', left: 12, top: ih - 38, height: 26, borderRadius: 13, background: 'rgba(28,25,23,0.62)', color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px'}}>
          {ad.kind === 'Video' && <Play size={11} fill="#fff" strokeWidth={0} />}{ad.kind}
        </div>
        <div style={{position: 'absolute', left: 12, top: ih + 12, right: 12, display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden'}}>
          <PlatformIcons list={ad.plat} size={26} />
          <span style={{fontSize: 15.5, fontWeight: 600, color: A.ink, whiteSpace: 'nowrap'}}>{ad.title}</span>
        </div>
        {rows.map(([k, v], i) => (
          <div key={k} style={{position: 'absolute', left: 12, right: 12, top: ih + 50 + i * 25, height: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15}}>
            {i === 2 && hookHi > 0 && <div style={{position: 'absolute', left: -6, right: -6, top: -1, bottom: -1, borderRadius: 7, background: `rgba(28,25,23,${0.06 * hookHi})`}} />}
            <span style={{position: 'relative', color: A.text3}}>{k}</span>
            <span style={{position: 'relative', color: A.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{v}</span>
          </div>
        ))}
        {veil > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(253,249,246,${0.72 * veil})`}} />}
      </div>
      {/* selection box, like the real grid */}
      <div style={{position: 'absolute', left: 12, top: 12, width: 28, height: 28, borderRadius: 8, background: check > 0.5 ? A.ink : 'rgba(255,255,255,0.9)', border: check > 0.5 ? 'none' : '1.5px solid rgba(28,25,23,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.18 * Math.sin(Math.PI * Math.min(1, check))})`, opacity: 1 - veil * 0.7}}>
        {check > 0.5 && <Check size={18} color="#fff" strokeWidth={3} />}
      </div>
      {tag > 0 && (
        <div style={{position: 'absolute', left: 50, top: 12, height: 30, borderRadius: 15, background: A.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px 0 10px', fontSize: 14.5, fontWeight: 600, opacity: Math.min(1, tag * 1.6), transform: `scale(${0.7 + 0.3 * tag})`, transformOrigin: '0 50%'}}>
          <TrendingDown size={16} strokeWidth={2.2} />Fatiguing
        </div>
      )}
      {ring > 0 && <Ring w={w} h={cardH(w)} k={ring} />}
    </div>
  );
};

/** A gradient border that sweeps around the card once (k 0 → 1). */
export const Ring: React.FC<{w: number; h: number; k: number}> = ({w, h, k}) => {
  const r = 17;
  const per = 2 * (w + h) - (8 - 2 * Math.PI) * r;
  return (
    <svg width={w + 8} height={h + 8} style={{position: 'absolute', left: -4, top: -4, overflow: 'visible'}}>
      <defs>
        <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0609a" />
          <stop offset="0.5" stopColor="#ec4e38" />
          <stop offset="1" stopColor="#ef9a3a" />
        </linearGradient>
      </defs>
      <rect x={2} y={2} width={w + 4} height={h + 4} rx={r + 2} fill="none" stroke="url(#ring-g)" strokeWidth={3.5} strokeDasharray={per + 40} strokeDashoffset={(per + 40) * (1 - k)} strokeLinecap="round" />
    </svg>
  );
};

// ---------- Ask AI panel ----------
export const Panel: React.FC<{slide?: number; children?: React.ReactNode}> = ({slide = 1, children}) => (
  <div style={{position: 'absolute', left: PANEL.x + (1 - slide) * 420, top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 20, background: 'rgba(255,255,255,0.9)', border: `1px solid ${A.line}`, boxShadow: '0 10px 40px rgba(80,40,30,0.08)', fontFamily: ui, color: A.ink, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 20, top: 22, display: 'flex', alignItems: 'center', gap: 10}}>
      <LemonGlyph size={20} />
      <span style={{fontSize: 18, fontWeight: 600}}>Ask AI</span>
    </div>
    <div style={{position: 'absolute', right: 18, top: 24, display: 'flex', gap: 16}}>
      <SquarePen size={18} color={A.text3} strokeWidth={1.7} />
      <ExternalLink size={18} color={A.text3} strokeWidth={1.7} />
      <X size={19} color={A.text3} strokeWidth={1.8} />
    </div>
    <div style={{position: 'absolute', left: 20, top: 56, fontSize: 14, color: A.text3}}>Ads · 2026-10-14 to 2026-10-21</div>
    <div style={{position: 'absolute', left: 20, right: 20, top: 100}}>{children}</div>
    <div style={{position: 'absolute', left: 14, right: 14, bottom: 14, height: 104, borderRadius: 16, background: '#fff', border: `1px solid ${A.line}`}}>
      <div style={{position: 'absolute', left: 16, top: 16, fontSize: 16.5, color: A.text4}}>Ask about your ads...</div>
      <div style={{position: 'absolute', right: 12, bottom: 12, width: 32, height: 32, borderRadius: 16, background: '#E7E2DE', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <ArrowUp size={17} color="#fff" strokeWidth={2.4} />
      </div>
    </div>
  </div>
);

/** The small gray logo glyph in the panel header. */
export const LemonGlyph: React.FC<{size?: number; color?: string}> = ({size = 20, color = '#C9C2BD'}) => <Mark size={size} color={color} />;

/** A block that appears with a short rise (k 0 → 1). */
export const Rise: React.FC<{k: number; children: React.ReactNode; style?: React.CSSProperties}> = ({k, children, style}) => (
  <div style={{opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 14}px)`, filter: k < 0.98 ? `blur(${(1 - k) * 5}px)` : undefined, ...style}}>{children}</div>
);

export const Bubble: React.FC<{k: number; text: string}> = ({k, text}) => (
  <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 18}}>
    <div style={{maxWidth: 290, background: A.bubble, border: `1px solid ${A.bubbleB}`, borderRadius: 20, padding: '13px 18px', fontSize: 19, lineHeight: 1.4, color: A.ink, opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - k) * 26}px) scale(${0.92 + 0.08 * k})`, transformOrigin: '100% 100%'}}>{text}</div>
  </div>
);

export const UsedMemory: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: A.text3, marginBottom: 14}}>
    <Check size={15} strokeWidth={2} />Used memory
  </div>
);

// ---------- the board (Studio artifact) ----------
export const RETENTION = [
  [100, 86, 74, 66, 60, 56, 53, 51, 49, 48],
  [100, 83, 70, 61, 55, 51, 48, 46, 44, 43],
  [100, 80, 66, 57, 51, 47, 44, 42, 40, 39],
];

export const Curve: React.FC<{data: number[]; w: number; h: number; k: number; id: string}> = ({data, w, h, k, id}) => {
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - (v / 100) * h * 0.92]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  const len = w * 1.25;
  return (
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(236,78,56,0.16)" />
          <stop offset="1" stopColor="rgba(236,78,56,0)" />
        </linearGradient>
        <clipPath id={`clip-${id}`}><rect x={0} y={-10} width={w * k} height={h + 20} /></clipPath>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="rgba(28,25,23,0.06)" />)}
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#fill-${id})`} clipPath={`url(#clip-${id})`} />
      <path d={d} fill="none" stroke="#E8573F" strokeWidth={3} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
    </svg>
  );
};

export const BoardShell: React.FC<{k: number; open?: number; children: React.ReactNode}> = ({k, open = 1, children}) => (
  <div style={{position: 'absolute', left: MAIN_L, top: 70, width: mainR(open) - MAIN_L, height: 1040, borderRadius: 20, background: '#fff', border: `1px solid ${A.line}`, boxShadow: '0 20px 60px rgba(80,40,30,0.10)', fontFamily: ui, color: A.ink, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 60}px) scale(${0.97 + 0.03 * k})`, transformOrigin: '50% 0'}}>
    {children}
  </div>
);

export {display, ui, Link2};
