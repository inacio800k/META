'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';
import { Send, MessageSquare, Eye, Tag, Hash, FileText, ChevronDown, Check, Search, Building2, Braces, Calendar } from 'lucide-react';
import { ClientSelectionModal } from '@/components/ClientSelectionModal';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function MessagesPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false);
    const [demanda, setDemanda] = useState('');
    const [numeroCliente, setNumeroCliente] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [tipoCliente, setTipoCliente] = useState('');
    const [searchingClients, setSearchingClients] = useState(false);
    const [clientResults, setClientResults] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    // Date state (default to yesterday)
    const [selectedDate, setSelectedDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    });

    const templateDropdownRef = useRef<HTMLDivElement>(null);
    const tagsDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target as Node)) {
                setIsTemplateMenuOpen(false);
            }
            if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(e.target as Node)) {
                setIsTagsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!authLoading && !hasRole(['admin', 'vendedor'])) {
            router.push('/');
        }
    }, [authLoading, hasRole, router]);

    useEffect(() => {
        if (hasRole(['admin', 'vendedor']) && user) {
            setLoading(true);
            dataService.initMessages(user)
                .then(data => {
                    let sessionList = [];
                    let tagList: any[] = [];

                    if (Array.isArray(data)) {
                        const sessoesObj = data.find((item: any) => item && item.sessoes);
                        if (sessoesObj) {
                            sessionList = sessoesObj.sessoes;
                        } else {
                            const hasSessionData = data.some(item => item && (item.id || item.sessao));
                            if (hasSessionData) {
                                sessionList = data;
                            }
                        }
                        const tagsObj = data.find((item: any) => item && item.tags);
                        if (tagsObj && Array.isArray(tagsObj.tags)) {
                            tagList = tagsObj.tags;
                        }
                    } else if (data) {
                        if (data.sessoes) sessionList = data.sessoes;
                        if (data.tags && Array.isArray(data.tags)) tagList = data.tags;
                    }

                    if (Array.isArray(sessionList)) {
                        setSessions(sessionList);
                    } else {
                        console.warn('Unexpected session data format:', data);
                        setSessions([]);
                    }
                    if (Array.isArray(tagList)) {
                        setTags(tagList);
                    }
                })
                .catch(err => console.error('Error initializing messages page:', err))
                .finally(() => setLoading(false));
        }
    }, [hasRole, user]);

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setSelectedSession(newValue);
        setSelectedTemplate(null);
        setTemplates([]);
        setVariableValues({});

        if (newValue && user) {
            dataService.selectSession({ sessao: newValue, user })
                .then(response => {
                    if (Array.isArray(response) && response.length > 0 && response[0]?.templates && Array.isArray(response[0].templates)) {
                        setTemplates(response[0].templates);
                    } else if (response && Array.isArray(response.templates)) {
                        setTemplates(response.templates);
                    } else if (Array.isArray(response)) {
                        setTemplates(response);
                    } else {
                        console.warn('Unexpected template response format', response);
                        setTemplates([]);
                    }
                })
                .catch(err => console.error('Error selecting session:', err));
        }
    };

    const handleVariableChange = (variable: string, value: string) => {
        setVariableValues(prev => ({
            ...prev,
            [variable]: value
        }));
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession || !selectedTemplate) return;

        setLoading(true);
        try {
            let finalMessage = selectedTemplate.texto;
            if (selectedTemplate.variaveis && Array.isArray(selectedTemplate.variaveis)) {
                selectedTemplate.variaveis.forEach((variable: string) => {
                    const value = variableValues[variable] || '';
                    finalMessage = finalMessage.replace(new RegExp(`{{${variable}}}`, 'g'), value);
                });
            }

            const sessionData = sessions.find(s => (s.sessao || s.id) === selectedSession);

            const variablesArray = Object.entries(variableValues).map(([key, value]) => ({
                [key]: value
            }));

            let mensagem_completa = finalMessage;
            if (selectedTemplate.botoes && Array.isArray(selectedTemplate.botoes) && selectedTemplate.botoes.length > 0) {
                mensagem_completa += '\n\n' + selectedTemplate.botoes.join('\n');
            }

            const payload = {
                sessao: {
                    sessao: sessionData?.sessao,
                    id: sessionData?.id,
                    numero: sessionData?.numero,
                    id_numero: sessionData?.id_numero,
                    token_permanente: sessionData?.token_permanente,
                    inbox_id: sessionData?.inbox_id,
                    tipo_atendimento: sessionData?.tipo_atendimento,
                    origem_atendimento: sessionData?.origem_atendimento,
                    nome_atendente: sessionData?.nome_atendente,
                },
                mensagem_completa,
                nome_template: selectedTemplate.nome,
                lingua_template: selectedTemplate.linguagem || selectedTemplate.language || selectedTemplate.idioma || 'pt_BR',
                variaveis: variablesArray,
                tags: selectedTags,
                demanda,
                numero_cliente: numeroCliente,
                dados_cliente: selectedClient,
                usuario: user
            };

            await dataService.sendMessage(payload);
            showToast('Mensagem enviada com sucesso!', 'success');
        } catch (error: any) {
            const msg = error?.message || 'Erro ao enviar mensagem';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[var(--background)] items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="skeleton h-4 w-48"></div>
                    <div className="skeleton h-3 w-32"></div>
                </div>
            </div>
        );
    }

    if (!hasRole(['admin', 'vendedor'])) return null;

    const goldGradientStyle = { background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent', backgroundClip: 'text' as const };
    const silverGradientStyle = { background: 'linear-gradient(135deg, #7C7E83 0%, #C8CACF 25%, #8A8D93 50%, #D8DAE0 75%, #6E7074 100%)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent', backgroundClip: 'text' as const };
    const silverText = '#A8ABB2';
    const silverTextLight = '#BEC1C8';

    return (
        <div className="flex bg-[var(--background)] h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto p-8 pb-12">
                {/* Header */}
                <header className="mb-5">
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                            <Send size={20} style={{ color: '#D4AF37' }} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight" style={goldGradientStyle}>Enviar Mensagem</h1>
                    </div>
                    <p className="text-[var(--muted)] mt-1 ml-10 text-sm">Selecione uma sessão, template e configure o envio.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-[1400px]">
                    {/* Left Column - Form (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        <form onSubmit={handleSendMessage} className="space-y-6">
                            {/* Step 1: Configuração (Sessão + Template) */}
                            <div className="premium-card rounded-xl p-4 relative z-50" style={{ borderTop: '2px solid rgba(212,175,55,0.4)' }}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #BF953F, #D4AF37)', color: '#1A1200' }}>1</div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider" style={silverGradientStyle}>Configuração</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                            Sessão
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full rounded-lg bg-[var(--background)] p-2.5 pr-10 border border-[var(--border)] transition-all text-sm focus:outline-none appearance-none cursor-pointer"
                                                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                value={selectedSession}
                                                onChange={handleSessionChange}
                                            >
                                                <option value="">Selecione uma sessão...</option>
                                                {sessions.map((session, index) => (
                                                    <option key={session.id || index} value={session.sessao || session.id}>
                                                        {session.sessao || `Sessão ${session.id}` || 'Sessão sem nome'}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                                        </div>
                                    </div>

                                    {selectedSession && (
                                        <div className="animate-fade-in">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                                                    Template
                                                </label>
                                                <span className="text-[10px] text-[var(--muted)]">{templates.length} disponíveis</span>
                                            </div>
                                            <div className="relative" ref={templateDropdownRef}>
                                                <div
                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 cursor-pointer flex justify-between items-center hover:border-[var(--primary)] transition-all"
                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                    onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                                                >
                                                    <span style={{ color: selectedTemplate ? silverTextLight : 'var(--muted)', fontSize: '0.875rem' }}>
                                                        {selectedTemplate ? selectedTemplate.nome : 'Selecione um template...'}
                                                    </span>
                                                    <ChevronDown size={14} className={`text-[var(--muted)] transition-transform ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
                                                </div>

                                                {isTemplateMenuOpen && (
                                                    <div className="absolute z-50 w-full mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl max-h-96 overflow-y-auto custom-scrollbar" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1)' }}>
                                                        {templates.length === 0 ? (
                                                            <div className="p-6 text-center text-[var(--muted)] text-sm">Nenhum template disponível</div>
                                                        ) : (
                                                            templates.map((template, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`p-4 border-b border-[var(--border)] last:border-0 cursor-pointer transition-all hover:bg-[var(--surface-highlight)] ${selectedTemplate?.nome === template.nome ? 'bg-[var(--surface-highlight)]' : ''}`}
                                                                    style={selectedTemplate?.nome === template.nome ? { borderLeft: '3px solid #D4AF37' } : { borderLeft: '3px solid transparent' }}
                                                                    onClick={() => {
                                                                        setSelectedTemplate(template);
                                                                        setVariableValues({});
                                                                        setIsTemplateMenuOpen(false);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1.5">
                                                                        <span className="font-bold text-sm" style={{ color: silverTextLight }}>{template.nome}</span>
                                                                        {selectedTemplate?.nome === template.nome && <Check size={14} style={{ color: '#D4AF37' }} />}
                                                                    </div>
                                                                    <div className="text-xs text-[var(--muted)] whitespace-pre-wrap leading-relaxed">{template.texto}</div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Cliente */}
                            {selectedSession && selectedTemplate && (
                                <div className="premium-card rounded-t-xl p-4 relative z-40 animate-fade-in !mb-0 border-b-0" style={{ borderTop: '2px solid rgba(212,175,55,0.4)', paddingBottom: '10px' }}>
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #BF953F, #D4AF37)', color: '#1A1200' }}>2</div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider" style={silverGradientStyle}>Cliente</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                                    <Calendar size={10} className="mr-1" /> Data
                                                </label>
                                                <input
                                                    type="date"
                                                    max={todayStr}
                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm placeholder-[var(--muted)] transition-all focus:outline-none cursor-pointer"
                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight, colorScheme: 'dark', accentColor: '#D4AF37' }}
                                                    value={selectedDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    onClick={(e) => {
                                                        if ('showPicker' in HTMLInputElement.prototype) {
                                                            (e.target as HTMLInputElement).showPicker();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                                    <Building2 size={10} className="mr-1" /> Empresa
                                                </label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm placeholder-[var(--muted)] transition-all focus:outline-none"
                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                    value={empresa}
                                                    onChange={(e) => setEmpresa(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="Código..."
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                                    <Tag size={10} className="mr-1" /> Tipo
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full rounded-lg bg-[var(--background)] p-2.5 pr-8 border border-[var(--border)] transition-all text-sm focus:outline-none appearance-none cursor-pointer"
                                                        style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                        value={tipoCliente}
                                                        onChange={(e) => setTipoCliente(e.target.value)}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="Abandono">Abandono</option>
                                                        <option value="pago">Pós</option>
                                                        <option value="recusado">Cancelado</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={searchingClients || !empresa || !tipoCliente}
                                            onClick={async () => {
                                                setSearchingClients(true);
                                                try {
                                                    const sessionData = sessions.find(s => (s.sessao || s.id) === selectedSession);
                                                    const res = await fetch('/api/messages/search-clients', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            sessao: sessionData,
                                                            empresa,
                                                            tipo: tipoCliente,
                                                            data: selectedDate,
                                                            template: selectedTemplate,
                                                        }),
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) {
                                                        showToast(data.error || 'Erro ao buscar cliente', 'error');
                                                        setSelectedClient(null);
                                                    } else {
                                                        // Extract dados_cliente from the response
                                                        const firstItem = Array.isArray(data) ? data[0] : data;
                                                        const clientResult = firstItem?.dados_cliente || firstItem;

                                                        if (clientResult) {
                                                            setSelectedClient(clientResult);
                                                            showToast('Cliente encontrado com sucesso!', 'success');

                                                            // Pre-fill fields from response
                                                            if (firstItem.tags && Array.isArray(firstItem.tags)) {
                                                                // Filter tags to only include those that exist in the available tags list
                                                                // Or just set them if we want to allow new tags (assuming tags state is all available tags)
                                                                setSelectedTags(firstItem.tags);
                                                            }

                                                            // Extract and sanitize numero_cliente
                                                            const numCliente = firstItem.numero_cliente || firstItem.numer_cliente || clientResult?.numero_cliente || clientResult?.numer_cliente || clientResult?.telefone || clientResult?.['TELEFONE'] || '';
                                                            setNumeroCliente(numCliente ? String(numCliente).replace(/\D/g, '').slice(0, 13) : '');

                                                            if (firstItem.variaveis && Array.isArray(firstItem.variaveis)) {
                                                                const newVarValues: Record<string, string> = {};
                                                                firstItem.variaveis.forEach((v: any) => {
                                                                    const key = Object.keys(v)[0];
                                                                    if (key) newVarValues[key] = v[key];
                                                                });
                                                                setVariableValues(prev => ({ ...prev, ...newVarValues }));
                                                            }
                                                        } else {
                                                            setSelectedClient(null);
                                                            setNumeroCliente('');
                                                            showToast('Nenhum cliente encontrado com os dados informados.', 'error');
                                                        }
                                                    }
                                                } catch (error: any) {
                                                    console.error(error);
                                                    showToast(error?.message || 'Erro ao buscar cliente', 'error');
                                                    setSelectedClient(null);
                                                } finally {
                                                    setSearchingClients(false);
                                                }
                                            }}
                                            className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-xs tracking-wide transition-all"
                                            style={{
                                                background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)',
                                                color: '#1A1200',
                                                border: '1px solid rgba(255,236,138,0.3)',
                                                boxShadow: '0 4px 15px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,250,220,0.4)',
                                                textShadow: '0 1px 0 rgba(255,250,220,0.3)',
                                            }}
                                        >
                                            <Search size={14} />
                                            <span>{searchingClients ? 'Buscando...' : 'Buscar Cliente'}</span>
                                        </button>

                                        {/* Selected Client Details */}
                                        {selectedClient && (
                                            <div className="space-y-4 mt-4 animate-fade-in">
                                                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }}>
                                                    <div className="px-3 py-2 border-b border-[var(--border)]" style={{ background: 'rgba(212,175,55,0.06)' }}>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>Detalhes do Cliente</span>
                                                        </div>
                                                    </div>
                                                    <div className="divide-y divide-[var(--border)]">
                                                        <div className="px-3 py-2.5 hover:bg-[var(--surface-highlight)] transition-colors grid grid-cols-[auto_1fr_auto] gap-4 items-center">
                                                            <span className="text-xs font-bold whitespace-nowrap" style={silverGradientStyle}>
                                                                {selectedClient['DATA E HORA'] || selectedClient.data_hora || '-'}
                                                            </span>
                                                            <span className="text-xs font-bold truncate text-center" style={silverGradientStyle}>
                                                                {selectedClient['NOME DO CLIENTE'] || selectedClient.nome || 'Nome Indisponível'}
                                                            </span>
                                                            <span className="text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,171,178,0.1)', color: silverTextLight, border: '1px solid rgba(168,171,178,0.2)' }}>
                                                                {selectedClient['TELEFONE'] || selectedClient.telefone || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}



                            {/* Step 3: Dados Envio (Consolidated) */}
                            {selectedSession && selectedTemplate && (
                                <div className="premium-card rounded-b-xl p-4 relative z-20 animate-fade-in !mt-0" style={{ paddingTop: '10px' }}>

                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #BF953F, #D4AF37)', color: '#1A1200' }}>3</div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider" style={silverGradientStyle}>Dados Envio</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Tags */}
                                            <div className="relative" ref={tagsDropdownRef}>
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                                    <Tag size={10} className="mr-1" /> Tags
                                                </label>
                                                <div
                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 cursor-pointer flex justify-between items-center hover:border-[var(--primary)] transition-all"
                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                    onClick={() => {
                                                        setIsTagsMenuOpen(!isTagsMenuOpen);
                                                        setIsTemplateMenuOpen(false);
                                                    }}
                                                >
                                                    <span style={{ color: selectedTags.length > 0 ? silverTextLight : 'var(--muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {selectedTags.length > 0
                                                            ? `${selectedTags.length} sel.`
                                                            : 'Selecione...'}
                                                    </span>
                                                    <ChevronDown size={14} className={`text-[var(--muted)] transition-transform ${isTagsMenuOpen ? 'rotate-180' : ''}`} />
                                                </div>

                                                {isTagsMenuOpen && (
                                                    <div className="absolute z-50 w-[200px] mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl max-h-60 overflow-y-auto custom-scrollbar" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.1)' }}>
                                                        {tags.length === 0 ? (
                                                            <div className="p-4 text-center text-sm text-[var(--muted)]">Nenhuma tag disponível</div>
                                                        ) : (
                                                            tags.map((tag, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center p-3 hover:bg-[var(--surface-highlight)] cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors"
                                                                    onClick={() => handleTagToggle(tag)}
                                                                >
                                                                    <div
                                                                        className="w-4 h-4 mr-3 rounded flex items-center justify-center transition-all"
                                                                        style={selectedTags.includes(tag) ? { background: 'linear-gradient(135deg, #BF953F, #D4AF37)', border: '1px solid #D4AF37' } : { border: '1px solid var(--muted)' }}
                                                                    >
                                                                        {selectedTags.includes(tag) && <Check size={10} style={{ color: '#1A1200' }} strokeWidth={3} />}
                                                                    </div>
                                                                    <span className="text-sm" style={{ color: silverTextLight }}>{tag}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Demanda */}
                                            <div>
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                                    <FileText size={10} className="mr-1" /> Demanda
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm placeholder-[var(--muted)] transition-all focus:outline-none"
                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                    value={demanda}
                                                    onChange={(e) => setDemanda(e.target.value)}
                                                    placeholder="Digite..."
                                                />
                                            </div>

                                            {/* Número Cliente */}
                                            <div>
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-1.5 uppercase tracking-wider">
                                                    <Hash size={10} className="mr-1" /> Número
                                                </label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    minLength={10}
                                                    maxLength={13}
                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm placeholder-[var(--muted)] transition-all focus:outline-none"
                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                    value={numeroCliente}
                                                    onChange={(e) => setNumeroCliente(e.target.value.replace(/\D/g, '').slice(0, 13))}
                                                    placeholder="10-13 dígitos"
                                                />
                                            </div>
                                        </div>

                                        {/* Variáveis do Template */}
                                        {selectedTemplate.variaveis && Array.isArray(selectedTemplate.variaveis) && selectedTemplate.variaveis.length > 0 && (
                                            <div className="pt-2 border-t border-[var(--border)]">
                                                <label className="flex items-center text-[10px] font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
                                                    <Braces size={10} className="mr-1" /> Variáveis do Template
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedTemplate.variaveis.map((variable: string, index: number) => {
                                                        const isFullWidth = /endere[cç]o/i.test(variable);
                                                        return (
                                                            <div key={index} className={isFullWidth ? "col-span-2" : "col-span-1"}>
                                                                <label className="block text-[10px] font-bold text-[var(--muted)] mb-0.5 uppercase tracking-wider">
                                                                    {variable.replace(/_/g, ' ')}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-xs placeholder-[var(--muted)] transition-all focus:outline-none"
                                                                    style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)', color: silverTextLight }}
                                                                    value={variableValues[variable] || ''}
                                                                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                                    placeholder={`Valor para ${variable}`}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Send Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || !selectedSession || !selectedTemplate}
                                    className="flex items-center space-x-3 px-6 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-sm tracking-wide transition-all"
                                    style={{ background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)', color: '#1A1200', border: '1px solid rgba(255,236,138,0.3)', boxShadow: '0 4px 15px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,250,220,0.4), inset 0 -1px 0 rgba(146,112,12,0.3)', textShadow: '0 1px 0 rgba(255,250,220,0.3)' }}
                                >
                                    <Send size={16} />
                                    <span>{loading ? 'Enviando...' : 'Enviar Mensagem'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Preview (2 cols) */}
                    <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-8 self-start">
                        {/* Preview Card */}
                        <div className="premium-card rounded-xl p-4 relative" style={{ borderTop: '2px solid rgba(212,175,55,0.4)' }}>
                            <div className="flex items-center space-x-3 mb-3">
                                <Eye size={18} style={{ color: '#D4AF37' }} />
                                <h2 className="text-lg font-bold tracking-tight" style={silverGradientStyle}>Pré-visualização</h2>
                            </div>

                            {!selectedTemplate ? (
                                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] space-y-2">
                                    <MessageSquare size={24} className="opacity-30" />
                                    <span className="text-xs">Selecione um template</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Template Meta */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                                            {selectedTemplate.categoria}
                                        </span>
                                        {selectedTemplate.linguagem === 'pt_BR' ? (
                                            <img src="https://flagcdn.com/w40/br.png" alt="Brasil" title="Português (Brasil)" className="w-5 h-auto rounded shadow-sm opacity-80" />
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase" style={{ color: '#D4AF37' }}>{selectedTemplate.linguagem}</span>
                                        )}
                                    </div>

                                    {/* Message bubble */}
                                    <div className="relative">
                                        <div className="p-3 rounded-xl text-sm whitespace-pre-wrap leading-relaxed" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: silverTextLight }}>
                                            {(() => {
                                                let text = selectedTemplate.texto;
                                                if (selectedTemplate.variaveis && Array.isArray(selectedTemplate.variaveis)) {
                                                    selectedTemplate.variaveis.forEach((variable: string) => {
                                                        const value = variableValues[variable];
                                                        if (value) {
                                                            text = text.replace(new RegExp(`{{${variable}}}`, 'g'), value);
                                                        }
                                                    });
                                                }
                                                return text;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Template Buttons */}
                                    {selectedTemplate.botoes && Array.isArray(selectedTemplate.botoes) && selectedTemplate.botoes.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedTemplate.botoes.map((botao: string, index: number) => (
                                                <div
                                                    key={index}
                                                    className="w-full text-center py-2 px-3 rounded-lg text-xs font-medium cursor-default transition-all"
                                                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}
                                                >
                                                    {botao}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-[var(--muted)] text-right opacity-60">* Visualização aproximada</p>
                                </div>
                            )}
                        </div>

                        {/* Chatwoot Summary */}
                        {selectedSession && (
                            <div className="premium-card rounded-xl p-4 relative animate-fade-in" style={{ borderTop: '2px solid rgba(212,175,55,0.4)' }}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <MessageSquare size={16} style={{ color: '#D4AF37' }} />
                                    <h2 className="text-sm font-bold tracking-tight" style={silverGradientStyle}>Resumo do Envio</h2>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">Tags</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedTags.length > 0 ? selectedTags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}>
                                                    {tag}
                                                </span>
                                            )) : <span className="text-[10px] text-[var(--muted)] italic opacity-50">Nenhuma</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Demanda</span>
                                            <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] text-xs min-h-[36px] flex items-center" style={{ color: silverTextLight }}>
                                                {demanda || <span className="opacity-25 italic text-[10px]">—</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Nº Cliente</span>
                                            <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] text-xs min-h-[36px] flex items-center" style={{ color: silverTextLight }}>
                                                {numeroCliente || <span className="opacity-25 italic text-[10px]">—</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ClientSelectionModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                clients={clientResults}
                onSelect={(client) => setSelectedClient(client)}
            />
        </div>
    );
}
