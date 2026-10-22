import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import {
  CONSENT_TYPE_LABEL, CONSENT_WORDING, CONSENT_WORDING_VERSION, newReceiptId,
  type ConsentChannel, type ConsentRecord, type ConsentType, type LawfulBasis,
} from '../assets/leads';

interface ConsentCaptureProps {
  contactName: string;
  capturedBy: string;
  onCapture: (record: ConsentRecord) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const CHANNELS: ConsentChannel[] = ['In person · verbal', 'In person · signed', 'WhatsApp', 'Email'];
const TYPES: ConsentType[] = ['processing', 'productInfo', 'marketing'];

export const formatStamp = (iso: string) =>
  new Date(iso).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Finger signature on a canvas, for "In person · signed".
function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height };
  };
  const clear = () => {
    const c = ref.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    onChange(false);
  };
  return (
    <div>
      <canvas
        ref={ref}
        width={600}
        height={160}
        aria-label="Signature pad"
        className="w-full h-28 rounded-xl bg-white border-2 border-dashed border-navy-200 touch-none"
        onPointerDown={e => {
          drawing.current = true;
          const ctx = e.currentTarget.getContext('2d');
          const p = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(p.x, p.y);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext('2d');
          if (!ctx) return;
          const p = pos(e);
          ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e2a4a';
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          onChange(true);
        }}
        onPointerUp={() => { drawing.current = false; }}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-navy-400">Contact signs with a finger</span>
        <button type="button" onClick={clear} className="text-[11px] font-bold text-navy-500 hover:text-navy-800">Clear</button>
      </div>
    </div>
  );
}

export function ConsentReceipt({ record, compact = false }: { record: ConsentRecord; compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-leaf-200 bg-leaf-50 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon name="checkCircle" size={14} className="text-leaf-700" />
          <p className="text-xs font-bold text-leaf-800">Consent record</p>
        </div>
        <span className="font-mono text-[11px] font-bold text-leaf-800">{record.receiptId}</span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <dt className="text-navy-400">Consented to</dt>
        <dd className="text-navy-700 font-semibold">{record.types.map(t => CONSENT_TYPE_LABEL[t].label).join(', ')}</dd>
        <dt className="text-navy-400">Lawful basis</dt>
        <dd className="text-navy-700 font-semibold">{record.lawfulBasis} · NDPA 2023</dd>
        <dt className="text-navy-400">Channel</dt>
        <dd className="text-navy-700 font-semibold">{record.channel}{record.signed ? ' · signature on file' : ''}</dd>
        <dt className="text-navy-400">Captured by</dt>
        <dd className="text-navy-700 font-semibold">{record.capturedBy}</dd>
        <dt className="text-navy-400">Timestamp</dt>
        <dd className="text-navy-700 font-semibold">{formatStamp(record.capturedAt)}</dd>
      </dl>
      {!compact && <p className="text-[10px] text-navy-500 mt-2">Wording {record.wordingVersion}</p>}
    </div>
  );
}

// NDPC-compliant consent capture. Built for one thumb: large toggles, sticky primary action.
export default function ConsentCapture({ contactName, capturedBy, onCapture, onCancel, submitLabel = 'Continue' }: ConsentCaptureProps) {
  const [types, setTypes] = useState<ConsentType[]>(['processing', 'productInfo']);
  const [basis, setBasis] = useState<LawfulBasis>('Consent');
  const [channel, setChannel] = useState<ConsentChannel>('In person · verbal');
  const [signed, setSigned] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [record, setRecord] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);

  // Marketing contact needs consent under the NDPA; legitimate interest cannot cover it.
  const marketingBlocked = basis === 'Legitimate interest';
  useEffect(() => {
    if (marketingBlocked) setTypes(t => t.filter(x => x !== 'marketing'));
  }, [marketingBlocked]);

  const toggle = (t: ConsentType) => {
    if (t === 'marketing' && marketingBlocked) return;
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const needsSignature = channel === 'In person · signed';
  const ready = types.includes('processing') && (!needsSignature || signed);

  const record_ = () => {
    const d = new Date();
    setRecord({
      receiptId: newReceiptId(d), contactName, types: TYPES.filter(t => types.includes(t)), lawfulBasis: basis,
      channel, capturedBy, capturedAt: d.toISOString(), wordingVersion: CONSENT_WORDING_VERSION, signed: needsSignature && signed,
    });
  };

  if (record) {
    return (
      <div className="space-y-3 fade-up">
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-leaf-100 mx-auto flex items-center justify-center"><Icon name="checkCircle" size={24} className="text-leaf-700" /></div>
          <p className="font-display font-bold text-ink mt-2">Consent recorded for {contactName}</p>
          <p className="text-xs text-navy-500">Stored with the contact and in the consent register</p>
        </div>
        <ConsentReceipt record={record} />
        <button type="button" onClick={() => onCapture(record)} className="w-full min-h-[48px] rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-sm font-bold btn-press">
          {submitLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-1.5">
          <Icon name="lock" size={14} className="text-navy-600" />
          <p className="stat-label text-navy-500">NDPC consent · {contactName || 'new contact'}</p>
        </div>
        <div className="mt-2 p-3 rounded-xl bg-paper border border-navy-100 max-h-32 overflow-y-auto">
          <p className="text-xs text-navy-700 leading-relaxed">“{CONSENT_WORDING}”</p>
          <p className="text-[10px] text-navy-400 mt-2">{CONSENT_WORDING_VERSION}</p>
        </div>
        <p className="text-[11px] text-navy-500 mt-1.5">Read this to the contact or hand them the phone.</p>
      </div>

      <div>
        <p className="stat-label text-navy-400 mb-2">They agree to</p>
        <div className="space-y-2">
          {TYPES.map(t => {
            const on = types.includes(t);
            const locked = t === 'marketing' && marketingBlocked;
            return (
              <button
                key={t}
                type="button"
                role="checkbox"
                aria-checked={on}
                disabled={locked}
                onClick={() => toggle(t)}
                className={`w-full min-h-[56px] flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left btn-press transition-colors ${on ? 'bg-leaf-50 border-leaf-300' : 'bg-white border-navy-200'} ${locked ? 'opacity-50' : ''}`}
              >
                <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${on ? 'bg-leaf-600 text-white' : 'border-2 border-navy-300'}`}>
                  {on && <Icon name="check" size={14} />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-ink">{CONSENT_TYPE_LABEL[t].label}{t === 'processing' && <span className="text-rose-600"> *</span>}</span>
                  <span className="block text-[11px] text-navy-500 leading-snug">{locked ? 'Needs consent as the lawful basis' : CONSENT_TYPE_LABEL[t].hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="stat-label text-navy-400 mb-2">Lawful basis</p>
        <div className="grid grid-cols-2 gap-2">
          {(['Consent', 'Legitimate interest'] as LawfulBasis[]).map(b => (
            <button key={b} type="button" onClick={() => setBasis(b)} aria-pressed={basis === b}
              className={`min-h-[44px] rounded-xl text-xs font-bold btn-press ${basis === b ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="stat-label text-navy-400 mb-2">How they gave it</p>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map(c => (
            <button key={c} type="button" onClick={() => { setChannel(c); setSigned(false); }} aria-pressed={channel === c}
              className={`min-h-[44px] px-2 rounded-xl text-xs font-bold btn-press ${channel === c ? 'bg-navy-800 text-white' : 'bg-white border border-navy-200 text-navy-600'}`}>
              {c}
            </button>
          ))}
        </div>
        {needsSignature && <div className="mt-3"><SignaturePad onChange={setSigned} /></div>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-paper"><p className="stat-label text-navy-400">Captured by</p><p className="text-navy-700 font-semibold mt-0.5">{capturedBy}</p></div>
        <div className="p-2.5 rounded-xl bg-paper"><p className="stat-label text-navy-400">Timestamp</p><p className="text-navy-700 font-semibold mt-0.5">{formatStamp(now.toISOString())}</p></div>
      </div>

      <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-white flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="min-h-[48px] px-4 rounded-xl border border-navy-200 text-sm font-bold text-navy-600 btn-press">Back</button>
        )}
        <button type="button" onClick={record_} disabled={!ready}
          className="flex-1 min-h-[48px] rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 btn-press disabled:opacity-50">
          <Icon name="fingerprint" size={16} /> Record consent
        </button>
      </div>
      {!ready && (
        <p className="text-[11px] text-navy-500 text-center -mt-2">
          {types.includes('processing') ? 'Ask the contact to sign above' : 'Data processing consent is required to save the contact'}
        </p>
      )}
    </div>
  );
}
