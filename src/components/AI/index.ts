/**
 * AI Components
 *
 * Main export point for AI-related React components
 *
 * Note: These components are for future Phase 15 (futuristic UI) integration
 * Phase 11 uses HTML output via context.logHtml for AI responses in terminal
 *
 * Current exports:
 * - ChatMessage: Individual chat message display
 * - DigitalFace: Interactive animated digital face for AI companion
 *
 * Future exports (Phase 15):
 * - ChatInterface: Full chat UI with input and history
 * - AIStatusIndicator: AI service status display
 * - PromptComposer: Advanced prompt composition UI
 */

export { ChatMessage } from "./ChatMessage";
export type { ChatMessageProps } from "./ChatMessage";

export { DigitalFace } from "./DigitalFace";
export type { DigitalFaceProps, FaceExpression } from "./DigitalFace";
