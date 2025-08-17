/**
 * INTEGRAÇÃO GOOGLE SHEETS COM TIKTOK FOLLOWERS API
 * 
 * INSTRUÇÕES DE USO:
 * 1. Abra Google Sheets
 * 2. Vá em Extensões > Apps Script
 * 3. Cole este código
 * 4. Substitua 'YOUR_API_URL' pela URL da sua API no Railway
 * 5. Execute a função updateTikTokFollowers()
 * 
 * FORMATO DA PLANILHA:
 * Coluna A: Usernames do TikTok (ex: @samuelsmeurer)
 * Coluna B: Número de seguidores (será preenchido automaticamente)
 */

// SUBSTITUA PELA URL DA SUA API NO RAILWAY
const API_URL = 'https://your-app-name.railway.app';

/**
 * Função principal para atualizar seguidores do TikTok
 * Execute esta função para atualizar todos os dados
 */
function updateTikTokFollowers() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Encontra a última linha com dados na coluna A
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    Logger.log('Nenhum username encontrado. Adicione usernames na coluna A.');
    return;
  }
  
  // Processa cada linha com username
  for (let row = 2; row <= lastRow; row++) {
    const username = sheet.getRange(row, 1).getValue();
    
    if (username && username.toString().trim() !== '') {
      try {
        const followers = getTikTokFollowers(username);
        
        if (followers !== null) {
          // Atualiza a coluna B com o número de seguidores
          sheet.getRange(row, 2).setValue(followers);
          Logger.log(`${username}: ${followers} seguidores`);
        } else {
          sheet.getRange(row, 2).setValue('Erro');
          Logger.log(`Erro ao buscar seguidores para: ${username}`);
        }
        
        // Delay para evitar rate limiting
        Utilities.sleep(2000);
        
      } catch (error) {
        Logger.log(`Erro na linha ${row}: ${error}`);
        sheet.getRange(row, 2).setValue('Erro');
      }
    }
  }
  
  Logger.log('Atualização concluída!');
}

/**
 * Busca o número de seguidores de um usuário específico
 */
function getTikTokFollowers(username) {
  try {
    // Remove @ se presente
    const cleanUsername = username.toString().replace('@', '');
    
    // Faz a requisição para a API
    const response = UrlFetchApp.fetch(`${API_URL}/api/tiktok/followers/${cleanUsername}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200 && data.followers) {
      return data.followers;
    } else {
      Logger.log(`Erro na API: ${data.error || 'Resposta inválida'}`);
      return null;
    }
    
  } catch (error) {
    Logger.log(`Erro ao fazer requisição: ${error}`);
    return null;
  }
}

/**
 * Função para atualizar um usuário específico
 * Útil para testar ou atualizar apenas uma linha
 */
function updateSingleUser() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const activeCell = sheet.getActiveCell();
  const row = activeCell.getRow();
  
  if (row < 2) {
    Logger.log('Selecione uma célula com username (linha 2 ou inferior)');
    return;
  }
  
  const username = sheet.getRange(row, 1).getValue();
  
  if (username && username.toString().trim() !== '') {
    const followers = getTikTokFollowers(username);
    
    if (followers !== null) {
      sheet.getRange(row, 2).setValue(followers);
      Logger.log(`${username}: ${followers} seguidores`);
    } else {
      sheet.getRange(row, 2).setValue('Erro');
      Logger.log(`Erro ao buscar seguidores para: ${username}`);
    }
  } else {
    Logger.log('Nenhum username encontrado na linha selecionada');
  }
}

/**
 * Função para configurar cabeçalhos da planilha
 * Execute uma vez para configurar os títulos das colunas
 */
function setupHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Define os cabeçalhos
  sheet.getRange(1, 1).setValue('Username TikTok');
  sheet.getRange(1, 2).setValue('Seguidores');
  
  // Formata os cabeçalhos
  const headerRange = sheet.getRange(1, 1, 1, 2);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  Logger.log('Cabeçalhos configurados com sucesso!');
}

/**
 * Função para criar um gatilho automático (opcional)
 * Execute para atualizar automaticamente a cada hora
 */
function createHourlyTrigger() {
  ScriptApp.newTrigger('updateTikTokFollowers')
    .timeBased()
    .everyHours(1)
    .create();
    
  Logger.log('Gatilho automático criado - atualizará a cada hora');
}

/**
 * Função para testar a conexão com a API
 */
function testConnection() {
  try {
    const response = UrlFetchApp.fetch(`${API_URL}/health`);
    const data = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      Logger.log('✅ Conexão com API funcionando!');
      Logger.log(`Status: ${data.status}`);
      Logger.log(`Timestamp: ${data.timestamp}`);
    } else {
      Logger.log('❌ Erro na conexão com API');
    }
  } catch (error) {
    Logger.log(`❌ Erro ao conectar: ${error}`);
    Logger.log('Verifique se a URL da API está correta');
  }
}

/**
 * EXEMPLO DE USO:
 * 
 * 1. Configure os cabeçalhos: setupHeaders()
 * 2. Adicione usernames na coluna A (ex: samuelsmeurer)
 * 3. Execute: updateTikTokFollowers()
 * 4. Os seguidores aparecerão na coluna B
 * 
 * DICAS:
 * - Use usernames sem @ (o script remove automaticamente)
 * - Para atualização automática, execute: createHourlyTrigger()
 * - Para testar a API, execute: testConnection()
 */