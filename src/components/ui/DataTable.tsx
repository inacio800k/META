import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    title?: string;
    actions?: (item: T) => React.ReactNode;
}

export const DataTable = <T,>({ data, columns, title, actions }: DataTableProps<T>) => {
    return (
        <div className="bg-[var(--surface)] shadow-lg rounded-xl overflow-hidden border border-[var(--border)] premium-card">
            {title && (
                <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-highlight)]">
                    <h3 className="font-semibold text-[var(--foreground)] tracking-tight">{title}</h3>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--surface-highlight)] border-b-2 gold-underline">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                            {actions && <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[var(--surface-highlight)] transition-colors duration-150 group row-shine" style={{ animation: `fade-in 300ms ease-out ${idx * 40}ms both` }}>
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] group-hover:text-white transition-colors">
                                        {col.render ? col.render(item) : (typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode))}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {actions(item)}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-[var(--muted)] text-sm italic">
                                    Nenhum dado encontrado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
