import { useState, useEffect, FormEvent } from 'react';
import { 
  School, 
  MapPin, 
  Bus, 
  MapPinned, 
  Clock, 
  User, 
  Phone, 
  Users, 
  FileSpreadsheet, 
  FileText, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Calendar, 
  MapPinHouse, 
  Info,
  Layers,
  HeartHandshake,
  Download,
  Database,
  LogOut,
  Lock,
  Link,
  Copy
} from 'lucide-react';
import { Delegacao } from './types';
import { DELEGACOES_INICIAIS } from './mockData';
import { exportToExcel, exportToPDF, exportReciboPDF } from './utils/exportUtils';
import { supabase } from './supabaseClient';

export default function App() {
  // --- STATE ---
  const [delegacoes, setDelegacoes] = useState<Delegacao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbMissing, setDbMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Routing & Authentication States
  const isPublicView = window.location.search.includes('view=public') || window.location.search.includes('formOnly=true');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('caminhada_eca_admin_logged') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [publicSuccessData, setPublicSuccessData] = useState<Delegacao | null>(null);

  // --- CONFIG / SETTINGS STATE ---
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [eventTitle, setEventTitle] = useState('Caminhada do ECA');
  const [eventDate, setEventDate] = useState('13 de Julho');
  const [eventTime, setEventTime] = useState('08:00h');
  const [eventLocation, setEventLocation] = useState('Campo Grande');

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings form states
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('admin');
  const [newTitle, setNewTitle] = useState('Caminhada do ECA');
  const [newDate, setNewDate] = useState('13 de Julho');
  const [newTime, setNewTime] = useState('08:00h');
  const [newLocation, setNewLocation] = useState('Campo Grande');
  
  // Form State
  const [nomeEscola, setNomeEscola] = useState('');
  const [endereco, setEndereco] = useState('');
  const [embarque, setEmbarque] = useState('');
  const [destino, setDestino] = useState('Campo Grande');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [horarioRetorno, setHorarioRetorno] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [contato, setContato] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');

  // Control State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Handle Login Action
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (usernameInput.trim() === adminUsername && passwordInput === adminPassword) {
      sessionStorage.setItem('caminhada_eca_admin_logged', 'true');
      setIsAdminLoggedIn(true);
      triggerSuccess('Login efetuado com sucesso!');
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  // Handle Logout Action
  const handleLogout = () => {
    sessionStorage.removeItem('caminhada_eca_admin_logged');
    setIsAdminLoggedIn(false);
    setUsernameInput('');
    setPasswordInput('');
    triggerSuccess('Sessão encerrada com sucesso.');
  };

  // Copy Link for Public Registration
  const copyPublicLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?view=public`;
    navigator.clipboard.writeText(link).then(() => {
      triggerSuccess('Link do formulário de inscrição pública copiado para a área de transferência!');
    }).catch(() => {
      setError('Não foi possível copiar o link automaticamente.');
    });
  };

  // Fetch configurations
  const fetchConfigs = async () => {
    let initialUsername = 'admin';
    let initialPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    let initialTitle = 'Caminhada do ECA';
    let initialDate = '13 de Julho';
    let initialTime = '08:00h';
    let initialLocation = 'Campo Grande';

    try {
      const { data, error } = await supabase.from('configs').select('*');
      if (!error && data) {
        data.forEach(item => {
          if (item.key === 'admin_username') initialUsername = item.value;
          if (item.key === 'admin_password') initialPassword = item.value;
          if (item.key === 'event_title') initialTitle = item.value;
          if (item.key === 'event_date') initialDate = item.value;
          if (item.key === 'event_time') initialTime = item.value;
          if (item.key === 'event_location') initialLocation = item.value;
        });
      } else {
        const localUser = localStorage.getItem('caminhada_eca_admin_username');
        const localPass = localStorage.getItem('caminhada_eca_admin_password');
        const localTitle = localStorage.getItem('caminhada_eca_event_title');
        const localDate = localStorage.getItem('caminhada_eca_event_date');
        const localTime = localStorage.getItem('caminhada_eca_event_time');
        const localLoc = localStorage.getItem('caminhada_eca_event_location');

        if (localUser) initialUsername = localUser;
        if (localPass) initialPassword = localPass;
        if (localTitle) initialTitle = localTitle;
        if (localDate) initialDate = localDate;
        if (localTime) initialTime = localTime;
        if (localLoc) initialLocation = localLoc;
      }
    } catch (err) {
      const localUser = localStorage.getItem('caminhada_eca_admin_username');
      const localPass = localStorage.getItem('caminhada_eca_admin_password');
      const localTitle = localStorage.getItem('caminhada_eca_event_title');
      const localDate = localStorage.getItem('caminhada_eca_event_date');
      const localTime = localStorage.getItem('caminhada_eca_event_time');
      const localLoc = localStorage.getItem('caminhada_eca_event_location');

      if (localUser) initialUsername = localUser;
      if (localPass) initialPassword = localPass;
      if (localTitle) initialTitle = localTitle;
      if (localDate) initialDate = localDate;
      if (localTime) initialTime = localTime;
      if (localLoc) initialLocation = localLoc;
    }

    setAdminUsername(initialUsername);
    setAdminPassword(initialPassword);
    setEventTitle(initialTitle);
    setEventDate(initialDate);
    setEventTime(initialTime);
    setEventLocation(initialLocation);
    setDestino(initialLocation);

    // Form inputs state
    setNewUsername(initialUsername);
    setNewPassword(initialPassword);
    setNewTitle(initialTitle);
    setNewDate(initialDate);
    setNewTime(initialTime);
    setNewLocation(initialLocation);
  };

  // Save settings inside application
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newUsername.trim()) return setError('O nome de usuário não pode ser vazio.');
    if (!newPassword.trim()) return setError('A senha não pode ser vazia.');
    if (!newTitle.trim()) return setError('O título do evento não pode ser vazio.');

    const newConfigs = [
      { key: 'admin_username', value: newUsername },
      { key: 'admin_password', value: newPassword },
      { key: 'event_title', value: newTitle },
      { key: 'event_date', value: newDate },
      { key: 'event_time', value: newTime },
      { key: 'event_location', value: newLocation }
    ];

    try {
      const { error: dbErr } = await supabase.from('configs').upsert(newConfigs);
      if (dbErr) {
        newConfigs.forEach(item => {
          localStorage.setItem(`caminhada_eca_${item.key}`, item.value);
        });
        triggerSuccess('Configurações salvas localmente.');
      } else {
        triggerSuccess('Configurações salvas e sincronizadas com o Supabase!');
      }
    } catch (err) {
      newConfigs.forEach(item => {
        localStorage.setItem(`caminhada_eca_${item.key}`, item.value);
      });
      triggerSuccess('Configurações salvas localmente.');
    }

    setAdminUsername(newUsername);
    setAdminPassword(newPassword);
    setEventTitle(newTitle);
    setEventDate(newDate);
    setEventTime(newTime);
    setEventLocation(newLocation);
    setDestino(newLocation);

    setShowSettingsModal(false);
  };

  // Load from Supabase or fallback to localStorage on initial render
  const fetchDelegacoes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('delegacoes')
        .select('*')
        .order('dataCadastro', { ascending: false });

      if (error) {
        // Se a tabela não existir, o Postgres retorna o erro 42P01
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setDbMissing(true);
          loadLocalFallback();
        } else {
          setError(`Erro ao conectar com Supabase: ${error.message}`);
          loadLocalFallback();
        }
      } else {
        setDbMissing(false);
        setDelegacoes(data || []);
      }
    } catch (err: any) {
      setError(`Erro de rede ou conexão: ${err.message || err}`);
      loadLocalFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalFallback = () => {
    const stored = localStorage.getItem('caminhada_eca_delegacoes');
    if (stored) {
      try {
        setDelegacoes(JSON.parse(stored));
      } catch (e) {
        setDelegacoes(DELEGACOES_INICIAIS);
      }
    } else {
      setDelegacoes(DELEGACOES_INICIAIS);
      localStorage.setItem('caminhada_eca_delegacoes', JSON.stringify(DELEGACOES_INICIAIS));
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchDelegacoes();
  }, []);

  // Save to localStorage (fallback mode)
  const saveToStorage = (newList: Delegacao[]) => {
    setDelegacoes(newList);
    localStorage.setItem('caminhada_eca_delegacoes', JSON.stringify(newList));
  };

  // Helper to trigger temporary success messages
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Contact number auto-formatting (Brazilian standards, Salvador DDD 71)
  const handleContatoChange = (val: string) => {
    // Remove non-digits
    const clean = val.replace(/\D/g, '');
    
    // Format
    let formatted = clean;
    if (clean.length > 0) {
      if (clean.length <= 2) {
        formatted = `(${clean}`;
      } else if (clean.length <= 6) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
      } else if (clean.length <= 10) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
      } else {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
      }
    }
    setContato(formatted);
  };

  // Clear Form Fields
  const resetForm = () => {
    setNomeEscola('');
    setEndereco('');
    setEmbarque('');
    setDestino(eventLocation);
    setHorarioSaida('');
    setHorarioRetorno('');
    setResponsavel('');
    setContato('');
    setQuantidade('');
    setEditingId(null);
    setError(null);
  };

  // Load standard template values to facilitate testing
  const loadExemploValores = () => {
    setNomeEscola('Colégio Municipal de Salvador');
    setEndereco('Avenida ACM, s/n - Itaigara, Salvador - BA');
    setEmbarque('Portaria Principal da Escola');
    setDestino('Campo Grande (Concentração da Caminhada)');
    setHorarioSaida('07:30');
    setHorarioRetorno('12:15');
    setResponsavel('Diretora Maria Auxiliadora');
    setContato('(71) 98765-4321');
    setQuantidade(50);
    setError(null);
    triggerSuccess('Campos preenchidos com dados fictícios para teste!');
  };

  // Load original sample mock database
  const restaurarBancoCompleto = async () => {
    if (dbMissing) {
      saveToStorage(DELEGACOES_INICIAIS);
      triggerSuccess('Dados originais de exemplo restaurados com sucesso! (Local)');
    } else {
      setError(null);
      // Remove all first
      const { error: delError } = await supabase
        .from('delegacoes')
        .delete()
        .neq('id', '0'); // deletes everything

      if (delError) {
        setError(`Erro ao limpar banco no Supabase: ${delError.message}`);
        return;
      }

      // Insert mock data
      const { error: insError } = await supabase
        .from('delegacoes')
        .insert(DELEGACOES_INICIAIS);

      if (insError) {
        setError(`Erro ao restaurar banco no Supabase: ${insError.message}`);
        return;
      }

      triggerSuccess('Dados originais de exemplo restaurados com sucesso no Supabase!');
      fetchDelegacoes();
    }
  };

  // Handle Submit Form (Add / Edit)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!nomeEscola.trim()) return setError('O nome da escola é obrigatório.');
    if (!endereco.trim()) return setError('O endereço da escola é obrigatório.');
    if (!embarque.trim()) return setError('O local de embarque é obrigatório.');
    if (!destino.trim()) return setError('O destino da caminhada é obrigatório.');
    if (!horarioSaida) return setError('O horário de saída é obrigatório.');
    if (!horarioRetorno) return setError('O horário de retorno é obrigatório.');
    if (!responsavel.trim()) return setError('O nome do responsável é obrigatório.');
    if (!contato.trim()) return setError('O contato de telefone/celular é obrigatório.');
    if (!quantidade || quantidade <= 0) return setError('A quantidade de participantes deve ser maior que zero.');

    if (editingId) {
      // Edit mode
      if (dbMissing) {
        const updated = delegacoes.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              nomeEscola,
              endereco,
              embarque,
              destino,
              horarioSaida,
              horarioRetorno,
              responsavel,
              contato,
              quantidade: Number(quantidade)
            };
          }
          return item;
        });
        saveToStorage(updated);
        triggerSuccess('Delegação escolar atualizada com sucesso! (Local)');
        resetForm();
      } else {
        const { error: dbErr } = await supabase
          .from('delegacoes')
          .update({
            nomeEscola,
            endereco,
            embarque,
            destino,
            horarioSaida,
            horarioRetorno,
            responsavel,
            contato,
            quantidade: Number(quantidade)
          })
          .eq('id', editingId);

        if (dbErr) {
          setError(`Erro ao atualizar no Supabase: ${dbErr.message}`);
        } else {
          triggerSuccess('Delegação escolar atualizada com sucesso no Supabase!');
          resetForm();
          fetchDelegacoes();
        }
      }
    } else {
      // Create mode
      const novaDelegacao: Delegacao = {
        id: Date.now().toString(),
        nomeEscola,
        endereco,
        embarque,
        destino,
        horarioSaida,
        horarioRetorno,
        responsavel,
        contato,
        quantidade: Number(quantidade),
        dataCadastro: new Date().toISOString()
      };
      
      if (dbMissing) {
        const updated = [novaDelegacao, ...delegacoes];
        saveToStorage(updated);
        if (isPublicView) {
          resetForm();
          setPublicSuccessData(novaDelegacao);
        } else {
          triggerSuccess('Escola inscrita com sucesso! (Local)');
          resetForm();
        }
      } else {
        const { error: dbErr } = await supabase
          .from('delegacoes')
          .insert([novaDelegacao]);

        if (dbErr) {
          setError(`Erro ao salvar no Supabase: ${dbErr.message}`);
        } else {
          if (isPublicView) {
            resetForm();
            setPublicSuccessData(novaDelegacao);
          } else {
            triggerSuccess('Escola inscrita com sucesso no Supabase!');
            resetForm();
            fetchDelegacoes();
          }
        }
      }
    }
  };

  // Handle Edit Action
  const handleEdit = (item: Delegacao) => {
    setEditingId(item.id);
    setNomeEscola(item.nomeEscola);
    setEndereco(item.endereco);
    setEmbarque(item.embarque);
    setDestino(item.destino);
    setHorarioSaida(item.horarioSaida);
    setHorarioRetorno(item.horarioRetorno);
    setResponsavel(item.responsavel);
    setContato(item.contato);
    setQuantidade(item.quantidade);
    setError(null);
    
    // Scroll smoothly to form on mobile/small screens
    const formElement = document.getElementById('form-cadastro');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Delete Action
  const handleDelete = async (id: string) => {
    if (dbMissing) {
      const updated = delegacoes.filter(item => item.id !== id);
      saveToStorage(updated);
      if (editingId === id) {
        resetForm();
      }
      setShowDeleteModal(null);
      triggerSuccess('Inscrição removida com sucesso! (Local)');
    } else {
      const { error: dbErr } = await supabase
        .from('delegacoes')
        .delete()
        .eq('id', id);

      if (dbErr) {
        setError(`Erro ao excluir no Supabase: ${dbErr.message}`);
      } else {
        if (editingId === id) {
          resetForm();
        }
        setShowDeleteModal(null);
        triggerSuccess('Inscrição removida com sucesso no Supabase!');
        fetchDelegacoes();
      }
    }
  };

  // Filters / Search
  const filteredDelegacoes = delegacoes.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.nomeEscola.toLowerCase().includes(term) ||
      item.responsavel.toLowerCase().includes(term) ||
      item.endereco.toLowerCase().includes(term)
    );
  });

  // Statistics
  const totalEscolas = delegacoes.length;
  const totalAlunos = delegacoes.reduce((acc, curr) => acc + curr.quantidade, 0);
  const mediaAlunos = totalEscolas > 0 ? Math.round(totalAlunos / totalEscolas) : 0;

  // --- RENDER FOR PUBLIC VIEW ---
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-between" id="public-container">
        
        {/* HEADER PUBLICO SIMPLIFICADO */}
        <header className="bg-blue-900 text-white p-5 border-b-4 border-yellow-500 shadow-sm shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo Conselho Tutelar" className="w-14 h-14 object-contain bg-white p-1 rounded-full border border-yellow-500" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">{eventTitle}</h1>
                <p className="text-[10px] sm:text-xs font-semibold opacity-80 uppercase tracking-widest">
                  Conselho Tutelar de Salvador • Ficha de Inscrição
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-yellow-500">{eventDate} • {eventTime}</p>
              <p className="text-[9px] uppercase opacity-70">Concentração no {eventLocation}</p>
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL PÚBLICO */}
        <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center items-center">
          {publicSuccessData ? (
            /* TELA DE SUCESSO PÚBLICA */
            <div className="bg-white border border-slate-300 p-8 shadow-md max-w-lg w-full text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">Inscrição Homologada!</h2>
                <p className="text-xs text-slate-500">
                  A escola <strong>{publicSuccessData.nomeEscola}</strong> foi inscrita com sucesso para o {eventTitle}.
                </p>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2 font-medium text-slate-600">
                <p><strong>Responsável:</strong> {publicSuccessData.responsavel}</p>
                <p><strong>Embarque:</strong> {publicSuccessData.embarque}</p>
                <p><strong>Participantes:</strong> {publicSuccessData.quantidade} integrantes</p>
                <p><strong>Destino:</strong> {publicSuccessData.destino}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    try {
                      await exportReciboPDF(publicSuccessData);
                    } catch (e: any) {
                      setError(`Erro ao gerar PDF: ${e.message || e}`);
                    }
                  }}
                  className="w-full bg-emerald-600 text-white font-bold py-3 text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm border-0"
                >
                  <Download className="w-4 h-4" />
                  Baixar Comprovante Oficial (PDF)
                </button>
                
                <button
                  onClick={() => setPublicSuccessData(null)}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-600 py-3 text-xs uppercase tracking-widest font-bold transition-all cursor-pointer bg-white"
                >
                  Realizar outra inscrição
                </button>
              </div>
            </div>
          ) : (
            /* FORMULÁRIO PÚBLICO */
            <div className="w-full max-w-xl">
              <div className="bg-white border border-slate-300 shadow-sm p-6 flex flex-col gap-5 rounded-none">
                
                {/* Header do Form */}
                <div className="border-l-4 border-blue-900 pl-4 mb-2">
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                    Formulário de Inscrição Escolar
                  </h2>
                  <p className="text-xs text-slate-500">
                    Preencha todos os campos obrigatórios para garantir a logística e segurança do seu grupo.
                  </p>
                </div>

                {/* Corpo do Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-none flex items-center gap-2.5 text-xs font-medium">
                       <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                       <span>{error}</span>
                     </div>
                  )}

                  {/* Nome da Escola */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Nome da Escola <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-nome-escola"
                      type="text"
                      value={nomeEscola}
                      onChange={(e) => setNomeEscola(e.target.value)}
                      placeholder="Escola Municipal Exemplo"
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Endereço Completo <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-endereco"
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua das Flores, s/n, Centro"
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Embarque e Destino */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                        Ponto de Embarque <span className="text-yellow-600">*</span>
                      </label>
                      <input
                        id="input-embarque"
                        type="text"
                        value={embarque}
                        onChange={(e) => setEmbarque(e.target.value)}
                        placeholder="Ex: Portão Principal"
                        className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                        Destino Final <span className="text-yellow-600">*</span>
                      </label>
                      <input
                        id="input-destino"
                        type="text"
                        value={destino}
                        onChange={(e) => setDestino(e.target.value)}
                        placeholder={eventLocation}
                        className="w-full border border-slate-200 bg-slate-100 text-slate-600 px-3 py-2 text-sm cursor-not-allowed rounded-none placeholder:text-slate-400"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Horários Saída / Retorno */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                        Horário Saída <span className="text-yellow-600">*</span>
                      </label>
                      <input
                        id="input-horario-saida"
                        type="time"
                        value={horarioSaida}
                        onChange={(e) => setHorarioSaida(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                        Horário Retorno <span className="text-yellow-600">*</span>
                      </label>
                      <input
                        id="input-horario-retorno"
                        type="time"
                        value={horarioRetorno}
                        onChange={(e) => setHorarioRetorno(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Responsável e Contato */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                        Responsável pelo Grupo <span className="text-yellow-600">*</span>
                      </label>
                      <input
                        id="input-responsavel"
                        type="text"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                        placeholder="Prof. João Silva"
                        className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                        Contato (WhatsApp) <span className="text-yellow-600">*</span>
                      </label>
                      <input
                        id="input-contato"
                        type="text"
                        value={contato}
                        onChange={(e) => handleContatoChange(e.target.value)}
                        placeholder="(71) 99999-0000"
                        className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Quantidade de Participantes <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-quantidade"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="45"
                      className="w-full sm:w-32 border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Total somado de estudantes, educadores e tutores.</p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-2">
                    <button
                      id="btn-limpar-form"
                      type="button"
                      onClick={resetForm}
                      className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-600 py-3 text-xs uppercase tracking-widest font-bold transition-all rounded-none cursor-pointer flex items-center justify-center gap-1.5 bg-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Limpar
                    </button>
                    <button
                      id="btn-confirmar-form"
                      type="submit"
                      className="flex-1 bg-blue-900 text-white font-bold py-3 text-xs uppercase tracking-widest hover:bg-blue-800 transition-colors rounded-none cursor-pointer flex items-center justify-center gap-1.5 border-0"
                    >
                      Salvar Formulário
                    </button>
                  </div>


                </form>

              </div>

              {/* BOX COMPLEMENTAR DE INFOS */}
              <div className="mt-6 bg-blue-50 border-2 border-dashed border-blue-200 p-6 rounded-none text-blue-900 space-y-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 underline underline-offset-4">
                  Observações Importantes
                </h4>
                <ul className="text-[11px] space-y-3 text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>A caminhada celebra os direitos da criança e do adolescente garantidos pelo ECA.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>É obrigatória a presença de pelo menos 1 responsável para cada 15 alunos.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>Ponto de concentração oficial: {eventLocation}, às {eventTime} pontualmente.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">•</span>
                    <span>Importante providenciar identificação visual e hidratação para as crianças.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </main>

        {/* FOOTER PÚBLICO */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center shrink-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            © 2026 Conselho Tutelar de Salvador - Organização do {eventTitle}
          </p>
        </footer>

      </div>
    );
  }

  // --- RENDER FOR ADMIN LOGIN ---
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex items-center justify-center p-4" id="login-container">
        <div className="bg-white border border-slate-300 p-8 shadow-md max-w-md w-full flex flex-col gap-6 rounded-none">
          
          {/* LOGO E TÍTULO LOGIN */}
          <div className="text-center space-y-3">
            <img src="/logo.png" alt="Logo Conselho Tutelar" className="w-24 h-24 object-contain mx-auto bg-slate-50 p-2 rounded-full border-2 border-blue-900" />
            <div className="space-y-1">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Conselho Tutelar de Salvador</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Painel Administrativo • {eventTitle}</p>
            </div>
          </div>

          {/* FORMULÁRIO DE LOGIN */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-none flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Digite o usuário"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white font-bold py-3 text-xs uppercase tracking-widest hover:bg-blue-800 transition-colors rounded-none cursor-pointer flex items-center justify-center gap-2 shadow-sm border-0"
            >
              Entrar no Painel
            </button>
          </form>

          {/* INFO AUXILIAR */}
          <div className="text-center pt-2 border-t border-slate-100">
            <a
              href="?view=public"
              className="text-[10px] text-blue-900 hover:text-blue-800 font-bold uppercase tracking-wide underline cursor-pointer"
            >
              Ir para o Formulário Público de Inscrição
            </a>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER FOR ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col" id="main-container">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-blue-900 text-white p-6 border-b-4 border-yellow-500 flex-none shrink-0" id="header-section">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo Conselho Tutelar" className="w-16 h-16 object-contain bg-white p-1 rounded-full border-2 border-yellow-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase flex items-center gap-2">
                {eventTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
                <p className="text-xs sm:text-sm font-medium opacity-80 uppercase tracking-widest">
                  Conselho Tutelar de Salvador • Organização 2026
                </p>
                <span className="hidden sm:inline opacity-30 text-white">•</span>
                {isLoading ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-yellow-400 font-bold bg-yellow-500/20 px-2 py-0.5 uppercase tracking-wider rounded border border-yellow-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                    Conectando Supabase...
                  </span>
                ) : dbMissing ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 uppercase tracking-wider rounded border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Modo Local (Banco Ausente)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 uppercase tracking-wider rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Supabase Sincronizado
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="text-left sm:text-right hidden md:block">
              <p className="text-lg sm:text-xl font-bold text-yellow-500">{eventDate}</p>
              <p className="text-xs uppercase opacity-70">Concentração às {eventTime} no {eventLocation}</p>
            </div>
            
            {/* BOTÕES DE CONTROLE ADMIN */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setNewUsername(adminUsername);
                  setNewPassword(adminPassword);
                  setNewTitle(eventTitle);
                  setNewDate(eventDate);
                  setNewTime(eventTime);
                  setNewLocation(eventLocation);
                  setShowSettingsModal(true);
                }}
                title="Configurações Gerais da Plataforma"
                className="flex-1 sm:flex-initial bg-blue-800 hover:bg-blue-700 text-white font-bold px-3 py-2 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 rounded-none cursor-pointer border-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Configurar</span>
              </button>

              <button
                onClick={copyPublicLink}
                title="Copiar Link do Formulário Público para Divulgação"
                className="flex-1 sm:flex-initial bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-3 py-2 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 rounded-none cursor-pointer border-0"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Link Público</span>
              </button>
              
              <button
                onClick={handleLogout}
                title="Encerrar Sessão do Administrador"
                className="flex-1 sm:flex-initial border border-white/30 hover:border-white hover:bg-white/10 text-white font-bold px-3 py-2 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 rounded-none cursor-pointer bg-transparent"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PAINEL DE FEEDBACK RAPIDO */}
      {successMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 p-4 rounded-none flex items-start gap-3 shadow-sm animate-fade-in" id="success-banner">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-emerald-800">Operação Realizada</p>
              <p className="text-xs text-emerald-700 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* AVISO DE SCHEMA SUPABASE AUSENTE */}
      {dbMissing && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-amber-50 border-l-4 border-amber-600 text-amber-900 p-5 shadow-sm animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4" id="supabase-warning-banner">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-amber-800">Tabela Supabase Ausente</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  A tabela <code className="bg-amber-100/80 px-1 font-bold text-amber-900">delegacoes</code> não foi encontrada no banco do Supabase. 
                  O aplicativo está salvando as inscrições temporariamente no navegador (LocalStorage).
                </p>
                <p className="text-xs text-slate-600 mt-2 font-mono">
                  👉 Para sincronizar com a nuvem, execute o script SQL do arquivo <a href="file:///h:/AntiGrafity/caminhada-do-eca/supabase_schema.sql" className="underline font-bold text-blue-900">supabase_schema.sql</a> no <strong>SQL Editor</strong> do Supabase.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded">
                Fallback Local Ativado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL (DASHBOARD) */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 flex-1">
        
        {/* BLOCO DE ESTATÍSTICAS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8" id="stats-section">
          
          <div className="bg-white border border-slate-300 shadow-sm p-6 rounded-none flex items-center justify-between border-l-4 border-l-blue-900 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Escolas Confirmadas</span>
              <h3 className="text-2xl font-black text-slate-800">{totalEscolas}</h3>
              <p className="text-xs text-slate-500">Instituições cadastradas</p>
            </div>
            <div className="p-3 bg-slate-100 text-blue-900">
              <School className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-300 shadow-sm p-6 rounded-none flex items-center justify-between border-l-4 border-l-yellow-500 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Total de Integrantes</span>
              <h3 className="text-2xl font-black text-slate-800">{totalAlunos}</h3>
              <p className="text-xs text-slate-500">Alunos, docentes e equipe</p>
            </div>
            <div className="p-3 bg-slate-100 text-yellow-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-300 shadow-sm p-6 rounded-none flex items-center justify-between border-l-4 border-l-blue-900 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Média por Delegação</span>
              <h3 className="text-2xl font-black text-slate-800">{mediaAlunos}</h3>
              <p className="text-xs text-slate-500">Participantes por escola</p>
            </div>
            <div className="p-3 bg-slate-100 text-blue-900">
              <Layers className="w-5 h-5" />
            </div>
          </div>

        </section>

        {/* WORKSPACE DIVIDIDO EM DUAS COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO DE CADASTRO (5/12) */}
          <section className="lg:col-span-5" id="form-cadastro">
            <div className="bg-white border border-slate-300 shadow-sm p-6 flex flex-col gap-5 rounded-none">
              
              {/* Header do Form */}
              <div className="border-l-4 border-blue-900 pl-4 mb-2">
                <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                  {editingId ? 'Editar Cadastro de Delegação' : 'Formulário de Inscrição Escolar'}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingId 
                    ? 'Atualize os dados nos campos abaixo para corrigir a delegação.' 
                    : 'Preencha os dados para logística e segurança do evento'}
                </p>
              </div>

              {/* Corpo do Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-none flex items-center gap-2.5 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Nome da Escola */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                    Nome da Escola <span className="text-yellow-600">*</span>
                  </label>
                  <input
                    id="input-nome-escola"
                    type="text"
                    value={nomeEscola}
                    onChange={(e) => setNomeEscola(e.target.value)}
                    placeholder="Escola Municipal Exemplo"
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                    Endereço Completo <span className="text-yellow-600">*</span>
                  </label>
                  <input
                    id="input-endereco"
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua das Flores, s/n, Centro"
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Embarque e Destino */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Ponto de Embarque <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-embarque"
                      type="text"
                      value={embarque}
                      onChange={(e) => setEmbarque(e.target.value)}
                      placeholder="Ex: Portão Principal"
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Destino Final <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-destino"
                      type="text"
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                      placeholder={eventLocation}
                      className="w-full border border-slate-200 bg-slate-100 text-slate-600 px-3 py-2 text-sm cursor-not-allowed rounded-none placeholder:text-slate-400"
                      readOnly
                    />
                  </div>
                </div>

                {/* Horários Saída / Retorno */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Horário Saída <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-horario-saida"
                      type="time"
                      value={horarioSaida}
                      onChange={(e) => setHorarioSaida(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Horário Retorno <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-horario-retorno"
                      type="time"
                      value={horarioRetorno}
                      onChange={(e) => setHorarioRetorno(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all"
                    />
                  </div>
                </div>

                {/* Responsável e Contato */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Responsável pelo Grupo <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-responsavel"
                      type="text"
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      placeholder="Prof. João Silva"
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                      Contato (WhatsApp) <span className="text-yellow-600">*</span>
                    </label>
                    <input
                      id="input-contato"
                      type="text"
                      value={contato}
                      onChange={(e) => handleContatoChange(e.target.value)}
                      placeholder="(71) 99999-0000"
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Quantidade */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">
                    Quantidade de Participantes <span className="text-yellow-600">*</span>
                  </label>
                  <input
                    id="input-quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="45"
                    className="w-full sm:w-32 border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Total somado de estudantes, educadores e tutores.</p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-2">
                  <button
                    id="btn-limpar-form"
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-600 py-3 text-xs uppercase tracking-widest font-bold transition-all rounded-none cursor-pointer flex items-center justify-center gap-1.5 bg-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                  <button
                    id="btn-confirmar-form"
                    type="submit"
                    className="flex-1 bg-blue-900 text-white font-bold py-3 text-xs uppercase tracking-widest hover:bg-blue-800 transition-colors rounded-none cursor-pointer flex items-center justify-center gap-1.5 border-0"
                  >
                    {editingId ? 'Salvar Edição' : 'Salvar Formulário'}
                  </button>
                </div>


              </form>

            </div>

            {/* BOX COMPLEMENTAR DE INFOS */}
            <div className="mt-6 bg-blue-50 border-2 border-dashed border-blue-200 p-6 rounded-none text-blue-900 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 underline underline-offset-4">
                Observações Importantes
              </h4>
              <ul className="text-[11px] space-y-3 text-blue-800">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>A caminhada celebra os direitos da criança e do adolescente garantidos pelo ECA.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>É obrigatória a presença de pelo menos 1 responsável para cada 15 alunos.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>Ponto de concentração oficial: {eventLocation}, às {eventTime} pontualmente.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  <span>Importante providenciar identificação visual e hidratação para as crianças.</span>
                </li>
              </ul>
            </div>

          </section>

          {/* COLUNA DIREITA: RELATÓRIO E EXPORTAÇÃO (7/12) */}
          <section className="lg:col-span-7 space-y-6" id="lista-inscritos">
            
            {/* BOX EXPORTADOR GEOMETRIC */}
            <div className="bg-slate-100 p-6 flex flex-col gap-4 border border-slate-300 rounded-none">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">Exportar Dados</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">Utilize as opções abaixo para gerar o arquivo de conferência para o Conselho Tutelar.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <button
                  id="btn-export-pdf"
                  onClick={async () => {
                    try {
                      await exportToPDF(delegacoes);
                    } catch (e: any) {
                      setError(`Erro ao exportar PDF: ${e.message || e}`);
                    }
                  }}
                  disabled={delegacoes.length === 0}
                  className="flex items-center justify-between bg-white border border-slate-300 p-3 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left rounded-none"
                >
                  <span className="text-[10px] font-bold uppercase text-slate-700">Documento PDF Geral</span>
                  <span className="bg-red-100 text-red-700 text-[9px] px-2 py-1 font-bold">PDF</span>
                </button>
                
                <button
                  id="btn-export-xlsx"
                  onClick={() => exportToExcel(delegacoes)}
                  disabled={delegacoes.length === 0}
                  className="flex items-center justify-between bg-white border border-slate-300 p-3 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left rounded-none"
                >
                  <span className="text-[10px] font-bold uppercase text-slate-700">Relatório Completo XLSX</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-1 font-bold">EXCEL</span>
                </button>
              </div>
            </div>

            {/* TABELA DE INSCRITOS */}
            <div className="bg-white border border-slate-300 shadow-sm overflow-hidden rounded-none">
              
              {/* Header do Relatório */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="border-l-4 border-blue-900 pl-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                    Delegações Cadastradas
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Gerenciador e listagem em tempo real de escolas inscritas</p>
                </div>
              </div>

              {/* Filtro / Pesquisa */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="input-pesquisa"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar escola, responsável..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 rounded-none bg-white placeholder:text-slate-400"
                  />
                </div>

                {delegacoes.length === 0 && (
                  <button
                    id="btn-restaurar-exemplos"
                    onClick={restaurarBancoCompleto}
                    className="text-[10px] font-bold text-blue-950 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1.5 underline cursor-pointer bg-transparent border-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Carregar Exemplos
                  </button>
                )}

                {delegacoes.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    Mostrando <strong className="text-blue-900">{filteredDelegacoes.length}</strong> de <strong className="text-blue-900">{totalEscolas}</strong> escolas
                  </span>
                )}
              </div>

              {/* Lista / Tabela */}
              <div className="overflow-x-auto">
                {filteredDelegacoes.length > 0 ? (
                  <table className="w-full text-left border-collapse" id="escolas-table">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase tracking-widest border-b border-slate-200">
                        <th className="py-3 px-6">Escola / Endereço</th>
                        <th className="py-3 px-4">Responsável / Contato</th>
                        <th className="py-3 px-4 text-center">Horários</th>
                        <th className="py-3 px-4 text-center">Membros</th>
                        <th className="py-3 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredDelegacoes.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                          
                          {/* Nome e Endereço */}
                          <td className="py-4 px-6 max-w-xs">
                            <div className="font-bold text-slate-800 break-words group-hover:text-blue-900 transition-colors uppercase text-[11px]">
                              {item.nomeEscola}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 break-words">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-300" />
                              {item.endereco}
                            </div>
                          </td>

                          {/* Responsável e Contato */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-700 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-300" />
                              {item.responsavel}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-300" />
                              {item.contato}
                            </div>
                          </td>

                          {/* Horários */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-800 border border-slate-200 text-[9px] font-black uppercase">
                              Saída: {item.horarioSaida}h
                            </span>
                            <div className="text-[9px] text-slate-400 mt-1">
                              Retorno: {item.horarioRetorno}h
                            </div>
                          </td>

                          {/* Quantidade */}
                          <td className="py-4 px-4 text-center">
                            <div className="font-black text-slate-800 text-sm">{item.quantidade}</div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Qtd</div>
                          </td>

                          {/* Ações */}
                          <td className="py-4 px-6 text-right space-y-1 sm:space-y-0 sm:space-x-1 whitespace-nowrap">
                            
                            {/* Baixar PDF Individual */}
                             <button
                               id={`btn-comprovante-${item.id}`}
                               onClick={async () => {
                                 try {
                                   await exportReciboPDF(item);
                                 } catch (e: any) {
                                   setError(`Erro ao exportar comprovante: ${e.message || e}`);
                                 }
                               }}
                               title="Baixar Comprovante Oficial em PDF"
                               className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-950 transition-colors inline-flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 rounded-none bg-transparent"
                             >
                               <Download className="w-4 h-4" />
                             </button>

                            {/* Editar */}
                            <button
                              id={`btn-editar-${item.id}`}
                              onClick={() => handleEdit(item)}
                              title="Editar Inscrição"
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-yellow-600 transition-colors inline-flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 rounded-none bg-transparent"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Deletar */}
                            <button
                              id={`btn-deletar-${item.id}`}
                              onClick={() => setShowDeleteModal(item.id)}
                              title="Excluir Inscrição"
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors inline-flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200 rounded-none bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-16 px-6 text-center text-slate-400 space-y-4" id="empty-state">
                    <School className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
                    <div>
                      <p className="font-bold text-slate-600 uppercase text-xs tracking-wider">Nenhuma delegação encontrada</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Inicie adicionando uma nova instituição no formulário lateral ou recarregue o banco de testes fictícios.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        id="btn-recarregar-dados-vazio"
                        onClick={restaurarBancoCompleto}
                        className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-[10px] uppercase font-bold tracking-widest transition-all rounded-none cursor-pointer inline-flex items-center gap-1.5 border-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restaurar Lista de Exemplo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Informação do Destino Padrão na base */}
              <div className="p-4 bg-slate-50 text-slate-500 text-[9px] uppercase font-bold tracking-wide text-center border-t border-slate-200 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span>O destino padrão para todas as delegações é o <strong>{eventLocation}</strong>, ponto de início.</span>
              </div>

            </div>
          </section>

        </div>

      </main>

      {/* FOOTER DA PÁGINA */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 shrink-0" id="footer-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            © 2026 Conselho Tutelar de Salvador - Organização do {eventTitle}
          </p>
          <p className="text-[9px] text-slate-400 max-w-xl mx-auto">
            Estatuto da Criança e do Adolescente (Lei Federal nº 8.069) - Garantindo a prioridade absoluta e a proteção integral a toda criança e adolescente.
          </p>
        </div>
      </footer>

      {/* CONFIRMAÇÃO DE DELETAR MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="delete-modal">
          <div className="bg-white max-w-md w-full p-6 border border-slate-300 rounded-none space-y-5">
            <div className="flex items-center gap-3 text-red-600 border-b border-slate-100 pb-3">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Confirmar Exclusão</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Você está prestes a remover o cadastro desta delegação escolar da base local. Esta ação é irreversível e impedirá a exportação futura desta inscrição específica.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                id="btn-modal-cancelar"
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer bg-white"
              >
                Cancelar
              </button>
              <button
                id="btn-modal-excluir"
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer border-0"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÕES (EDITAR LOGIN/SENHA E INFOS DO EVENTO) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="settings-modal">
          <div className="bg-white max-w-lg w-full p-6 border border-slate-300 rounded-none space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-900">
                <Lock className="w-5 h-5" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Configurações Gerais</h3>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold bg-transparent border-0 cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              {/* Seção 1: Credenciais de Acesso */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                  Credenciais Administrativas
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-600 uppercase">Novo Usuário</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-600 uppercase">Nova Senha</label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="admin"
                      className="w-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Informações do Evento */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                  Informações da Aplicação & Evento
                </h4>
                
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase">Nome / Título da Aplicação</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Caminhada do ECA"
                    className="w-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-600 uppercase">Data do Evento</label>
                    <input
                      type="text"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="13 de Julho"
                      className="w-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-600 uppercase">Horário de Início</label>
                    <input
                      type="text"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="08:00h"
                      className="w-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase">Local de Concentração (Destino Padrão)</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Campo Grande"
                    className="w-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer border-0"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
