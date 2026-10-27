// Small source badges on the example's cards. Third-party logos are trademarks, so the kit ships neutral
// letter badges instead. Swap in icons you are allowed to use for your own product.
import React from 'react';

const Badge = (label: string): React.FC<{size: number}> => ({size}) => (
  <div style={{width: size, height: size, borderRadius: size / 4, background: '#E7E7EC', color: '#5A5F6E', fontSize: size * 0.55, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{label}</div>
);
export const PLATFORM_ICON: Record<string, React.FC<{size: number}>> = {
  meta: Badge('A'),
  ig: Badge('B'),
  tiktok: Badge('C'),
  google: Badge('D'),
  pinterest: Badge('E'),
  snapchat: Badge('F'),
};
export const PlatformIcons: React.FC<{list: string[]; size?: number; pop?: number; lift?: number}> = ({list, size = 28, pop = 1, lift = 0}) => (
  <div style={{display: 'flex', alignItems: 'center', transform: `translateY(${-lift}px) scale(${pop})`, transformOrigin: '0 50%', filter: pop > 1.02 ? `drop-shadow(0 ${6 * (pop - 1)}px ${10 * (pop - 1)}px rgba(80,40,30,0.18))` : undefined}}>
    {list.map((p, i) => {
      const I = PLATFORM_ICON[p];
      return (
        <div key={p} style={{width: size, height: size, borderRadius: '50%', background: '#fff', border: '1px solid #eee4e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i ? -6 : 0, zIndex: 5 - i, position: 'relative'}}>
          <I size={size * 0.58} />
        </div>
      );
    })}
  </div>
);

