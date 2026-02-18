import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Users, FileText, Send } from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    return (
        <div className="h-screen w-64 bg-[#1E1E1E] border-r border-[#333] text-[#FFE600] flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-[#333]">
                <h2 className="text-xl font-bold neon-text">Gestão Vendedores</h2>
                <p className="text-xs text-[#FFE600] opacity-80 mt-1">Olá, {user.name} ({user.role})</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/"
                    className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                        }`}
                >
                    <Home size={20} />
                    <span>Dashboard</span>
                </Link>

                {(user.role === 'admin' || user.role === 'operador') && (
                    <Link
                        href="/sessions"
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/sessions' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Users size={20} />
                        <span>Sessões</span>
                    </Link>
                )}

                {(user.role === 'admin' || user.role === 'operador') && (
                    <Link
                        href="/vendedores"
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/vendedores' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Users size={20} />
                        <span>Vendedores</span>
                    </Link>
                )}

                {user.role === 'admin' && (
                    <Link
                        href="/reports"
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/reports' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                            }`}
                    >
                        <FileText size={20} />
                        <span>Relatórios</span>
                    </Link>
                )}

                {(user.role === 'vendedor') && (
                    <Link
                        href="/meu-relatorio"
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/meu-relatorio' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                            }`}
                    >
                        <FileText size={20} />
                        <span>Meu Relatório</span>
                    </Link>
                )}

                {(user.role === 'admin' || user.role === 'vendedor') && (
                    <Link
                        href="/messages"
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/messages' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Send size={20} />
                        <span>Enviar Mensagem</span>
                    </Link>
                )}

                {user.role === 'admin' && (
                    <Link
                        href="/users"
                        className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${pathname === '/users' ? 'bg-[#121212] text-[#FFE600] border border-[#FFE600]/30' : 'hover:bg-[#121212] text-[#FFE600] opacity-70 hover:opacity-100'
                            }`}
                    >
                        <Users size={20} />
                        <span>Controle Usuários</span>
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 text-red-400 hover:text-red-300 w-full p-2 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};
