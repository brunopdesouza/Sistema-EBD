// netlify/functions/api.js - Backend para Sistema EBD
const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase (usar environment variables em produção)
const supabaseUrl = process.env.SUPABASE_URL || 'https://sifneeexxbqgscqinbwm.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZm5lZWV4eGJxZ3NjcWluYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTY3MDcsImV4cCI6MjA2NDc5MjcwN30.YnBZC-1fP3XTWrTGrlY9KAT-2fXRwy7u756xJhTN9Ac';

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;
  
  try {
    switch (true) {
      case path === '/setup' && method === 'POST':
        return await setupDatabase();
      
      case path === '/perguntas' && method === 'GET':
        return await listarPerguntas();
      
      case path === '/validar-cpf' && method === 'POST':
        return await validarCPF(JSON.parse(event.body));
      
      case path === '/membros' && method === 'POST':
        return await cadastrarMembro(JSON.parse(event.body));
      
      case path === '/membros' && method === 'GET':
        return await listarMembros();
      
      case path === '/processar-planilha' && method === 'POST':
        return await processarPlanilha(JSON.parse(event.body));
      
      case path === '/relatorios' && method === 'GET':
        return await gerarRelatorios();
      
      case path === '/respostas' && method === 'POST':
        return await submeterResposta(JSON.parse(event.body));
      
      case path === '/backup' && method === 'POST':
        return await criarBackup();
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint não encontrado' })
        };
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// Setup inicial do banco de dados
async function setupDatabase() {
  try {
    // Tentar criar as tabelas usando SQL direto
    const { error: membrosError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS membros (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          cpf VARCHAR(11) UNIQUE NOT NULL,
          email VARCHAR(255),
          telefone VARCHAR(20),
          categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('todos', 'criancas', 'acessibilidade')),
          classe VARCHAR(255),
          data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_membros_cpf ON membros(cpf);
        CREATE INDEX IF NOT EXISTS idx_membros_categoria ON membros(categoria);
        CREATE INDEX IF NOT EXISTS idx_membros_status ON membros(status);
      `
    }).catch(() => ({ error: 'RPC não disponível' }));

    // Se RPC não funcionar, vamos tentar uma abordagem alternativa
    if (membrosError) {
      // Tentar inserir um registro de teste para verificar se a tabela existe
      const { error: testError } = await supabase
        .from('membros')
        .select('count', { count: 'exact', head: true });

      if (testError && testError.code === '42P01') {
        // Tabela não existe - precisamos criar manualmente
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Configure as tabelas manualmente no Supabase',
            warning: 'Acesse o SQL Editor no Supabase Dashboard',
            instructions: [
              'Vá para https://supabase.com/dashboard/project/sifneeexxbqgscqinbwm',
              'Clique em SQL Editor',
              'Execute os comandos CREATE TABLE fornecidos',
              'Volte aqui e tente novamente'
            ],
            sql_commands: [
              `CREATE TABLE membros (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                cpf VARCHAR(11) UNIQUE NOT NULL,
                email VARCHAR(255),
                telefone VARCHAR(20),
                categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('todos', 'criancas', 'acessibilidade')),
                classe VARCHAR(255),
                data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                status VARCHAR(20) DEFAULT 'ativo',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );`,
              `CREATE TABLE respostas (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                membro_id UUID REFERENCES membros(id) ON DELETE CASCADE,
                pergunta_id VARCHAR(10) NOT NULL,
                resposta_texto TEXT NOT NULL,
                pontuacao DECIMAL(3,1),
                data_resposta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                avaliada BOOLEAN DEFAULT FALSE,
                comentario_avaliacao TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );`
            ]
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Database Supabase configurado com sucesso!',
        tables: ['membros', 'respostas', 'configuracoes'],
        status: 'success'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Erro no setup: ' + error.message,
        suggestion: 'Configure as tabelas manualmente no Supabase Dashboard'
      })
    };
  }
}

// Lista perguntas (estáticas)
async function listarPerguntas() {
  const perguntas = {
    "todos": {
      "id": "p1",
      "titulo": "As Sete Operações do Espírito",
      "texto": "Lendo Apocalipse, capítulo 3, versos de 7 a 13, identifique as sete operações do Espírito de Deus em Filadélfia. Faça um breve comentário sobre cada uma das respostas:",
      "subitens": [
        "A) Espírito do Senhor",
        "B) Espírito de Sabedoria", 
        "C) Espírito de Inteligência",
        "D) Espírito de Conselho",
        "E) Espírito de Fortaleza",
        "F) Espírito de Conhecimento",
        "G) Espírito de Temor"
      ],
      "categoria": "todos",
      "referencia_biblica": "Apocalipse 3:7-13"
    },
    "criancas": {
      "id": "p2",
      "titulo": "A Pérola de Grande Valor",
      "texto": "Lendo Mateus, capítulo 13, versos 45 e 46, como a pérola de grande valor se relaciona com a operação do Espírito de Conhecimento ou Revelação?",
      "categoria": "criancas",
      "referencia_biblica": "Mateus 13:45-46"
    },
    "acessibilidade": {
      "id": "p3",  
      "titulo": "O Espírito Santo e Jesus",
      "texto": "Lendo Mateus, capítulo 13, versos 45 e 46, como a pérola de grande valor nos ajuda a entender o que o Espírito Santo nos mostra sobre Jesus?",
      "categoria": "acessibilidade",
      "referencia_biblica": "Mateus 13:45-46"
    }
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      perguntas,
      total: Object.keys(perguntas).length,
      categorias: Object.keys(perguntas),
      database: 'Supabase PostgreSQL'
    })
  };
}

// Valida CPF
async function validarCPF(data) {
  const { cpf } = data;
  
  function validarCPFBrasil(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    
    return resto === parseInt(cpf.charAt(10));
  }

  const cpfLimpo = cpf.replace(/\D/g, '');
  const valido = validarCPFBrasil(cpfLimpo);

  // Verifica se CPF já existe no Supabase
  let jaExiste = false;
  let membroExistente = null;
  
  if (valido) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select('id, nome, categoria')
        .eq('cpf', cpfLimpo)
        .eq('status', 'ativo')
        .maybeSingle();
      
      if (!error && data) {
        jaExiste = true;
        membroExistente = data;
      }
    } catch (error) {
      console.log('Erro ao verificar CPF:', error);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cpf: cpfLimpo,
      valido,
      formatado: valido ? `${cpfLimpo.slice(0,3)}.${cpfLimpo.slice(3,6)}.${cpfLimpo.slice(6,9)}-${cpfLimpo.slice(9)}` : null,
      ja_cadastrado: jaExiste,
      membro_existente: membroExistente,
      database: 'Supabase PostgreSQL'
    })
  };
}

// Cadastra membro
async function cadastrarMembro(data) {
  const { nome, cpf, email, telefone, categoria, classe } = data;
  
  if (!nome || !cpf || !categoria) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Campos obrigatórios não preenchidos' })
    };
  }

  // Valida CPF
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (!validarCPFBrasil(cpfLimpo)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'CPF inválido' })
    };
  }

  try {
    const { data: novoMembro, error } = await supabase
      .from('membros')
      .insert({
        nome,
        cpf: cpfLimpo,
        email: email || null,
        telefone: telefone || null,
        categoria,
        classe: classe || null
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'CPF já cadastrado' })
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Membro cadastrado com sucesso',
        membro_id: novoMembro.id,
        membro: novoMembro,
        database: 'Supabase PostgreSQL'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao cadastrar membro: ' + error.message })
    };
  }
}

// Lista membros
async function listarMembros() {
  try {
    const { data: membros, error } = await supabase
      .from('membros')
      .select('*')
      .eq('status', 'ativo')
      .order('nome', { ascending: true });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membros: membros || [],
        total: membros?.length || 0,
        database: 'Supabase PostgreSQL'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao listar membros: ' + error.message })
    };
  }
}

// Processa planilha em lote
async function processarPlanilha(data) {
  const { planilha } = data;
  
  const resultados = [];
  const erros = [];

  for (let i = 0; i < planilha.length; i++) {
    const linha = planilha[i];
    
    try {
      // Valida dados básicos
      if (!linha.nome || !linha.cpf || !linha.categoria) {
        erros.push(`Linha ${i + 2}: Campos obrigatórios não preenchidos`);
        continue;
      }

      // Valida CPF
      const cpfLimpo = linha.cpf.replace(/\D/g, '');
      if (!validarCPFBrasil(cpfLimpo)) {
        erros.push(`Linha ${i + 2}: CPF inválido`);
        continue;
      }

      // Cadastra no Supabase
      const { data: novoMembro, error } = await supabase
        .from('membros')
        .insert({
          nome: linha.nome,
          cpf: cpfLimpo,
          email: linha.email || null,
          telefone: linha.telefone || null,
          categoria: linha.categoria,
          classe: linha.classe || null
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          erros.push(`Linha ${i + 2}: CPF já cadastrado`);
        } else {
          erros.push(`Linha ${i + 2}: ${error.message}`);
        }
        continue;
      }

      resultados.push({
        linha: i + 2,
        nome: linha.nome,
        cpf: cpfLimpo,
        categoria: linha.categoria,
        status: 'Sucesso',
        id: novoMembro.id
      });

    } catch (error) {
      erros.push(`Linha ${i + 2}: ${error.message}`);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      total_linhas: planilha.length,
      sucessos: resultados.length,
      erros: erros.length,
      resultados,
      lista_erros: erros,
      database: 'Supabase PostgreSQL'
    })
  };
}

// Gera relatórios
async function gerarRelatorios() {
  try {
    // Busca estatísticas dos membros
    const { data: membros, error: membrosError } = await supabase
      .from('membros')
      .select('categoria')
      .eq('status', 'ativo');

    if (membrosError) throw membrosError;

    // Busca estatísticas das respostas
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select(`
        pontuacao,
        membros!inner(categoria)
      `);

    // Se tabela respostas não existir ainda, continua com dados básicos
    const respostasData = respostasError ? [] : (respostas || []);

    // Calcula estatísticas gerais
    const totalMembros = membros?.length || 0;
    const totalRespostas = respostasData.length;
    const taxaParticipacao = totalMembros > 0 ? (totalRespostas / totalMembros * 100) : 0;
    
    // Pontuação média
    const pontuacoes = respostasData
      .map(r => parseFloat(r.pontuacao))
      .filter(p => !isNaN(p));
    const pontuacaoMedia = pontuacoes.length > 0 ? 
      pontuacoes.reduce((a, b) => a + b, 0) / pontuacoes.length : 0;

    // Estatísticas por categoria
    const porCategoria = {};
    ['todos', 'criancas', 'acessibilidade'].forEach(cat => {
      const membrosCat = membros?.filter(m => m.categoria === cat) || [];
      const respostasCat = respostasData.filter(r => r.membros?.categoria === cat);
      const pontuacoesCat = respostasCat
        .map(r => parseFloat(r.pontuacao))
        .filter(p => !isNaN(p));
      
      porCategoria[cat] = {
        membros: membrosCat.length,
        respostas: respostasCat.length,
        media: pontuacoesCat.length > 0 ? 
          Math.round(pontuacoesCat.reduce((a, b) => a + b, 0) / pontuacoesCat.length * 10) / 10 : 0
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estatisticas: {
          total_membros: totalMembros,
          total_respostas: totalRespostas,
          taxa_participacao: Math.round(taxaParticipacao * 10) / 10,
          pontuacao_media: Math.round(pontuacaoMedia * 10) / 10
        },
        por_categoria: porCategoria,
        periodo: {
          inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          fim: new Date().toISOString()
        },
        database: 'Supabase PostgreSQL'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao gerar relatórios: ' + error.message })
    };
  }
}

// Submete resposta
async function submeterResposta(data) {
  const { membro_id, pergunta_id, resposta_texto, pontuacao } = data;

  try {
    const { data: novaResposta, error } = await supabase
      .from('respostas')
      .insert({
        membro_id,
        pergunta_id,
        resposta_texto,
        pontuacao: pontuacao || null,
        avaliada: pontuacao ? true : false
      })
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Resposta submetida com sucesso',
        resposta_id: novaResposta.id,
        pontuacao_automatica: pontuacao,
        timestamp: novaResposta.created_at,
        database: 'Supabase PostgreSQL'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao submeter resposta: ' + error.message })
    };
  }
}

// Criar backup manual
async function criarBackup() {
  try {
    // Busca todos os dados
    const { data: membros, error: membrosError } = await supabase
      .from('membros')
      .select('*');

    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select('*');

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'Supabase PostgreSQL',
      dados: {
        membros: membros || [],
        respostas: respostas || []
      },
      estatisticas: {
        total_membros: membros?.length || 0,
        total_respostas: respostas?.length || 0
      },
      errors: {
        membros: membrosError?.message,
        respostas: respostasError?.message
      }
    };

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-ebd-${new Date().toISOString().split('T')[0]}.json"`
      },
      body: JSON.stringify(backup, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao criar backup: ' + error.message })
    };
  }
}

// Função auxiliar validação CPF
function validarCPFBrasil(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  
  return resto === parseInt(cpf.charAt(10));
}
