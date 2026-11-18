<div align="center">

# Alexa AI Arabic

**An Alexa skill backend that answers any question in Arabic, powered by an OpenAI model.**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-Responses_API-412991?logo=openai&logoColor=white)
![Alexa](https://img.shields.io/badge/Alexa-Custom_Skill-00CAFF?logo=amazonalexa&logoColor=white)

</div>

---

## About

A small Express server that acts as the HTTPS endpoint for a custom Alexa skill. When a user asks a question, the server sends it to the OpenAI Responses API with an Arabic system prompt, then returns the answer to Alexa as SSML in Arabic (`ar-SA`). Answers are short and suited to being spoken.

## ✨ Features

- **Arabic voice answers**: replies in simple Modern Standard Arabic, or light Gulf dialect where it fits, kept short for speech.
- **Handles short questions**: terse questions such as "القهوة وش" are understood as full ones.
- **Conversational session**: the skill stays open after each answer and prompts for the next question.
- **Built-in intents**: launch, help, stop and cancel are handled with Arabic responses.
- **Safe SSML**: model output is XML-escaped before it goes into the speech response.
- **Graceful errors**: if the AI call fails, the user hears a short Arabic error message instead of the skill crashing.

## 🧱 Tech stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 18+ (ES modules, built-in `fetch`) |
| Server | Express 4 |
| AI | OpenAI Responses API (default model `gpt-4.1-mini`) |
| Voice | Alexa Custom Skill (HTTPS endpoint) |
| Config | `dotenv` |

## 🚀 Getting started

### Prerequisites

- Node.js 18 or newer
- An OpenAI API key
- An Amazon Developer account to create the Alexa skill

### Install & run

```bash
git clone https://github.com/mw4z/alexa-ai-arabic.git
cd alexa-ai-arabic
npm install
npm start
```

The server listens on `PORT` (default `3000`). `GET /` returns a short health message.

### Environment variables

Create a `.env` file (it is gitignored):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | API key for the OpenAI Responses API (required) |
| `OPENAI_MODEL` | Model to use (defaults to `gpt-4.1-mini`) |
| `PORT` | HTTP port (defaults to `3000`) |

### Alexa skill setup

1. Create a **Custom** skill in the Alexa Developer Console.
2. In the JSON Editor, paste [`interaction-model-en-US.json`](interaction-model-en-US.json). It defines `AskAIIntent`, with an `AMAZON.SearchQuery` slot named `query`, and the standard built-in intents.
3. Under **Endpoint**, choose HTTPS and set it to `https://<your-host>/alexa`.
4. Build the model, then test with your invocation name followed by a phrase such as "ask …".

## 🔌 Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/alexa` | Alexa request handler (`LaunchRequest`, `IntentRequest`) |

## 📁 Project structure

| Path | Contents |
|------|----------|
| `server.js` | Express server, Alexa request handling, OpenAI call, SSML builder |
| `interaction-model-en-US.json` | Alexa interaction model (intents, slot, sample utterances) |
| `package.json` | Dependencies and `start` script |

## 🔒 Security notes

- The server checks that incoming requests have the basic Alexa request shape, but it does **not** verify Alexa request signatures or the skill ID. Add that before exposing it publicly.
- Keep `OPENAI_API_KEY` in your host's environment settings, never in the repo.

## ☁️ Deployment

Deploy to any Node host with HTTPS: a PaaS such as Render or Railway, or a VPS behind a reverse proxy. Set the environment variables there and point the skill endpoint at `/alexa`.

---

<div align="center"><sub>All rights reserved.</sub></div>
