import { Router, Request, Response } from 'express';
import { Anthropic } from "@anthropic-ai/sdk";
import { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import pg from "pg";
import { ToolHandlers } from "./toolHandler.js";

interface RoutesDependencies {
  anthropic: Anthropic;
  dbPool: pg.Pool;
  toolHandlers: ToolHandlers;
  tools: Tool[];
  activeQueries: Map<string, { startTime: Date; query: string }>;
}

export function createRoutes(deps: RoutesDependencies) {
  const router = Router();
  const { anthropic, dbPool, toolHandlers, tools, activeQueries } = deps;

  // Helper function to call tools
  const callTool = async (name: string, args: any, requestId?: string) => {
    const logPrefix = requestId ? `[${requestId}]` : '';
    console.log(`${logPrefix} Calling tool: ${name}`);
    
    switch (name) {
      case "query":
        return await toolHandlers.handleQuery(args || {});
      case "get_player_recent_games":
        return await toolHandlers.handleGetPlayerRecentGames(args || {});
      case "get_player_season_stats":
        return await toolHandlers.handleGetPlayerSeasonStats(args || {});
      case "get_team_roster":
        return await toolHandlers.handleGetTeamRoster(args || {});
      case "get_leading_stats":
        return await toolHandlers.handleGetLeadingStats(args || {});
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  };

  // Helper function to process queries
  const processQuery = async (query: string, requestId?: string) => {
    const logPrefix = requestId ? `[${requestId}]` : '';
    const messages: MessageParam[] = [
      { role: "user", content: query }
    ];
    
    console.log(`${logPrefix} Calling Claude API...`);
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: tools,
    });

    console.log(`${logPrefix} Claude API response received`);

    const claudeInterpretation = response.content
      .filter(content => content.type === "text")
      .map(content => content.text)
      .join("\n");

    const toolResults = [];

    // Process tool calls concurrently
    const toolPromises = response.content
      .filter(content => content.type === "tool_use")
      .map(async (content) => {
        const result = await callTool(content.name, content.input, requestId);
        return {
          toolName: content.name,
          toolArgs: content.input,
          result
        };
      });

    const completedToolResults = await Promise.all(toolPromises);
    toolResults.push(...completedToolResults);

    console.log(`${logPrefix} Query processing completed`);

    return {
      interpretation: claudeInterpretation,
      toolResults,
      rawResponse: response
    };
  };

  // Helper function for testing tools
  const testTools = async (suffix: string = '') => {
    const result = await callTool("get_player_recent_games", { 
      player_name: "LeBron James" 
    }, `test-${suffix}`);
    return result;
  };

  // Route definitions
  router.get('/hello', (req, res) => {
    res.json({ message: 'Hello from Concurrent Server!' });
  });

  router.post("/query", async (req: Request, res: Response) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const { content } = req.body;
      console.log(`[${requestId}] Received query:`, content);
      
      // Track active query
      activeQueries.set(requestId, { startTime: new Date(), query: content });
      
      const result = await processQuery(content, requestId);
      
      // Remove from active queries
      activeQueries.delete(requestId);
      
      res.json({
        success: true, 
        message: "Query processed successfully", 
        requestId,
        data: {
          interpretation: result.interpretation,
          toolResults: result.toolResults,
        }
      });
    } catch (error) {
      activeQueries.delete(requestId);
      console.error(`[${requestId}] Error processing query:`, error);
      res.status(500).json({
        success: false,
        message: "Error processing query",
        requestId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  router.get("/status", (req, res) => {
    const activeCount = activeQueries.size;
    const queries = Array.from(activeQueries.entries()).map(([id, info]) => ({
      requestId: id,
      startTime: info.startTime,
      duration: Date.now() - info.startTime.getTime(),
      query: info.query.substring(0, 100) + (info.query.length > 100 ? '...' : '')
    }));

    res.json({
      success: true,
      activeQueries: activeCount,
      queries: queries,
      dbPoolStatus: {
        totalCount: dbPool.totalCount,
        idleCount: dbPool.idleCount,
        waitingCount: dbPool.waitingCount,
      }
    });
  });

  router.get("/test-concurrent", async (req, res) => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(testTools(`test-${i}`));
    }
    
    const results = await Promise.all(promises);
    res.json({
      success: true,
      message: "5 concurrent test queries completed",
      results
    });
  });

  router.post("/post", async (req: Request, res: Response) => {
    const { title, content, userId } = req.body;
    const newPost = {
      id: Math.floor(Math.random() * 1000),
      title,
      content,
      userId,
    };
    res.status(201).json({
      success: true,
      data: newPost,
      message: `User ${newPost.id} Post created successfully!`,
    });
  });

  return router;
}