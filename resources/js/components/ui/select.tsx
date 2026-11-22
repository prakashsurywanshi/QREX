import * as React from 'react';
import { cn } from '@/lib/utils';

type Ctx = {
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  registerOption: (v: string, label: string) => void;
  options: Record<string, string>;
};

const SelectCtx = React.createContext<Ctx | null>(null);

interface SelectProps {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [options, setOptions] = React.useState<Record<string, string>>({});
  const registerOption = React.useCallback((v: string, label: string) => {
    setOptions((prev) => (prev[v] === label ? prev : { ...prev, [v]: label }));
  }, []);
  return <SelectCtx.Provider value={{ value, onValueChange, disabled, registerOption, options }}>{children}</SelectCtx.Provider>;
}

export function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectCtx);
  if (!ctx) return null;
  const hasValueChild = React.Children.toArray(children).some((c) => React.isValidElement(c) && c.type === SelectValue);
  const display = ctx.value ? (ctx.options[ctx.value] ?? ctx.value) : '';
  return (
    <div className={cn('relative', className)}>
      <select
        className="flex h-9 w-full appearance-none rounded-md border border-[#E1E8F0] bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
        value={ctx.value ?? ''}
        onChange={(e) => ctx.onValueChange?.(e.target.value)}
        disabled={ctx.disabled}
      >
        {!ctx.value && <option value="" disabled hidden>{(React.Children.toArray(children).find((c) => React.isValidElement(c) && c.type === SelectValue) as any)?.props?.placeholder || 'Select'}</option>}
        {Object.entries(ctx.options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {!hasValueChild && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{display}</span>}
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <>{placeholder ?? ''}</>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(SelectCtx);
  const label = typeof children === 'string' || typeof children === 'number' ? String(children) : String(value);
  React.useEffect(() => {
    ctx?.registerOption(value, label);
  }, [ctx, value, label]);
  return null;
}
