import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  User,
  MessageSquare,
  BookOpen,
  Shield,
  Database,
  Download,
  RefreshCw
} from 'lucide-react';

// Configuração da API
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8888/.netlify/functions/api'
  : '/.netlify/functions/api';

const EBDSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [setupStatus, setSetupStatus] = useState(false);
  
  // Estados para dados
  const [statistics, setStatistics] = useState({
    estatisticas: {
      total_membros: 0,
      total_respostas: 0,
      taxa_participacao: 0,
      pontuacao_media: 0
    },
    por_categoria: {}
  });
  
  const [perguntas, setPerguntas] = useState({});

  // Carrega dados iniciais
  useEffect(() => {
    loadPerguntas();
    loadStatistics();
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/perguntas`);
      setSetupStatus(response.ok);
    } catch (error) {
      console.error('Erro ao verificar setup:', error);
      setSetupStatus(false);
    }
  };

  const loadPerguntas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/perguntas`);
      const data = await response.json();
      if (response.ok) {
        setPerguntas(data.perguntas);
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/relatorios`);
      const data = await response.json();
      if (response.ok) {
        setStatistics(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Componente Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">📚 Sistema EBD - Supabase + Netlify</h2>
        <p className="opacity-90">Gestão completa de membros, perguntas e respostas - 100% Gratuito</p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <Database className="w-4 h-4 mr-1" />
            PostgreSQL
          </span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            API Ilimitada
          </span>
          <span className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            500MB Gratuito
          </span>
        </div>
      </div>

      {!setupStatus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="font-medium text-yellow-800">Setup Necessário</h3>
              <p className="text-yellow-700 text-sm">Configure o banco de dados na aba Configurações.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Membros</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.estatisticas.total_membros}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Respostas</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.estatisticas.total_respostas}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Participação</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.estatisticas.taxa_participacao}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-gray-800">{statistics.estatisticas.pontuacao_media}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Perguntas por Categoria
          </h3>
          <div className="space-y-3">
            {Object.entries(perguntas).map(([key, question]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{question.titulo}</p>
                  <p className="text-sm text-gray-600 capitalize">{question.categoria}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  question.categoria === 'todos' ? 'bg-blue-100 text-blue-800' :
                  question.categoria === 'criancas' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {question.categoria}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Desempenho por Categoria
          </h3>
          <div className="space-y-3">
            {Object.entries(statistics.por_categoria).map(([categoria, dados]) => (
              <div key={categoria} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{categoria}</span>
                  <span className="text-sm text-gray-600">Média: {dados.media}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Membros: {dados.membros}</span>
                  <span>Respostas: {dados.respostas}</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${dados.membros > 0 ? (dados.respostas / dados.membros * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Cadastro de Membros
  const MemberRegistration = () => {
    const [formData, setFormData] = useState({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      categoria: 'todos',
      classe: ''
    });
    const [cpfValid, setCpfValid] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const validateCPF = async (cpf) => {
      if (cpf.length === 11) {
        try {
          const response = await fetch(`${API_BASE_URL}/validar-cpf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf })
          });
          const data = await response.json();
          setCpfValid(data.valido);
          
          if (data.ja_cadastrado) {
            setMessage({
              type: 'warning',
              text: `CPF já cadastrado para: ${data.membro_existente?.nome}`
            });
          } else {
            setMessage({ type: '', text: '' });
          }
        } catch (error) {
          setCpfValid(false);
        }
      } else {
        setCpfValid(null);
        setMessage({ type: '', text: '' });
      }
    };

    const handleSubmit = async () => {
      if (!formData.nome || !formData.cpf || !formData.categoria) {
        setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios' });
        return;
      }

      setSubmitting(true);
      setMessage({ type: '', text: '' });

      try {
        const response = await fetch(`${API_BASE_URL}/membros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({ type: 'success', text: 'Membro cadastrado com sucesso!' });
          setFormData({
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            categoria: 'todos',
            classe: ''
          });
          setCpfValid(null);
          loadStatistics(); // Atualiza estatísticas
        } else {
          setMessage({ type: 'error', text: data.error || 'Erro ao cadastrar membro' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro de conexão' });
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <User className="mr-2 h-6 w-6" />
            Cadastro de Membros
          </h2>

          {message.text && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => {
                    const cpf = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, cpf});
                    validateCPF(cpf);
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    cpfValid === false ? 'border-red-500' : cpfValid === true ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite apenas números"
                  maxLength="11"
                />
                {cpfValid !== null && (
                  <div className="absolute right-3 top-3">
                    {cpfValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value.replace(/\D/g, '')})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="11999999999"
                  maxLength="11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="criancas">Crianças/Intermediários/Adolescentes</option>
                  <option value="acessibilidade">Acessibilidade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe
                </label>
                <input
                  type="text"
                  value={formData.classe}
                  onChange={(e) => setFormData({...formData, classe: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da classe"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || cpfValid === false}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                submitting || cpfValid === false
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Membro'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente Configurações
  const ConfigurationPanel = () => {
    const [configuring, setConfiguring] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSetup = async () => {
      setConfiguring(true);
      setMessage({ type: '', text: '' });

      try {
        const response = await fetch(`${API_BASE_URL}/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({ type: 'success', text: 'Database configurado com sucesso!' });
          setSetupStatus(true);
          loadStatistics();
        } else {
          setMessage({ type: 'error', text: data.error || 'Erro na configuração' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro de conexão' });
      } finally {
        setConfiguring(false);
      }
    };

    const handleBackup = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/backup`, {
          method: 'POST',
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup-ebd-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setMessage({ type: 'success', text: 'Backup criado e baixado com sucesso!' });
        } else {
          setMessage({ type: 'error', text: 'Erro ao criar backup' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao criar backup' });
      }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Configurações do Sistema
          </h2>

          {message.text && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* Setup Database */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Configuração do Banco de Dados
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Configure as tabelas necessárias no Supabase PostgreSQL.
                </p>
                
                <button
                  onClick={handleSetup}
                  disabled={configuring}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    configuring
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {configuring ? (
                    <span className="flex items-center">
                      <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                      Configurando...
                    </span>
                  ) : (
                    'Configurar Database'
                  )}
                </button>
              </div>
            </div>

            {/* Backup */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Backup dos Dados
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Faça backup de todos os dados do sistema em formato JSON.
                </p>
                
                <button
                  onClick={handleBackup}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <span className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Criar Backup
                  </span>
                </button>
              </div>
            </div>

            {/* Status do Sistema */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Status do Sistema
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Backend API</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Online</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Database Supabase</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      setupStatus 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {setupStatus ? 'Configurado' : 'Pendente'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Perguntas EBD</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {Object.keys(perguntas).length} Carregadas
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Membros</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {statistics.estatisticas.total_membros}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Upload de Planilha
  const FileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      setMessage({ type: '', text: '' });

      try {
        // Simula processamento por agora
        setMessage({ type: 'info', text: 'Processamento de planilha será implementado em breve' });
        
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao processar arquivo' });
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Upload className="mr-2 h-6 w-6" />
            Upload de Planilha
          </h2>

          {message.text && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Carregar Planilha de Membros</h3>
              <p className="text-gray-600 mb-4">
                Suporta arquivos Excel (.xlsx, .xls) e CSV (.csv)
              </p>
              
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white cursor-pointer transition-colors ${
                  uploading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Processando...' : 'Selecionar Arquivo'}
              </label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Formato da Planilha:</h4>
              <p className="text-sm text-gray-700">
                A planilha deve conter as colunas: <strong>nome</strong>, <strong>cpf</strong>, <strong>categoria</strong>
                <br />
                Colunas opcionais: email, telefone, classe
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente principal com navegação
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: Dashboard },
    { id: 'members', label: 'Cadastro', icon: Users, component: MemberRegistration },
    { id: 'upload', label: 'Upload', icon: Upload, component: FileUpload },
    { id: 'config', label: 'Configurações', icon: Settings, component: ConfigurationPanel }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema EBD</h1>
                <p className="text-xs text-gray-500">Supabase + Netlify</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadStatistics}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>© 2025 Sistema EBD - Escola Bíblica Dominical</p>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                Sistema Online - 100% Gratuito
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EBDSystem;
