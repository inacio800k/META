import { User, Role } from '@/types';

// Mock users database
const MOCK_USERS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
    { id: '2', name: 'Operador User', email: 'operador@test.com', role: 'operador' },
    { id: '3', name: 'Vendedor User', email: 'vendedor@test.com', role: 'vendedor' },
];

export const authService = {
    login: async (email: string, passwordHash: string): Promise<User | null> => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: passwordHash }),
            });

            if (response.ok) {
                const data = await response.json();
                let userObj = data;
                if (Array.isArray(data) && data.length > 0) {
                    userObj = data[0];
                }

                // Assumes n8n returns user data. If not, we might need to adjust this.
                // For now, if we get 200 OK but no specific user fields, we'll create a session object.
                return {
                    id: userObj.id?.toString() || 'n8n-user',
                    name: userObj.name || userObj.nome || email.split('@')[0],
                    email: email,
                    // API now returns 'admin', 'operador', or 'vendedor' directly
                    role: (userObj.role as Role) || 'operador'
                };
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    },

    logout: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
    },

    register: async (name: string, email: string, passwordHash: string, role: Role): Promise<{ success: boolean; message?: string }> => {
        try {
            // Call local API route to avoid CORS issues
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password: passwordHash,
                    role,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error('Registration API failed:', errData);
                return {
                    success: false,
                    message: errData.message || errData.details || 'Erro na comunicação com o servidor.'
                };
            }

            return { success: true };
        } catch (error: any) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Erro inesperado ao tentar registrar.'
            };
        }
    }
};
