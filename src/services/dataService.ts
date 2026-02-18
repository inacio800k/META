import { TableDataA, TableDataB, SessionData } from '@/types';

const MOCK_DATA_A: TableDataA[] = [
    { id: '1', name: 'Item A1', value: 100, status: 'active' },
    { id: '2', name: 'Item A2', value: 200, status: 'inactive' },
    { id: '3', name: 'Item A3', value: 300, status: 'active' },
];

const MOCK_DATA_B: TableDataB[] = [
    { id: '1', description: 'Log B1', date: '2023-10-26' },
    { id: '2', description: 'Log B2', date: '2023-10-27' },
];

export const dataService = {
    getDataA: async (): Promise<TableDataA[]> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return [...MOCK_DATA_A];
    },

    getDataB: async (): Promise<TableDataB[]> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return [...MOCK_DATA_B];
    },

    addValueA: async (item: Omit<TableDataA, 'id'>): Promise<TableDataA> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
        MOCK_DATA_A.push(newItem);
        return newItem;
    },

    sendMessage: async (payload: any): Promise<boolean> => {
        const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send message');
        }
        return true;
    },

    getSessions: async (): Promise<{ sessoes: SessionData[], vendedores: any[] }> => {
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
            });
            if (!response.ok) return { sessoes: [], vendedores: [] };
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                // Find objects containing the keys
                const sessoesObj = data.find((item: any) => item.sessoes);
                const vendedoresObj = data.find((item: any) => item.vendedores);

                const sessoesList = sessoesObj ? sessoesObj.sessoes : [];
                let vendedoresList = vendedoresObj ? vendedoresObj.vendedores : [];

                // Handle nested structure: [{ vendedores: [...] }] inside the found vendedores property
                // If vendedoresList itself contains an object with 'vendedores' property
                if (Array.isArray(vendedoresList) && vendedoresList.length > 0 && vendedoresList[0].vendedores) {
                    vendedoresList = vendedoresList[0].vendedores;
                }

                return {
                    sessoes: sessoesList || [],
                    vendedores: vendedoresList || []
                };
            }
            return { sessoes: [], vendedores: [] };
        } catch (error) {
            console.error('Failed to fetch sessions', error);
            return { sessoes: [], vendedores: [] };
        }
    },

    assignVendor: async (payload: { id_sessao: string, sessao: string, id_vendedor: string, nome_vendedor: string }): Promise<any> => {
        const response = await fetch('/api/sessions/assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to assign vendor');
        return await response.json();
    },

    editSession: async (data: any): Promise<any> => {
        const response = await fetch('/api/sessions/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to edit session');
        return await response.json();
    },

    linkChatwoot: async (): Promise<any> => {
        const response = await fetch('/api/users/link-chatwoot', {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to link chatwoot');
        return await response.json();
    },

    createSession: async (data: any): Promise<any> => {
        const response = await fetch('/api/sessions/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create session');
        return await response.json();
    },

    getReports: async (): Promise<any[]> => {
        const response = await fetch('/api/reports', {
            method: 'POST', // The proxy uses POST
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error('Failed to fetch reports');
        return await response.json();
    },

    initMessages: async (user?: any): Promise<any> => {
        const response = await fetch('/api/messages/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user || {}),
        });
        if (!response.ok) throw new Error('Failed to init messages');
        return await response.json();
    },

    getUsers: async (): Promise<any[]> => {
        const response = await fetch('/api/users', {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    },

    updateUser: async (user: any): Promise<any> => {
        const response = await fetch('/api/users/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to update user');
        }
        return await response.json();
    },

    selectSession: async (payload: any): Promise<any> => {
        const response = await fetch('/api/messages/select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to notify session selection');
        return await response.json();
    },

    getVendedores: async (): Promise<any> => {
        const response = await fetch('/api/vendedores', {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to fetch vendedores');
        return await response.json();
    },

    getMeuRelatorio: async (user: any): Promise<any> => {
        const response = await fetch('/api/meu-relatorio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to fetch meu relatorio');
        return await response.json();
    }
};
