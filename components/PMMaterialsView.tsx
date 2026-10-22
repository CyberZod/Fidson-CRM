import { useState } from 'react';
import Icon from './Icon';
import AudiencePicker from './AudiencePicker';
import { MaterialViewer } from './RepMaterialsView';
import { useNotice } from './useNotice';
import {
  EMPTY_AUDIENCE, audienceLabel, resolveAudience, useMarketing,
  type Audience, type Material, type MaterialCategory,
} from '../stores/marketing';
import type { ToastInput } from '../types';

interface PMMaterialsViewProps {
  onToast?: (t: ToastInput) => void;
  sender?: string;
}

const PRODUCTS = ['Coflin Forte 600mg', 'Tuxil-N Syrup 100ml', 'Astrazon 10mg'];
const CATS: MaterialCategory[] = ['Clinical', 'Detailing', 'Competitive', 'Marketing'];

const catChip = (c: string) =>
  c === 'Clinical' ? 'bg-leaf-50 text-leaf-700' :
  c === 'Competitive' ? 'bg-rose-50 text-rose-700' :
  c === 'Marketing' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700';

const STUB_FILES = [
  { fileName: 'Coflin_Detailing_Q3_v1.pdf', format: 'PDF' as const, sizeMb: 4.2, pages: 6 },
  { fileName: 'Astrazon_Cardio_Leaflet.pdf', format: 'PDF' as const, sizeMb: 2.6, pages: 4 },
  { fileName: 'TuxilN_Pharmacy_Deck.pptx', format: 'PPT' as const, sizeMb: 8.9, pages: 16 },
];

interface UploadForm {
  file: typeof STUB_FILES[number] | null;
  title: string;
  product: string;
  cat: MaterialCategory;
  audience: Audience;
  note: string;
  urgent: boolean;
}

const EMPTY_UPLOAD: UploadForm = {
  file: null, title: '', product: PRODUCTS[0], cat: 'Detailing',
  audience: { ...EMPTY_AUDIENCE, channels: ['institution'] }, note: '', urgent: false,
};

export default function PMMaterialsView({ onToast, sender = 'Dr. Femi Akande' }: PMMaterialsViewProps) {
  const { materials, submitMaterial, pushMaterial } = useMarketing();
  const { notify, node } = useNotice(onToast);
  const [pushing, setPushing] = useState<Material | null>(null);
  const [pushAudience, setPushAudience] = useState<Audience>(EMPTY_AUDIENCE);
  const [preview, setPreview] = useState<Material | null>(null);
  const [upload, setUpload] = useState<UploadForm | null>(null);
  const [attaching, setAttaching] = useState(false);

  const attach = () => {
    setAttaching(true);
    window.setTimeout(() => {
      const f = STUB_FILES[Math.floor(Math.random() * STUB_FILES.length)];
      setUpload(u => u && ({ ...u, file: f, title: u.title || f.fileName.replace(/\.(pdf|pptx)$/, '').replace(/_/g, ' ') }));
      setAttaching(false);
    }, 700);
  };

  const submitUpload = () => {
    if (!upload?.file || !upload.title) return;
    const m = submitMaterial({
      title: upload.title, product: upload.product, cat: upload.cat, format: upload.file.format,
      fileName: upload.file.fileName, sizeMb: upload.file.sizeMb, pages: upload.file.pages,
      audience: upload.audience, note: upload.note || undefined, urgent: upload.urgent,
    }, sender);
    setUpload(null);
    notify({ type: 'success', title: 'Sent for content approval', msg: `${m.title} · waiting on Marketing Manager sign-off before reps see it` });
  };

  const pending = materials.filter(m => m.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="fade-up flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Detailing Materials Library</h2>
          <p className="text-sm text-navy-500 mt-1">Upload for approval · approved materials reach rep phones · track open rates{pending ? ` · ${pending} awaiting approval` : ''}</p>
        </div>
        <button onClick={() => setUpload(EMPTY_UPLOAD)} className="px-3 py-2 rounded-lg bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 btn-press hover:bg-violet-600">
          <Icon name="plus" size={12} /> Upload Material
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {materials.map((m, i) => (
          <div key={m.id} className={`fade-up stagger-${(i % 5) + 1} p-5 rounded-2xl bg-white border border-navy-100 card-hover flex flex-col`}>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Icon name="file" size={18} className="text-violet-700" />
              </div>
              <div className="flex items-center gap-1">
                {m.urgent && m.status === 'pending' && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">URGENT</span>}
                {m.isNew && <span className="px-1.5 py-0.5 rounded bg-violet-500 text-white text-[9px] font-bold">NEW</span>}
              </div>
            </div>
            <h4 className="font-display font-bold text-ink text-sm mt-3 leading-tight">{m.title}</h4>
            <p className="text-[11px] text-navy-500 mt-0.5">{m.format} · {m.pages} {m.format === 'PPT' ? 'slides' : 'pages'} · {m.sizeMb} MB · v{m.version}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${catChip(m.cat)}`}>{m.cat.toUpperCase()}</span>
              <span className="px-1.5 py-0.5 rounded bg-paper border border-navy-100 text-[9px] font-bold text-navy-700">{audienceLabel(m.audience)}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-navy-100 flex-1">
              {m.status === 'pending' ? (
                <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1"><Icon name="clock" size={11} /> Awaiting Marketing approval · submitted {m.submitted}</p>
              ) : m.status === 'rejected' ? (
                <p className="text-[11px] text-rose-700 font-bold">Sent back by {m.approvedBy} · revise and upload again</p>
              ) : m.pushed > 0 ? (
                <>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] font-bold text-navy-500 tracking-wider uppercase">Open Rate</span>
                    <span className="font-mono text-xs font-bold text-ink">{Math.round((m.opened / m.pushed) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${(m.opened / m.pushed) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-navy-500 mt-1.5">{m.opened} / {m.pushed} reps opened · approved by {m.approvedBy}</p>
                </>
              ) : (
                <p className="text-[10px] text-amber-700 font-bold">Approved · not pushed yet</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => { setPushing(m); setPushAudience(m.audience); }}
                disabled={m.status !== 'approved'}
                title={m.status !== 'approved' ? 'Available once Marketing approves' : undefined}
                className="flex-1 px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 btn-press flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="send" size={11} /> {m.pushed > 0 ? 'Re-target' : 'Push to Reps'}
              </button>
              <button onClick={() => setPreview(m)} className="px-2 py-1.5 rounded-lg bg-paper border border-navy-200 text-navy-700 hover:bg-navy-50 btn-press" aria-label="Preview">
                <Icon name="eye" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {upload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.5)' }} onClick={() => setUpload(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] overflow-y-auto slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-display font-bold text-ink">Upload Material</h3>
                <p className="text-[11px] text-navy-500">Goes to the Marketing Manager for approval before any rep sees it</p>
              </div>
              <button onClick={() => setUpload(null)} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center"><Icon name="x" size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {upload.file ? (
                <div className="p-3 rounded-xl bg-paper border border-navy-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center"><Icon name="file" size={16} className="text-violet-700" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-ink truncate">{upload.file.fileName}</p>
                    <p className="text-[11px] text-navy-500">{upload.file.format} · {upload.file.pages} {upload.file.format === 'PPT' ? 'slides' : 'pages'} · {upload.file.sizeMb} MB · virus scan passed</p>
                  </div>
                  <button onClick={() => setUpload({ ...upload, file: null })} className="text-[11px] font-bold text-navy-500 hover:text-rose-600">Replace</button>
                </div>
              ) : (
                <button onClick={attach} className="w-full p-5 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/40 text-center hover:bg-violet-50 btn-press">
                  <Icon name={attaching ? 'refresh' : 'download'} size={20} className={`text-violet-600 mx-auto ${attaching ? 'animate-spin' : ''}`} />
                  <p className="text-sm font-bold text-violet-700 mt-1">{attaching ? 'Uploading' : 'Choose file'}</p>
                  <p className="text-[11px] text-navy-500">PDF or PowerPoint · up to 50 MB</p>
                </button>
              )}

              <div>
                <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Title</label>
                <input value={upload.title} onChange={e => setUpload({ ...upload, title: e.target.value })} placeholder="e.g. Coflin Q3 Detailing Aid" className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Product</label>
                  <select value={upload.product} onChange={e => setUpload({ ...upload, product: e.target.value })} className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm">
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Category</label>
                  <select value={upload.cat} onChange={e => setUpload({ ...upload, cat: e.target.value as MaterialCategory })} className="input-field w-full mt-1.5 px-3 py-2 rounded-lg bg-paper border border-navy-200 text-sm">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Audience</label>
                <div className="mt-1.5 p-3 rounded-xl border border-navy-100">
                  <AudiencePicker value={upload.audience} onChange={a => setUpload({ ...upload, audience: a })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-navy-700 tracking-wider uppercase">Note to approver (optional)</label>
                <textarea rows={2} value={upload.note} onChange={e => setUpload({ ...upload, note: e.target.value })} placeholder="e.g. Claims cleared by Medical Affairs on May 12" className="input-field w-full mt-1.5 p-2 rounded-lg bg-paper border border-navy-200 text-sm resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
                <input type="checkbox" checked={upload.urgent} onChange={e => setUpload({ ...upload, urgent: e.target.checked })} className="w-4 h-4 accent-rose-500" />
                Mark urgent (competitive response)
              </label>
            </div>
            <div className="px-5 py-4 border-t border-navy-100 flex gap-2">
              <button onClick={() => setUpload(null)} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
              <button
                onClick={submitUpload}
                disabled={!upload.file || !upload.title || resolveAudience(upload.audience).length === 0}
                className="flex-1 py-2.5 rounded-lg bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 btn-press disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Icon name="send" size={14} /> Submit for approval
              </button>
            </div>
          </div>
        </div>
      )}

      {pushing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fade-in" style={{ background: 'rgba(10, 24, 48, 0.5)' }} onClick={() => setPushing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">Push Material to Reps</h3>
              <button onClick={() => setPushing(null)} className="w-8 h-8 rounded-lg hover:bg-paper flex items-center justify-center"><Icon name="x" size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-paper border border-navy-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center"><Icon name="file" size={16} className="text-violet-700" /></div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-ink">{pushing.title}</p>
                  <p className="text-[11px] text-navy-500">{pushing.sizeMb} MB · v{pushing.version}</p>
                </div>
              </div>
              <AudiencePicker value={pushAudience} onChange={setPushAudience} />
            </div>
            <div className="px-5 py-4 border-t border-navy-100 flex gap-2">
              <button onClick={() => setPushing(null)} className="flex-1 py-2.5 rounded-lg border border-navy-200 text-sm font-bold text-navy-700 hover:bg-paper btn-press">Cancel</button>
              <button
                onClick={() => {
                  pushMaterial(pushing.id, pushAudience);
                  notify({ type: 'success', title: 'Material pushed to reps', msg: `${pushing.title} · ${resolveAudience(pushAudience).length} reps notified · appears in their Materials library` });
                  setPushing(null);
                }}
                disabled={resolveAudience(pushAudience).length === 0}
                className="flex-1 py-2.5 rounded-lg bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 btn-press disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Icon name="send" size={14} /> Push to {resolveAudience(pushAudience).length}
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && <MaterialViewer material={preview} offline onClose={() => setPreview(null)} footer={`Preview · ${preview.status === 'approved' ? 'live in rep libraries' : 'not visible to reps until approved'}`} />}
      {node}
    </div>
  );
}
