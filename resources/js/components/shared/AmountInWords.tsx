import { amountInWords } from '@/lib/utils';

interface AmountInWordsProps {
    value: string | number;
}

export default function AmountInWords({ value }: AmountInWordsProps) {
    const words = amountInWords(value);
    if (!words) return null;
    return <p className="mt-1.5 text-sm font-semibold text-[#0D1B3E]">Amount in words: {words}</p>;
}