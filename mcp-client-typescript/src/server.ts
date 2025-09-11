import { Anthropic } from "@anthropic-ai/sdk";
import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";

import express, { NextFunction } from "express";
import { Router, Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import { apiLimiter } from './middleware/rateLimiter.js';
import pg from "pg";
import { tools } from "./tools.js";
import { ToolHandlers } from "./toolHandler.js";
import { createRoutes } from "./routes.js";
import { redisClient, connectRedis } from "./lib/redisClient.js";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

class ConcurrentServer {
  private anthropic: Anthropic;
  private expressApp!: express.Application;
  private dbPool: pg.Pool;
  private toolHandlers: ToolHandlers;
  private tools: Tool[] = [];
  
  // Optional: Track active requests for monitoring
  private activeQueries = new Map<string, { startTime: Date; query: string }>();

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Database pool handles concurrent connections automatically
    const dbUrl =
      process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL_LOCAL;

    if (!dbUrl) {
      throw new Error("Database URL is not defined");
    }

    this.dbPool = new pg.Pool({
      connectionString: dbUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

  this.toolHandlers = new ToolHandlers(this.dbPool, redisClient as any);

    this.tools = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));

    this.initializeExpressApp();
    console.log("✅ Concurrent server initialized");
  }

  private initializeExpressApp() {
    this.expressApp = express();

    // Trust the first proxy (nginx, docker, etc.)
    this.expressApp.set('trust proxy', 1);

    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? ["https://joeltai.com","http://localhost:5173", "http://localhost:3000"] // <-- set your prod domain here
        : ["http://localhost:5173", "http://localhost:3000"];

    this.expressApp.use(
      cors({
        origin: allowedOrigins,
      })
    );
    
    this.expressApp.use(express.json());
    this.expressApp.use('/api', (req, res, next) => {
      if (req.method === 'OPTIONS') return next();
      apiLimiter(req, res, next);
    });

    this.setupRoutes();
  }

  private setupRoutes() {
    // Create routes with dependencies
    const routes = createRoutes({
      anthropic: this.anthropic,
      dbPool: this.dbPool,
      toolHandlers: this.toolHandlers,
      tools: this.tools,
      activeQueries: this.activeQueries
    });

    // Mount the routes under /api
    this.expressApp.use('/api', routes);
  }

  // Processing with progress callbacks for streaming (kept in server for now)
  async processQueryWithProgress(
    query: string, 
    requestId: string, 
    onProgress: (progress: any) => void
  ) {
    const messages: MessageParam[] = [
      { role: "user", content: query }
    ];
    
    onProgress({ message: 'Calling Claude API...', step: 1, totalSteps: 3 });
    
    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: this.tools,
    });

    onProgress({ message: 'Processing tool calls...', step: 2, totalSteps: 3 });

    const claudeInterpretation = response.content
      .filter(content => content.type === "text")
      .map(content => content.text)
      .join("\n");

    const toolPromises = response.content
      .filter(content => content.type === "tool_use")
      .map(async (content, index) => {
        onProgress({ 
          message: `Executing tool: ${content.name}`, 
          step: 2, 
          totalSteps: 3,
          toolIndex: index + 1,
          totalTools: response.content.filter(c => c.type === "tool_use").length
        });
        
        const result = await this.callTool(content.name, content.input, requestId);
        return {
          toolName: content.name,
          toolArgs: content.input,
          result
        };
      });

    const toolResults = await Promise.all(toolPromises);
    
    onProgress({ message: 'Finalizing response...', step: 3, totalSteps: 3 });

    return {
      interpretation: claudeInterpretation,
      toolResults,
      rawResponse: response
    };
  }

  // Helper method for tool calling (moved to private, now used by processQueryWithProgress)
  private async callTool(name: string, args: any, requestId?: string) {
    const logPrefix = requestId ? `[${requestId}]` : '';
    console.log(`${logPrefix} Calling tool: ${name}`);
    
    switch (name) {
      case "query":
        return await this.toolHandlers.handleQuery(args || {});
      case "get_player_recent_games":
        return await this.toolHandlers.handleGetPlayerRecentGames(args || {});
      case "get_player_season_stats":
        return await this.toolHandlers.handleGetPlayerSeasonStats(args || {});
      case "get_team_roster":
        return await this.toolHandlers.handleGetTeamRoster(args || {});
      case "get_leading_stats":
        return await this.toolHandlers.handleGetLeadingStats(args || {});
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async start(port: number = 4000) {
    this.expressApp.listen(port, () => {
      console.log(`✅ Concurrent server running on http://localhost:${port}`);
      console.log(`📊 Status endpoint: http://localhost:${port}/api/status`);
      console.log(`🔄 Stream endpoint: http://localhost:${port}/api/query-stream`);
    });
  }

  async cleanup() {
    console.log('🛑 Shutting down server...');
    await this.dbPool.end();
    console.log('✅ Cleanup completed');
  }
}

// Start the server
async function main() {
  try {
    await connectRedis();
    console.log("✅ Connected to Redis");
  } catch (err) {
    console.error("❌ Redis connection error:", err);
    process.exit(1);
  }

  const server = new ConcurrentServer();
  const PORT = parseInt(process.env.PORT || '4000');

  try {
    await server.start(PORT);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }

  process.on("SIGINT", async () => {
    await server.cleanup();
    process.exit(0);
  });
}

main();