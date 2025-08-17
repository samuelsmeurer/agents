const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getTikTokFollowers(username) {
  try {
    const cleanUsername = username.replace('@', '');
    const url = `https://www.tiktok.com/@${cleanUsername}`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };

    const response = await axios.get(url, { 
      headers,
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    if (response.status === 404) {
      return { error: 'Usuário não encontrado', status: 404 };
    }

    const $ = cheerio.load(response.data);
    
    let followers = null;
    const scriptTags = $('script');
    
    scriptTags.each((i, script) => {
      const content = $(script).html();
      if (content && content.includes('followers')) {
        const match = content.match(/"followerCount":(\d+)/);
        if (match) {
          followers = parseInt(match[1]);
          return false;
        }
      }
    });

    if (followers === null) {
      const metaContent = $('meta[property="og:description"]').attr('content');
      if (metaContent) {
        const followerMatch = metaContent.match(/(\d+(?:\.\d+)?[KMB]?)\s*Followers/i);
        if (followerMatch) {
          let count = followerMatch[1];
          if (count.includes('K')) {
            followers = Math.round(parseFloat(count) * 1000);
          } else if (count.includes('M')) {
            followers = Math.round(parseFloat(count) * 1000000);
          } else if (count.includes('B')) {
            followers = Math.round(parseFloat(count) * 1000000000);
          } else {
            followers = parseInt(count);
          }
        }
      }
    }

    if (followers === null) {
      return { error: 'Não foi possível extrair número de seguidores', status: 500 };
    }

    return { 
      username: `@${cleanUsername}`, 
      followers: followers,
      status: 200 
    };

  } catch (error) {
    console.error('Erro ao buscar seguidores:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return { error: 'Erro de conexão com TikTok', status: 503 };
    }
    
    return { error: 'Erro interno do servidor', status: 500 };
  }
}

app.get('/api/tiktok/followers/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({ 
      error: 'Username é obrigatório',
      example: '/api/tiktok/followers/samuelsmeurer'
    });
  }

  await delay(1000);
  
  const result = await getTikTokFollowers(username);
  
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'TikTok Followers API',
    endpoints: {
      followers: '/api/tiktok/followers/:username',
      health: '/health'
    },
    example: '/api/tiktok/followers/samuelsmeurer'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

app.use((error, req, res, next) => {
  console.error('Erro interno:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Teste: http://localhost:${PORT}/api/tiktok/followers/samuelsmeurer`);
});

module.exports = app;