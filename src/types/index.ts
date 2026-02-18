export type Role = 'admin' | 'operador' | 'vendedor';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface TableDataA {
    id: string;
    name: string;
    value: number;
    status: 'active' | 'inactive';
}

export interface TableDataB {
    id: string;
    description: string;
    date: string;
}

export interface SessionData {
    id: string;
    created_at: string;
    sessao: string;
    numero: string;
    nome_atendente: string;
    status: string | null;
    chamados_hoje: string;
    limite_chamada: string;
    tipo_atendimento: string;
    origem_atendimento: string;
    nome_app: string | null;
    vendedor_chatwoot?: string;
}
