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
        <div className="bg-[#1E1E1E] shadow rounded-lg overflow-hidden border border-[#333]">
            {title && <div className="px-4 py-3 border-b border-[#333] bg-[#121212] font-medium text-[#FFE600]">{title}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#333]">
                    <thead className="bg-[#121212]">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-[#FFE600] uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                            {actions && <th className="px-6 py-3 text-right text-xs font-medium text-[#FFE600] uppercase tracking-wider">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-[#1E1E1E] divide-y divide-[#333]">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-[#262626]">
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-[#FFE600]">
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
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 text-center text-[#FFE600] opacity-70 text-sm">
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
