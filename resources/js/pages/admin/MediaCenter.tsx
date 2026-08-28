import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import Modal from '@/components/ui/Modal';
import { Plus, FileText, FileVideo, Image as ImageIcon, FolderOpen, Upload, Download, Trash2, HardDrive, X } from 'lucide-react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    mediaFiles: any[];
    folders: string[];
    storage?: { used: number; entries: number };
}

const typeConfig: Record<string, { icon: any; color: string }> = {
    image: { icon: ImageIcon, color: 'text-blue-600 bg-blue-50' },
    pdf: { icon: FileText, color: 'text-red-600 bg-red-50' },
    video: { icon: FileVideo, color: 'text-purple-600 bg-purple-50' },
    document: { icon: FileText, color: 'text-gold-600 bg-gold-50' },
};

export default function MediaCenter(props: Props) {
    const { mediaFiles, folders, storage } = props;
    const [activeFolder, setActiveFolder] = useState('All');
    const [showUpload, setShowUpload] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        folder: 'Properties',
        property_name: '',
        size: '',
        file: null as File | null,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    const filtered = activeFolder === 'All' ? mediaFiles : mediaFiles.filter((f) => f.folder === activeFolder);

    const handleFile = (file: File | undefined) => {
        if (!file) return;
        setSelectedFile(file);
        setData('file', file as never);
        setData('name', file.name.replace(/\.[^.]+$/, ''));
        setData('size', file.type.startsWith('image/') ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
        if (file.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview('');
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreview('');
        setData('file', null as never);
        setData('name', '');
        setData('size', '');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/media', {
            forceFormData: true,
            onSuccess: () => {
                setShowUpload(false);
                clearFile();
            },
        });
    };

    const destroy = (id: number) => {
        if (confirm('Delete this file?')) {
            router.delete(`/admin/media/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Media Center"
                subtitle="Manage all your property documents and media"
                breadcrumbs={[{ label: 'Operations' }, { label: 'Media Center' }]}
                actions={
                    <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold hover:bg-[#1A2B50] transition-colors">
                        <Upload size={15} /> Upload File
                    </button>
                }
            />

            {storage && (
                <div className="flex flex-wrap items-center gap-4 mb-6 bg-white rounded-xl border border-[#E1E8F0] px-5 py-3.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HardDrive size={16} className="text-gold-600" />
                        <span className="font-semibold text-[#0D1B3E]">{storage.used} MB</span> storage used
                    </div>
                    <span className="text-gray-300">·</span>
                    <div className="text-sm text-gray-600"><span className="font-semibold text-[#0D1B3E]">{storage.entries}</span> files total</div>
                </div>
            )}

            {/* Folder tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['All', ...folders].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFolder(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${activeFolder === f ? 'bg-[#0D1B3E] text-white' : 'bg-white border border-[#E1E8F0] text-gray-600 hover:bg-[#F7F9FC]'}`}
                    >
                        <FolderOpen size={14} /> {f}
                        <span className="text-xs opacity-70">({(f === 'All' ? mediaFiles : mediaFiles.filter((m) => m.folder === f)).length})</span>
                    </button>
                ))}
            </div>

            {/* Files grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((f) => {
                    const cfg = typeConfig[f.type] || typeConfig.document;
                    const Icon = cfg.icon;
                    return (
                        <div key={f.id} className="bg-white rounded-xl border border-[#E1E8F0] overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-32 bg-[#F7F9FC] relative">
                                {f.type === 'image' && f.url ? (
                                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className={`w-12 h-12 rounded-xl ${cfg.color} opacity-70 flex items-center justify-center`}>
                                            <Icon size={24} />
                                        </div>
                                    </div>
                                )}
                                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur text-gray-600 uppercase">
                                    {f.type}
                                </span>
                            </div>
                            <div className="p-3.5">
                                <div className="font-medium text-[#0D1B3E] text-sm truncate" title={f.name}>{f.name}</div>
                                <div className="text-gray-400 text-xs mt-1">{f.size} · {f.uploaded_by}</div>
                                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F0F4F8]">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D1B3E]/5 text-[#0D1B3E] font-medium">{f.folder}</span>
                                    <div className="flex items-center gap-1">
                                        {f.url && (
                                            <a href={f.url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-[#0D1B3E] hover:bg-[#F7F9FC] rounded-lg" title="Open">
                                                <Download size={14} />
                                            </a>
                                        )}
                                        <button onClick={() => destroy(f.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-[#F7F9FC] rounded-lg" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-[#E1E8F0]">
                    <FolderOpen size={44} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="font-semibold text-[#0D1B3E]">No files in this folder</h3>
                    <p className="text-gray-400 text-sm mt-1">Upload files to get started.</p>
                </div>
            )}

            {/* Upload Modal */}
            <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload File">
                <form onSubmit={submit} className="space-y-3.5">
                    <label className="block">
                        <input type="file" accept="image/*,application/pdf,video/*,audio/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                        {selectedFile ? (
                            <div className="border-2 border-[#C9963A] bg-gold-50/40 rounded-xl p-4 flex items-center gap-4">
                                {preview ? (
                                    <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-white border border-[#E1E8F0] flex items-center justify-center text-gray-400">
                                        <FileText size={26} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-[#0D1B3E] truncate">{selectedFile.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB · click to change</div>
                                </div>
                                <button type="button" onClick={(e) => { e.preventDefault(); clearFile(); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg" title="Remove">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-[#E1E8F0] rounded-xl p-7 text-center cursor-pointer hover:bg-[#F7F9FC] hover:border-gold-400/50 transition-colors">
                                <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                                <div className="text-sm font-medium text-[#0D1B3E]">Click to upload or drag & drop</div>
                                <div className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, MP4 up to 500MB</div>
                            </div>
                        )}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">File Name</label>
                            <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Folder</label>
                            <select value={data.folder} onChange={(e) => setData('folder', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none">
                                {folders.map((f) => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Property (optional)</label>
                            <input value={data.property_name} onChange={(e) => setData('property_name', e.target.value)} className="w-full px-3.5 py-2 border border-[#E1E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 border border-[#E1E8F0] rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 bg-[#0D1B3E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                            {processing ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
