'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';
import { Send } from 'lucide-react';

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
                        // Find sessions object
                        const sessoesObj = data.find((item: any) => item && item.sessoes);
                        if (sessoesObj) {
                            sessionList = sessoesObj.sessoes;
                        } else {
                            const hasSessionData = data.some(item => item && (item.id || item.sessao));
                            if (hasSessionData) {
                                sessionList = data;
                            }
                        }

                        // Find tags object
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
                    // Expecting response to contain templates array
                    // Check for various possible response structures

                    // Case: [{ templates: [...] }] - n8n often returns an array of items
                    if (Array.isArray(response) && response.length > 0 && response[0]?.templates && Array.isArray(response[0].templates)) {
                        setTemplates(response[0].templates);
                    }
                    // Case: { templates: [...] }
                    else if (response && Array.isArray(response.templates)) {
                        setTemplates(response.templates);
                    }
                    // Case: [...] (direct array of templates)
                    else if (Array.isArray(response)) {
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
            // Interpolate variables
            if (selectedTemplate.variaveis && Array.isArray(selectedTemplate.variaveis)) {
                selectedTemplate.variaveis.forEach((variable: string) => {
                    const value = variableValues[variable] || '';
                    // Replace {{variable}} with value
                    finalMessage = finalMessage.replace(new RegExp(`{{${variable}}}`, 'g'), value);
                });
            }

            // Find full session object
            const sessionData = sessions.find(s => (s.sessao || s.id) === selectedSession);

            // Construct variables array
            const variablesArray = Object.entries(variableValues).map(([key, value]) => ({
                [key]: value
            }));

            // Construct mensagem_completa with buttons
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
                usuario: user
            };

            await dataService.sendMessage(payload);
            showToast('Mensagem enviada com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao enviar mensagem', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex h-screen bg-[#121212] text-[#FFE600] items-center justify-center">
                <div className="text-xl">Carregando...</div>
            </div>
        );
    }

    if (!hasRole(['admin', 'vendedor'])) return null;

    return (
        <div className="flex h-screen bg-[#121212] text-[#FFE600] overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto p-8 pb-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold neon-text">Enviar Mensagem</h1>
                    <p className="text-[#FFE600] opacity-80">Selecione uma sessão e um template para enviar.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl">
                    <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] p-6 max-w-2xl min-h-[400px]">
                        <form onSubmit={handleSendMessage} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#FFE600] mb-2">
                                    Selecione a Sessão
                                </label>
                                <select
                                    required
                                    className="w-full rounded-md border-[#333] bg-[#121212] text-[#FFE600] shadow-sm focus:border-[#FFE600] focus:ring-[#FFE600] sm:text-sm p-3 border"
                                    value={selectedSession}
                                    onChange={handleSessionChange}
                                >
                                    <option value="">Selecione...</option>
                                    {sessions.map((session, index) => (
                                        <option key={session.id || index} value={session.sessao || session.id}>
                                            {session.sessao || `Sessão ${session.id}` || 'Sessão sem nome'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Template Select */}
                            {selectedSession && (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-[#FFE600] mb-2">
                                        Selecione o Template
                                    </label>

                                    {/* Selected Value Display (Closed State) */}
                                    <div
                                        className="w-full rounded-md border border-[#333] bg-[#121212] text-[#FFE600] p-3 cursor-pointer flex justify-between items-center"
                                        onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                                    >
                                        <span>{selectedTemplate ? selectedTemplate.nome : 'Selecione um template...'}</span>
                                        <span className="text-xs opacity-50">▼</span>
                                    </div>

                                    {/* Dropdown Menu (Open State) */}
                                    {isTemplateMenuOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-[#1E1E1E] border border-[#333] rounded-md shadow-xl max-h-96 overflow-y-auto">
                                            {templates.length === 0 ? (
                                                <div className="p-4 text-center opacity-50">Nenhum template disponível</div>
                                            ) : (
                                                templates.map((template, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 border-b border-[#333] hover:bg-yellow-900/20 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            setSelectedTemplate(template);
                                                            setVariableValues({});
                                                            setIsTemplateMenuOpen(false);
                                                        }}
                                                    >
                                                        <div className="font-bold text-[#FFE600] mb-1">
                                                            {template.nome}
                                                        </div>
                                                        <div className="text-sm opacity-80 whitespace-pre-wrap leading-relaxed">
                                                            {template.texto}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Variable Inputs */}
                            {selectedTemplate && selectedTemplate.variaveis && Array.isArray(selectedTemplate.variaveis) && selectedTemplate.variaveis.length > 0 && (
                                <div className="space-y-4 p-4 border border-[#333] rounded-md bg-yellow-900/10">
                                    <h3 className="text-sm font-bold text-[#FFE600] opacity-90">Preencha as variáveis:</h3>
                                    {selectedTemplate.variaveis.map((variable: string, index: number) => (
                                        <div key={index}>
                                            <label className="block text-xs font-medium text-[#FFE600] mb-1 opacity-80 capitalize">
                                                {variable.replace(/_/g, ' ')}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-md border-[#333] bg-[#121212] text-[#FFE600] shadow-sm focus:border-[#FFE600] focus:ring-[#FFE600] sm:text-sm p-2 border placeholder-yellow-900/50"
                                                value={variableValues[variable] || ''}
                                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                placeholder={`Valor para ${variable}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tags, Demanda, and Client Number */}
                            {selectedSession && (
                                <div className="space-y-6 pt-4 border-t border-[#333]">
                                    {/* Tags Select */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-[#FFE600] mb-2">
                                            Selecione as Tags
                                        </label>
                                        <div
                                            className="w-full rounded-md border border-[#333] bg-[#121212] text-[#FFE600] p-3 cursor-pointer flex justify-between items-center"
                                            onClick={() => {
                                                setIsTagsMenuOpen(!isTagsMenuOpen);
                                                setIsTemplateMenuOpen(false);
                                            }}
                                        >
                                            <span className="truncate">
                                                {selectedTags.length > 0
                                                    ? `${selectedTags.length} tags selecionadas`
                                                    : 'Selecione as tags...'}
                                            </span>
                                            <span className="text-xs opacity-50">▼</span>
                                        </div>

                                        {isTagsMenuOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-[#1E1E1E] border border-[#333] rounded-md shadow-xl max-h-60 overflow-y-auto">
                                                {tags.length === 0 ? (
                                                    <div className="p-4 text-center opacity-50 text-sm text-[#FFE600]">Nenhuma tag disponível</div>
                                                ) : (
                                                    tags.map((tag, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center p-3 hover:bg-yellow-900/20 cursor-pointer border-b border-[#333] last:border-0"
                                                            onClick={() => handleTagToggle(tag)}
                                                        >
                                                            <div className={`w-4 h-4 mr-3 rounded border border-[#FFE600] flex items-center justify-center ${selectedTags.includes(tag) ? 'bg-[#FFE600]' : ''}`}>
                                                                {selectedTags.includes(tag) && <span className="text-black text-[10px] font-bold">✓</span>}
                                                            </div>
                                                            <span className="text-sm text-[#FFE600]">{tag}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Demanda Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#FFE600] mb-2">
                                            Demanda
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-md border-[#333] bg-[#121212] text-[#FFE600] shadow-sm focus:border-[#FFE600] focus:ring-[#FFE600] sm:text-sm p-3 border placeholder-yellow-900/50"
                                            value={demanda}
                                            onChange={(e) => setDemanda(e.target.value)}
                                            placeholder="Digite a demanda..."
                                        />
                                    </div>

                                    {/* Numero Cliente Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#FFE600] mb-2">
                                            Número Cliente
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-md border-[#333] bg-[#121212] text-[#FFE600] shadow-sm focus:border-[#FFE600] focus:ring-[#FFE600] sm:text-sm p-3 border placeholder-yellow-900/50"
                                            value={numeroCliente}
                                            onChange={(e) => setNumeroCliente(e.target.value)}
                                            placeholder="Digite o número do cliente..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !selectedSession || !selectedTemplate}
                                    className="flex items-center space-x-2 bg-yellow-600/20 border border-[#FFE600] text-[#FFE600] px-6 py-3 rounded-md hover:bg-yellow-600/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                    <span>{loading ? 'Enviando...' : 'Enviar Mensagem'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Preview & Chatwoot Data */}
                    <div className="space-y-8 h-fit sticky top-8">
                        {/* Preview Card */}
                        <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] p-6">
                            <h2 className="text-xl font-bold neon-text mb-4">Pré-visualização</h2>

                            {!selectedTemplate ? (
                                <div className="flex items-center justify-center h-48 border-2 border-dashed border-[#333] rounded-lg text-[#FFE600] opacity-50">
                                    Selecione um template para visualizar
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Template Metadata Header */}
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        {selectedTemplate.categoria && (
                                            <div className="text-xs font-bold text-[#FFE600] bg-yellow-900/30 px-2 py-1 rounded border border-yellow-600/30 uppercase tracking-wider">
                                                {selectedTemplate.categoria}
                                            </div>
                                        )}
                                        <div className="text-sm font-medium ml-auto">
                                            {selectedTemplate.linguagem === 'pt_BR' ? (
                                                <img
                                                    src="https://flagcdn.com/w40/br.png"
                                                    alt="Brasil"
                                                    title="Português (Brasil)"
                                                    className="w-8 h-auto rounded shadow-sm"
                                                />
                                            ) : (
                                                <span className="text-red-500 font-bold uppercase">{selectedTemplate.linguagem}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#121212] rounded-lg border border-[#333] min-h-[200px] whitespace-pre-wrap leading-relaxed text-[#FFE600]">
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

                                    {/* Template Buttons */}
                                    {selectedTemplate.botoes && Array.isArray(selectedTemplate.botoes) && selectedTemplate.botoes.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {selectedTemplate.botoes.map((botao: string, index: number) => (
                                                <div
                                                    key={index}
                                                    className="w-full bg-[#121212] border border-[#FFE600] text-[#FFE600] text-center py-2.5 px-4 rounded shadow-sm font-medium hover:bg-yellow-900/20 transition-colors cursor-default opacity-80"
                                                >
                                                    {botao}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="text-xs text-[#FFE600] opacity-50 text-right">
                                        * Visualização aproximada de como a mensagem será enviada.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chatwoot Data Card */}
                        <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] p-6">
                            <h2 className="text-xl font-bold neon-text mb-6">Chatwoot</h2>
                            <div className="space-y-6">
                                <div>
                                    <span className="block text-xs font-bold text-[#FFE600] uppercase tracking-wider mb-2 opacity-80">
                                        Tags Selecionadas
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTags.length > 0 ? selectedTags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-yellow-900/40 border border-yellow-600/50 rounded-full text-xs text-[#FFE600] font-medium">
                                                {tag}
                                            </span>
                                        )) : <span className="text-sm opacity-50 italic">Nenhuma tag selecionada</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-[#FFE600] uppercase tracking-wider mb-2 opacity-80">
                                            Demanda
                                        </span>
                                        <div className="p-3 bg-[#121212] rounded border border-[#333] text-sm text-[#FFE600] min-h-[46px] flex items-center">
                                            {demanda || <span className="opacity-30 italic">Vazio</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-[#FFE600] uppercase tracking-wider mb-2 opacity-80">
                                            Número Cliente
                                        </span>
                                        <div className="p-3 bg-[#121212] rounded border border-[#333] text-sm text-[#FFE600] min-h-[46px] flex items-center">
                                            {numeroCliente || <span className="opacity-30 italic">Vazio</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
