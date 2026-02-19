import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Users, FileText, Send, PieChart } from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { href: '/', label: 'Dashboard', icon: Home, roles: ['admin', 'operador', 'vendedor'] },
        { href: '/sessions', label: 'Sessões', icon: Users, roles: ['admin', 'operador'] },
        { href: '/vendedores', label: 'Vendedores', icon: Users, roles: ['admin', 'operador'] },
        { href: '/reports', label: 'Relatórios', icon: FileText, roles: ['admin'] },
        { href: '/meu-relatorio', label: 'Meu Relatório', icon: PieChart, roles: ['vendedor'] },
        { href: '/messages', label: 'Mensagens', icon: Send, roles: ['admin', 'vendedor'] },
        { href: '/users', label: 'Usuários', icon: Users, roles: ['admin'] },
    ];

    return (
        <div className="h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] text-[var(--muted)] flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
            <div className="p-6 border-b border-[var(--border)]">
                <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                    Meta<span className="gold-gradient animate-glow-breathe">Vendedores</span>
                </h2>
                <div className="mt-2 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></div>
                    <p className="text-xs text-[var(--muted)] font-medium">
                        {user.name} <span className="opacity-50">({user.role})</span>
                    </p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item, idx) => {
                    if (!item.roles.includes(user.role)) return null;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${active
                                ? 'bg-[var(--surface-highlight)] text-[var(--primary)] font-medium border-l-2 border-[var(--primary)] pl-[10px] shadow-[inset_3px_0_8px_rgba(212,175,55,0.15)]'
                                : 'hover:bg-[var(--surface-highlight)] hover:text-[var(--foreground)] hover:translate-x-1'
                                }`}
                            style={{ animation: `slide-in-left 300ms ease-out ${idx * 50}ms both` }}
                        >
                            <item.icon size={18} className={`transition-all duration-200 ${active ? 'text-[var(--primary)]' : 'text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:scale-110'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium">Sair da Conta</span>
                </button>
            </div>
        </div>
    );
};
