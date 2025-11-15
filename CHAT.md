# Oneday Chat – Architecture Overview

## Goals

- **Personal everything-app chat**: First-class LLM chat experience inside Oneday, with great UX and model flexibility.
- **Cloudflare-native backend**: Stateful agents on Cloudflare (Workers + Agents + Durable Objects) with D1 as the primary chat store.
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
  - Dispatches work to a Durable Object–backed Agent per conversation (or per user+conversation).
- **Agent (Durable Object) responsibilities**:
  - Maintain in-memory state for the active conversation while running.
  - Stream generations from the chosen model using the Vercel AI SDK.
  - Persist conversation metadata and messages to D1 as it goes, including partial and final assistant messages.
  - Respect user-specific provider configuration and secrets (BYOK) when calling upstream APIs.
- **Persistence**:
  - **D1**: Conversations, messages, runs/status, minimal per-user model preferences, and encrypted BYOK references.
  - **Optional R2** (later): Large attachments or transcripts when needed.

## Models and Providers

- **LLM registry**:
  - Use the `llm.rettend.me` Worker via `@rttnd/llm` to fetch providers, models, and capabilities.
  - Prefer text/chat-capable models and optionally filter by IQ/speed.
  - Optionally cache or proxy the manifest through the Cloudflare Worker for control and performance.
- **Model execution**:
  - Vercel AI SDK used on the Worker/Agent to hide provider differences.
  - Request config determined by the selected registry provider/model plus per-user settings (temperature, max tokens, etc.).

## Auth and BYOK

- **Auth with Gau**:
  - Gau handles login (GitHub, Google, Discord, etc.) and issues a session used both in the SolidStart app and in Cloudflare Workers.
  - All chat operations require a valid session; anonymous users see only the login page.
- **Bring Your Own Keys**:
  - Users can enter provider API keys on a profile/settings page per provider.
  - Keys are never shown again after saving; users can only reset or delete.
  - Keys are stored in a secure backend store (D1 or a dedicated secrets table), encrypted at rest and scoped to `userId + provider`.
  - Agents resolve the appropriate key for the current user and provider on each call, never exposing them to the client.

## Chat UX and Navigation

- **Chat page**:
  - Conversation list/history on the side, active conversation in the main panel, inline model selector, and run status.
  - Messages stream in real time as the Agent writes to D1; the client periodically pulls or subscribes for updates.
- **Oneday-wide navigation**:
  - App-level switcher between “Oneday Chat” and “Oneday Quest” (activity/quests app).
  - Each mode can have its own sidebar layout (chat: conversations/settings; quest: today/questboard/achievements/etc.) while sharing a common shell.

## Data Model (Conceptual)

- **Users**: Managed by Gau; identified by a stable `userId` used everywhere.
- **Conversations**: Owned by a user, with metadata such as title, created/updated timestamps, active model, and settings.
- **Messages**: Ordered sequence within a conversation, with role (system/user/assistant), content, and timestamps; assistant messages may have streaming states.
- **Runs**: Optional explicit run entity representing a single model invocation, including status (queued, running, completed, failed), timings, and token counts.
- **Secrets**: Provider API keys stored encrypted and referenced by `userId` and provider slug, never returned to clients after initial submission.

## Open Questions and Design Choices

- **Streaming transport**:
  - Should the client subscribe via WebSockets, use HTTP event streams, or poll for message updates from D1?
  - How important is ultra-low latency vs. simplicity and reliability in the Tauri context?
- **Agent granularity**:
  - One Agent per conversation vs. one Agent per user with multiple conversations.
  - How to balance isolation, concurrency, and memory usage across many small conversations.
- **Persistence strategy for partial outputs**:
  - Append every token/chunk to D1 vs. batching updates at intervals.
  - How to represent partial messages in the schema so they are resumable and inspectable.
- **BYOK storage details**:
  - Exact encryption strategy and key management for API keys stored in D1.
  - Whether to keep any minimal per-device hints in local storage (for UX) while ensuring secrets never leave the backend.
- **Model registry integration surface**:
  - Should the frontend talk to `llm.rettend.me` directly, or should the Cloudflare Worker proxy and filter models (e.g., hide providers not supported in the current deployment)?
  - How to represent per-user “favorite models” or defaults without tightly coupling to specific provider IDs.
- **Multi-device and sharing features**:
  - Do we want shared conversations or “link sharing” between users in the future?
  - How should permissions and visibility work if Oneday grows beyond a personal-only tool?
