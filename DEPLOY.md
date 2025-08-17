# TikTok Followers API - Deploy Guide

## Deploy Rápido no Railway

1. **Acesse:** [railway.app](https://railway.app)
2. **Conecte sua conta GitHub**
3. **Clique em "Deploy from GitHub repo"**
4. **Selecione este repositório**
5. **Railway detectará automaticamente Node.js e fará o deploy**

Sua API estará disponível em: `https://your-app-name.railway.app`

## Testando a API

```bash
curl https://your-app-name.railway.app/api/tiktok/followers/samuelsmeurer
```

## Endpoint Principal

`GET /api/tiktok/followers/:username`

**Resposta:**
```json
{
  "username": "@samuelsmeurer",
  "followers": 99,
  "status": 200
}
```

## Integração Google Sheets

Copie o código em `google-sheets-integration.js` para o Google Apps Script e configure conforme as instruções.