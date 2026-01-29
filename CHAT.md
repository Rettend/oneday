# Oneday Chat – Architecture Overview

## Goals

- **Personal everything-app chat**: First-class LLM chat experience inside Oneday, with great UX and model flexibility.
- **Cloudflare-native backend**: Stateful agents on Cloudflare using the **`agents` framework** (Workers + Durable Objects).
- **Turso-backed persistence**: Conversations and messages stored in Turso (LibSQL) for portability and easier management than D1.
- **Bring Your Own Keys (BYOK)**: Users supply their own provider API keys; Oneday orchestrates, but does not own billing.
- **Auth-first**: Gau-based login so multiple users (friends) can safely use the same backend.

## High-Level Flow

- **Client app (Oneday)**: SolidStart/Tauri UI with:
  - Chat page (messages, composer, streaming indicator).
  - Model picker driven by `llm.rettend.me` (via the `@rttnd/llm` client).
  - Per-user settings and BYOK key inputs on the profile/settings page.
- **Cloudflare entry Worker**:
  - Receives chat actions: create conversation, send message, start/stop run, list history.
  - Validates user identity via Gau session (token/cookies) and resolves `userId`.
  - Dispatches work to a Durable Object–backed Agent per conversation (using `agents` SDK).
- **Agent (Durable Object) responsibilities**:
  - **Framework**: Built with `agents` (Cloudflare's agent framework).
  - **State**: Maintains in-memory context for the active conversation.
  - **Execution**: Streams generations using the **Vercel AI SDK** (`ai` + `@ai-sdk/*`).
  - **Persistence**: Syncs messages to **Turso** as they generate/arrive. (The Agent may also use its internal SQLite for immediate state, but Turso is the source of truth for history/lists).
  - **Security**: Resolves user-specific provider keys from Turso (encrypted) on each call.
- **Persistence**:
  - **Turso (LibSQL)**: Users, accounts, api_keys, conversations, messages, runs.
  - **R2** (Optional/Later): Large attachments or transcripts.

## Models and Providers

- **LLM registry**:
  - Use the `llm.rettend.me` Worker via `@rttnd/llm` to fetch providers, models, and capabilities.
- **Model execution**:
  - Vercel AI SDK used on the Worker/Agent to hide provider differences.
  - Request config determined by the selected registry provider/model plus per-user settings.

## Auth and BYOK

- **Auth with Gau**:
  - Gau handles login; all chat operations require a valid session.
- **Bring Your Own Keys**:
  - Users enter keys in Settings; one api key per provider.
  - Stored encrypted in **Turso** (`api_keys` table).
  - Agents fetch the key via `userId` + `providerId` during execution.

## Chat UX and Navigation

- **Chat page**:
  - Conversation list (fetched from Turso).
  - Active conversation (connected to Agent via WebSocket or HTTP streaming).
  - Real-time streaming of responses.
- **Oneday-wide navigation**:
  - Switcher between “Oneday Chat” and “Oneday Quest”.

## Data Model (Conceptual)

- **Users**: Managed by Gau.
- **Conversations**: Stored in Turso. Owned by `userId`. Metadata: `title`, `created_at`, `model_id`.
- **Messages**: Stored in Turso. Linked to `conversation_id`. Role, content, timestamps.
- **Secrets**: `api_keys` table in Turso. Encrypted.

## Implementation Stack

- **Framework**: Cloudflare `agents`.
- **AI**: Vercel AI SDK (`ai`, `@ai-sdk/openai`, etc.).
- **DB**: Turso (via `@libsql/client` and Drizzle ORM).
- **Runtime**: Cloudflare Workers + Durable Objects.
