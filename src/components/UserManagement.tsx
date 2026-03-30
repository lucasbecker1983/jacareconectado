import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Trash2, Plus, X } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if(confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        loadUsers();
      } catch (e) { alert('Erro ao remover usuário'); }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setShowModal(false);
      setNewUser({ username: '', password: '' });
      loadUsers();
    } catch (e) { alert('Erro ao criar usuário'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciamento de Usuários</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Usuário</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Criado em</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600">
                    <User size={16} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{u.username}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.username !== 'lucas.becker' && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Adicionar Usuário</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nome de usuário" 
                required
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Senha" 
                required
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Criar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
