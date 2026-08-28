import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, total, perPage, onPageChange }: PaginationProps) {
    if (lastPage <= 1) return null;

    const pages: number[] = [];
    for (let i = 1; i <= lastPage; i++) {
        if (i === 1 || i === lastPage || Math.abs(i - currentPage) <= 1) {
            pages.push(i);
        }
    }

    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);

    return (
        <div className="flex items-center justify-between px-2 py-3">
            <div className="text-xs text-gray-500">
                Showing <span className="font-medium text-[#0D1B3E]">{start}</span>–<span className="font-medium text-[#0D1B3E]">{end}</span> of <span className="font-medium text-[#0D1B3E]">{total}</span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-1.5 border border-[#E1E8F0] rounded-lg text-gray-500 hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                </button>
                {pages.map((p, i) => {
                    if (i > 0 && p - pages[i - 1] > 1) {
                        return (
                            <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
                        );
                    }
                    return (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${p === currentPage ? 'bg-[#0D1B3E] text-white' : 'text-gray-600 hover:bg-[#F8FAFD]'}`}
                        >
                            {p}
                        </button>
                    );
                })}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    className="p-1.5 border border-[#E1E8F0] rounded-lg text-gray-500 hover:bg-[#F8FAFD] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
