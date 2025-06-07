// netlify/functions/api.js - COM IMPORTAÇÃO DOS SEUS DADOS
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sifneeexxbqgscqinbwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZm5lZWV4eGJxZ3NjcWluYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTY3MDcsImV4cCI6MjA2NDc5MjcwN30.YnBZC-1fP3XTWrTGrlY9KAT-2fXRwy7u756xJhTN9Ac';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// DADOS DO SEU ARQUIVO (baseado na análise)
const SEUS_DADOS = [
  {
    nome: "ANA ISADORA MONTEIRO XAVIER",
    cpf: "187.627.397-60",
    classe: "ADOLESCENTE",
    situacao: "MEMBRO",
    pergunta: 2,
    resposta: "A pérola de grande valor é Jesus. O Espírito Santo nos ajuda a compreender que Jesus é o mais precioso. Assim como o negociante vendeu tudo para adquirir a pérola, nós abandonamos tudo para seguir Jesus. A igreja de Filadélfia reconheceu o valor de Jesus porque o Espírito Santo revelou isso. Ele nos ensina que nada é mais importante do que Jesus.",
    status: "SUCESSO: Formulário enviado e modal confirmado"
  },
  {
    nome: "ANDRÉ DA COSTA CAETANO",
    cpf: "157.464.477-73",
    classe: "ADOLESCENTE",
    situacao: "MEMBRO",
    pergunta: 2,
    resposta: "A pérola de grande valor é Jesus. O Espírito Santo nos mostra que Jesus é o mais precioso e o mais importante. Assim como o negociante vendeu tudo para possuir a pérola, nós entregamos nosso coração e tudo o que temos para seguir Jesus. Ele é o tesouro que o Espírito Santo nos ajuda a encontrar e compreender.",
    status: "SUCESSO: Formulário enviado e modal confirmado"
  },
  {
    nome: "APARECIDA PEREIRA C. CAMISÃO",
    cpf: "031.507.487-63",
    classe: "senhora",
    situacao: "MEMBRO",
    pergunta: 1,
    resposta: "No verso 12, o Senhor promete fazer do vencedor uma coluna no templo de Deus e gravar nele o nome do Senhor, da cidade de Deus e o novo nome. Essa operação aponta para o temor reverente que conduz o crente a uma vida de obediência e submissão à vontade divina, reconhecendo a soberania de Deus e buscando agradá-Lo em tudo. A mensagem à igreja de Filadélfia, portanto, destaca a ação completa do Espírito de Deus na vida dos fiéis, capacitando-os a viver em santidade, sabedoria, discernimento, conselho, fortaleza, revelação e temor.",
    status: "SUCESSO: Formulário enviado e modal confirmado"
  },
  {
    nome: "FABIO GONÇALVES",
    cpf: "045.828.127-16",
    classe: "VARÃO",
    situacao: "visitante",
    pergunta: 1,
    resposta: "A Igreja Cristã Maranata ensina que as sete operações do Espírito de Deus, mencionadas em Apocalipse 3:7-13, revelam aspectos da ação do Espírito Santo na vida da igreja fiel, representada pela igreja de Filadélfia. Cada operação expressa o cuidado de Deus em preparar e preservar o Seu povo para o momento do arrebatamento.",
    status: "SUCESSO: Formulário enviado e modal confirmado"
  }
  // Adicione mais dados conforme necessário
];

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;

  try {
    // ==========================================
    // IMPORTAR DADOS DA PLANILHA
    // ==========================================
    if (path === '/importar-planilha' && method === 'POST') {
      return await importarDadosPlanilha();
    }

    // ==========================================
    // ENDPOINTS PRINCIPAIS
    // ==========================================
    
    // IGREJAS
    if (path === '/igrejas' && method === 'GET') {
      const { data, error } = await supabase
        .from('igrejas')
        .select('*')
        .order('nome');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    // GRUPOS
    if (path === '/grupos' && method === 'GET') {
      const { igreja_id } = event.queryStringParameters || {};
      let query = supabase.from('grupos_assistencia').select('*').order('nome');
      
      if (igreja_id) query = query.eq('igreja_id', igreja_id);
      
      const { data, error } = await query;
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    // MEMBROS
    if (path === '/membros' && method === 'GET') {
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .order('nome');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    if (path === '/membros' && method === 'POST') {
      const membroData = JSON.parse(event.body);
      const { data, error } = await supabase
        .from('membros')
        .insert([membroData])
        .select();

      if (error) throw error;

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(data[0])
      };
    }

    // RESPOSTAS
    if (path === '/respostas' && method === 'GET') {
      const { data, error } = await supabase
        .from('respostas')
        .select(`
          *,
          membros(nome, classe, situacao, cpf)
        `)
        .order('data_resposta', { ascending: false });
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    // QUESTIONÁRIOS
    if (path === '/questionarios' && method === 'GET') {
      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    // PERGUNTAS
    if (path === '/perguntas' && method === 'GET') {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .order('numero');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    // ESTATÍSTICAS (adaptadas para seus dados)
    if (path === '/relatorios/estatisticas' && method === 'GET') {
      // Usar a view criada no SQL
      const { data: stats, error } = await supabase
        .from('estatisticas_detalhadas')
        .select('*')
        .single();

      if (error) {
        // Fallback para estatísticas básicas
        const membrosResult = await supabase.from('membros').select('*', { count: 'exact' });
        const respostasResult = await supabase.from('respostas').select('*', { count: 'exact' });
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            totalMembros: membrosResult.count || 0,
            respostasAvaliadas: respostasResult.count || 0,
            questionariosAtivos: 1,
            gruposAtivos: 1
          })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          totalMembros: stats.total_membros || 0,
          respostasAvaliadas: stats.total_respostas || 0,
          questionariosAtivos: 1,
          gruposAtivos: 1,
          adolescentes: stats.adolescentes || 0,
          varao: stats.varao || 0,
          senhoras: stats.senhoras || 0,
          membros: stats.membros || 0,
          visitantes: stats.visitantes || 0,
          mediaPontuacao: stats.media_pontuacao || 0
        })
      };
    }

    // RELATÓRIO DE RESPOSTAS
    if (path === '/relatorios/respostas' && method === 'GET') {
      const { data, error } = await supabase
        .from('relatorio_respostas')
        .select('*');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || [])
      };
    }

    // VALIDAR CPF
    if (path === '/validar-cpf' && method === 'POST') {
      const { cpf } = JSON.parse(event.body);
      const valido = validarCPF(cpf);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ cpf, valido })
      };
    }

    // SETUP
    if (path === '/setup' && method === 'POST') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Sistema configurado! Use /importar-planilha para carregar os dados.'
        })
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint não encontrado' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// ==========================================
// FUNÇÃO PARA IMPORTAR DADOS DA PLANILHA
// ==========================================
async function importarDadosPlanilha() {
  try {
    console.log('Iniciando importação dos dados da planilha...');
    
    // 1. Buscar igreja e grupo para associar os dados
    const { data: igreja } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', 'Igreja Nova Brasília 1')
      .single();

    const { data: grupo } = await supabase
      .from('grupos_assistencia')
      .select('id')
      .eq('nome', 'Grupo 2')
      .single();

    if (!igreja || !grupo) {
      throw new Error('Igreja ou grupo não encontrado. Execute o setup SQL primeiro.');
    }

    let membrosImportados = 0;
    let respostasImportadas = 0;
    const erros = [];

    // 2. Processar cada registro dos dados
    for (const registro of SEUS_DADOS) {
      try {
        // Inserir/atualizar membro
        const { data: membroExistente } = await supabase
          .from('membros')
          .select('id')
          .eq('cpf', registro.cpf)
          .single();

        let membroId;

        if (membroExistente) {
          // Atualizar membro existente
          const { data: membroAtualizado, error: errorUpdate } = await supabase
            .from('membros')
            .update({
              nome: registro.nome,
              classe: registro.classe,
              situacao: registro.situacao,
              igreja_id: igreja.id,
              grupo_id: grupo.id
            })
            .eq('id', membroExistente.id)
            .select();

          if (errorUpdate) throw errorUpdate;
          membroId = membroExistente.id;
        } else {
          // Criar novo membro
          const { data: novoMembro, error: errorInsert } = await supabase
            .from('membros')
            .insert([{
              nome: registro.nome,
              cpf: registro.cpf,
              classe: registro.classe,
              situacao: registro.situacao,
              igreja_id: igreja.id,
              grupo_id: grupo.id
            }])
            .select();

          if (errorInsert) throw errorInsert;
          membroId = novoMembro[0].id;
          membrosImportados++;
        }

        // Inserir resposta
        const { error: errorResposta } = await supabase
          .from('respostas')
          .insert([{
            membro_id: membroId,
            pergunta_numero: registro.pergunta,
            resposta_texto: registro.resposta,
            status_envio: registro.status,
            data_resposta: new Date().toISOString()
          }]);

        if (errorResposta) throw errorResposta;
        respostasImportadas++;

      } catch (error) {
        erros.push({
          nome: registro.nome,
          erro: error.message
        });
      }
    }

    // 3. Resultado da importação
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Importação concluída!',
        resultado: {
          membros_importados: membrosImportados,
          respostas_importadas: respostasImportadas,
          total_processados: SEUS_DADOS.length,
          erros: erros
        }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Erro na importação',
        details: error.message
      })
    };
  }
}

// Função de validação CPF
function validarCPF(cpf) {
  if (!cpf) return false;
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}
