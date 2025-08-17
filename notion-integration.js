/**
 * INTEGRAÇÃO NOTION COM TIKTOK FOLLOWERS API
 * 
 * INSTRUÇÕES DE USO:
 * 1. Crie uma integração no Notion (https://www.notion.so/my-integrations)
 * 2. Copie o token de integração
 * 3. Crie uma página/database no Notion com as colunas:
 *    - Username (Title)
 *    - Followers (Number)
 *    - Last Updated (Date)
 * 4. Compartilhe a página com sua integração
 * 5. Copie o ID da database
 * 6. Configure as variáveis abaixo
 * 7. Execute updateNotionFollowers()
 */

// CONFIGURAÇÕES - SUBSTITUA PELOS SEUS VALORES
const NOTION_TOKEN = 'secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const DATABASE_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const API_URL = 'https://your-app-name.railway.app';

/**
 * Função principal para atualizar seguidores no Notion
 */
async function updateNotionFollowers() {
  try {
    // Busca todas as páginas da database
    const pages = await getNotionPages();
    
    console.log(`Encontradas ${pages.length} páginas para atualizar`);
    
    for (const page of pages) {
      const username = getUsername(page);
      
      if (username) {
        console.log(`Atualizando: ${username}`);
        
        // Busca seguidores na API
        const followers = await getTikTokFollowers(username);
        
        if (followers !== null) {
          // Atualiza a página no Notion
          await updateNotionPage(page.id, followers);
          console.log(`${username}: ${followers} seguidores`);
        } else {
          console.log(`Erro ao buscar seguidores para: ${username}`);
        }
        
        // Delay para evitar rate limiting
        await sleep(2000);
      }
    }
    
    console.log('Atualização concluída!');
    
  } catch (error) {
    console.error('Erro na atualização:', error);
  }
}

/**
 * Busca todas as páginas da database do Notion
 */
async function getNotionPages() {
  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Erro na API do Notion: ${data.message}`);
  }
  
  return data.results;
}

/**
 * Extrai o username de uma página do Notion
 */
function getUsername(page) {
  try {
    // Assume que o título da página é o username
    const titleProperty = page.properties.Username || page.properties.Name || page.properties.Title;
    
    if (titleProperty && titleProperty.title && titleProperty.title[0]) {
      return titleProperty.title[0].plain_text;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair username:', error);
    return null;
  }
}

/**
 * Atualiza uma página específica no Notion
 */
async function updateNotionPage(pageId, followers) {
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        'Followers': {
          number: followers
        },
        'Last Updated': {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ao atualizar página: ${error.message}`);
  }
  
  return await response.json();
}

/**
 * Busca seguidores na API TikTok
 */
async function getTikTokFollowers(username) {
  try {
    // Remove @ se presente
    const cleanUsername = username.replace('@', '');
    
    const response = await fetch(`${API_URL}/api/tiktok/followers/${cleanUsername}`);
    const data = await response.json();
    
    if (response.ok && data.followers) {
      return data.followers;
    } else {
      console.error(`Erro na API: ${data.error || 'Resposta inválida'}`);
      return null;
    }
    
  } catch (error) {
    console.error(`Erro ao fazer requisição: ${error}`);
    return null;
  }
}

/**
 * Cria uma nova página na database com um username
 */
async function createNotionPage(username) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: {
        database_id: DATABASE_ID
      },
      properties: {
        'Username': {
          title: [
            {
              text: {
                content: username
              }
            }
          ]
        },
        'Followers': {
          number: 0
        },
        'Last Updated': {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ao criar página: ${error.message}`);
  }
  
  return await response.json();
}

/**
 * Testa a conexão com o Notion
 */
async function testNotionConnection() {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}`, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com Notion funcionando!');
      console.log(`Database: ${data.title[0]?.plain_text || 'Sem título'}`);
    } else {
      console.log('❌ Erro na conexão com Notion');
      const error = await response.json();
      console.error(error);
    }
  } catch (error) {
    console.error(`❌ Erro ao conectar: ${error}`);
  }
}

/**
 * Testa a conexão com a API TikTok
 */
async function testAPIConnection() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Conexão com API funcionando!');
      console.log(`Status: ${data.status}`);
    } else {
      console.log('❌ Erro na conexão com API');
    }
  } catch (error) {
    console.error(`❌ Erro ao conectar: ${error}`);
  }
}

/**
 * Função auxiliar para delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Adiciona múltiplos usernames de uma vez
 */
async function addMultipleUsers(usernames) {
  console.log(`Adicionando ${usernames.length} usuários...`);
  
  for (const username of usernames) {
    try {
      await createNotionPage(username);
      console.log(`✅ Adicionado: ${username}`);
      await sleep(1000); // Delay entre criações
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${username}:`, error);
    }
  }
  
  console.log('Usuários adicionados! Agora execute updateNotionFollowers()');
}

/**
 * EXEMPLO DE USO:
 * 
 * 1. Configure NOTION_TOKEN, DATABASE_ID e API_URL
 * 2. Teste as conexões:
 *    await testNotionConnection();
 *    await testAPIConnection();
 * 
 * 3. Adicione usuários:
 *    await addMultipleUsers(['samuelsmeurer', 'outro_user']);
 * 
 * 4. Atualize os seguidores:
 *    await updateNotionFollowers();
 * 
 * ESTRUTURA DA DATABASE NO NOTION:
 * - Username (Title) - Nome do usuário TikTok
 * - Followers (Number) - Número de seguidores
 * - Last Updated (Date) - Última atualização
 */

// Para uso no navegador ou Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateNotionFollowers,
    testNotionConnection,
    testAPIConnection,
    addMultipleUsers
  };
}