import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import type { CapturedSignature } from '../stores/fieldCall';

interface SignaturePadProps {
  value: CapturedSignature | null;
  onChange: (sig: CapturedSignature | null) => void;
  defaultSigner?: string;
  consent?: string;
}

export const DEFAULT_CONSENT =
  'I confirm this visit took place today and that any samples or order listed were received or placed by me.';

export default function SignaturePad({ value, onChange, defaultSigner = '', consent = DEFAULT_CONSENT }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [signer, setSigner] = useState(defaultSigner);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!signer && defaultSigner) setSigner(defaultSigner);
  }, [defaultSigner]);

  // Size the backing store to the element so strokes stay sharp on high-DPI phones.
  useEffect(() => {
    if (value) return;
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, Math.round(rect.width * ratio));
    c.height = Math.max(1, Math.round(rect.height * ratio));
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#142A5A';
    setHasInk(false);
  }, [value]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    e.preventDefault();
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = point(e);
    ctx.lineWidth = e.pointerType === 'pen' ? 1.2 + (e.pressure || 0.5) * 2 : 2.2;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  };

  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  const accept = () => {
    const c = canvasRef.current;
    if (!c) return;
    onChange({ signer: signer.trim(), dataUrl: c.toDataURL('image/png'), signedAt: new Date().toISOString(), consent });
  };

  if (value) {
    return (
      <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-3">
        <div className="rounded-lg bg-white border border-leaf-100 flex items-center justify-center h-24 overflow-hidden">
          <img src={value.dataUrl} alt={`Signature of ${value.signer}`} className="max-h-full max-w-full" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px] text-leaf-800">
            <span className="font-bold">Signed by {value.signer}</span> · {new Date(value.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button type="button" onClick={() => { onChange(null); setAgreed(false); }} className="text-[11px] font-bold text-leaf-700 hover:text-leaf-900 btn-press">
            Clear and re-sign
          </button>
        </div>
      </div>
    );
  }

  const canAccept = hasInk && signer.trim().length > 1 && agreed;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-bold text-navy-400 tracking-wider uppercase">Signer name</label>
        <input
          type="text"
          value={signer}
          onChange={e => setSigner(e.target.value)}
          placeholder="e.g. Dr. T. Adebayo"
          className="input-field w-full mt-1 px-3 py-2 rounded-lg bg-paper border border-navy-100 text-sm text-ink"
        />
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={up}
          aria-label="Signature area. Draw with a finger, stylus or mouse."
          className="w-full h-36 rounded-xl border-2 border-dashed border-navy-200 bg-paper cursor-crosshair block"
          style={{ touchAction: 'none' }}
        />
        {!hasInk && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-navy-400 font-medium pointer-events-none">
            Customer signs here
          </p>
        )}
        <div className="absolute left-4 right-4 bottom-6 border-b border-navy-200 pointer-events-none" />
      </div>
      <label className="flex items-start gap-2 text-[11px] text-navy-600 leading-relaxed cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-leaf-500" />
        <span>{consent}</span>
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={clear} disabled={!hasInk} className="flex-1 py-2 rounded-lg border border-navy-200 text-navy-700 text-xs font-bold btn-press disabled:opacity-50">
          Clear
        </button>
        <button
          type="button"
          onClick={accept}
          disabled={!canAccept}
          className="flex-[2] py-2 rounded-lg bg-navy-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 btn-press disabled:opacity-50"
        >
          <Icon name="edit" size={13} /> Accept signature
        </button>
      </div>
      {!canAccept && (
        <p className="text-[10px] text-navy-400">
          {!hasInk ? 'Draw the signature above.' : signer.trim().length < 2 ? 'Enter the signer name.' : 'The customer must tick the consent line.'}
        </p>
      )}
    </div>
  );
}
