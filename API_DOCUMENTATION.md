# TikTok Followers API

API para buscar o número de seguidores de contas do TikTok usando web scraping.

## Instalação

```bash
npm install
```

## Uso

### Iniciar o servidor
```bash
npm start
```

### Desenvolvimento (com auto-reload)
```bash
npm run dev
```

## Endpoints

### GET /api/tiktok/followers/:username

Busca o número de seguidores de uma conta do TikTok.

**Parâmetros:**
- `username`: Nome de usuário do TikTok (com ou sem @)

**Exemplo de requisição:**
```bash
curl http://localhost:3000/api/tiktok/followers/samuelsmeurer
```

**Exemplo de resposta:**
```json
{
  "username": "@samuelsmeurer",
  "followers": 99,
  "status": 200
}
```

### GET /health

Verifica se a API está funcionando.

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-17T01:26:02.343Z"
}
```

## Tratamento de Erros

### 400 - Bad Request
```json
{
  "error": "Username é obrigatório",
  "example": "/api/tiktok/followers/samuelsmeurer"
}
```

### 404 - Usuário não encontrado
```json
{
  "error": "Usuário não encontrado"
}
```

### 503 - Erro de conexão
```json
{
  "error": "Erro de conexão com TikTok"
}
```

### 500 - Erro interno
```json
{
  "error": "Não foi possível extrair número de seguidores"
}
```

## Funcionalidades

- ✅ Busca seguidores por username do TikTok
- ✅ Suporte a números com formatação (K, M, B)
- ✅ Rate limiting básico (delay de 1s entre requisições)
- ✅ Headers de User-Agent para evitar bloqueios
- ✅ Tratamento robusto de erros
- ✅ Validação de entrada
- ✅ CORS habilitado
- ✅ Segurança com Helmet

## Limitações

- Depende de web scraping, podendo quebrar se o TikTok mudar a estrutura
- Rate limiting básico - não recomendado para uso intensivo
- Não funciona para contas privadas que requerem login

## Teste Validado

A API foi testada com sucesso usando a conta `@samuelsmeurer` que possui 99 seguidores (próximo aos 98 mencionados como referência).