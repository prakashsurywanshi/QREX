import { ReactNode } from "react";

interface DataTableProps {
    columns: Array<{ key: string; label: string }>;
    data: any[];
    renderRow?: (item: any, index: number) => ReactNode;
}

export default function DataTable({ columns, data, renderRow }: DataTableProps) {
    return (
        <div className="rounded-md border">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-muted/50">
                        {columns.map((col) => (
                            <th key={col.key} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        renderRow ? renderRow(item, index) : (
                            <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                {columns.map((col) => (
                                    <td key={col.key} className="p-4 align-middle">{item[col.key]}</td>
                                ))}
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
        </div>
    );
}
