// toolHandlers.ts
import pg from "pg";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface ToolHandlerArgs {
  [key: string]: any;
}



import { RedisClientType } from 'redis';

export class ToolHandlers {
  private redis?: RedisClientType;
  constructor(private pool: pg.Pool, redisClient?: RedisClientType) {
    this.redis = redisClient;
  }

  async handleQuery(args: ToolHandlerArgs): Promise<CallToolResult> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const sql = args.sql as string;

      // --- SQL Validation ---
      // Only allow SELECT queries
      const trimmed = sql.trim().toLowerCase();
      if (!trimmed.startsWith("select")) {
        return {
          content: [{ type: "text", text: "Error: Only SELECT statements are allowed." }],
          isError: true,
        };
      }
      // Block dangerous keywords
      const forbidden = [";", "drop ", "delete ", "update ", "insert ", "alter ", "create ", "grant ", "revoke ", "truncate ", "--", "/*", "*/"]; // basic
      for (const word of forbidden) {
        if (trimmed.includes(word)) {
          return {
            content: [{ type: "text", text: `Error: Query contains forbidden keyword: ${word}` }],
            isError: true,
          };
        }
      }
      // Optionally, limit result size
      let safeSql = sql;
      if (!/limit\s+\d+/i.test(sql)) {
        safeSql = sql.replace(/;*\s*$/g, "") + " LIMIT 100";
      }

      const result = await client.query(safeSql);
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    } finally {
      client.query("ROLLBACK").catch((error) =>
        console.warn("Could not roll back transaction:", error)
      );
      client.release();
    }
  }

  async handleGetPlayerRecentGames(args: ToolHandlerArgs): Promise<CallToolResult> {
    // Redis cache key based on player name and numGames
    const playerName = args.player_name as string;
    const numGames = (args.num_games as number) || 10;
    const cacheKey = `recentGames:${playerName.toLowerCase()}:${numGames}`;

    // Timing start
    const start = Date.now();

    // Try Redis cache first
    if (this.redis) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const elapsed = Date.now() - start;
          console.log(`[RedisCache] handleGetPlayerRecentGames: fromCache=true, ms=${elapsed}`);
          return {
            content: [{ type: "text", text: cached }],
            fromCache: true,
            ms: elapsed,
          };
        }
      } catch (err) {
        console.warn("Redis get error:", err);
      }
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const sql = `
        SELECT 
          b.game_date,
          b.matchup,
          p.position as "POS",
          b.wl,
          b.min,
          b.pts,
          b.reb,
          b.ast,
          b.stl,
          b.blk,
          b.fgm,
          b.fga,
          b.fg_pct as "FG%",
          b.fg3m as "3PM",
          b.fg3a as "3PA",
          b.fg3_pct as "3P%",
          b.ftm as "FTM",
          b.fta as "FTA",
          b.ft_pct as "FT%",
          b.tov as "TOV",
          b.pf as "PF",
          b.plus_minus as "+/-"
        FROM players p
        JOIN boxscores b ON p.person_id = b.player_id
        WHERE UNACCENT(p.display_first_last) ILIKE UNACCENT($1)
        ORDER BY b.game_date DESC
        LIMIT $2
      `;
      const result = await client.query(sql, [`%${playerName}%`, numGames]);
      const resultText = JSON.stringify(result.rows, null, 2);

      // Set Redis cache (expire in 5 min)
      if (this.redis) {
        try {
          await this.redis.set(cacheKey, resultText, { EX: 300 });
        } catch (err) {
          console.warn("Redis set error:", err);
        }
      }

      const elapsed = Date.now() - start;
      console.log(`[RedisCache] handleGetPlayerRecentGames: fromCache=false, ms=${elapsed}`);
      return {
        content: [{ type: "text", text: resultText }],
        fromCache: false,
        ms: elapsed,
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    } finally {
      client.query("ROLLBACK").catch((error) =>
        console.warn("Could not roll back transaction:", error)
      );
      client.release();
    }
  }

  async handleGetPlayerSeasonStats(args: ToolHandlerArgs): Promise<CallToolResult> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const playerName = args.player_name as string;
      
      const sql = `
        SELECT 
          p.display_first_last as player_name,
          COUNT(*) as games_played,
          ROUND(AVG(b.pts::numeric), 1) as avg_points,
          ROUND(AVG(b.reb::numeric), 1) as avg_rebounds,
          ROUND(AVG(b.ast::numeric), 1) as avg_assists,
          ROUND(AVG(b.stl::numeric), 1) as avg_steals,
          ROUND(AVG(b.blk::numeric), 1) as avg_blocks,
          ROUND(AVG(b.min::numeric), 1) as avg_minutes,
          ROUND(SUM(b.fgm::numeric) / NULLIF(SUM(b.fga), 0), 3) AS avg_fg_pct,
          ROUND(SUM(b.fg3m::numeric) / NULLIF(SUM(b.fg3a), 0), 3) AS avg_3p_pct,
          ROUND(SUM(b.ftm::numeric) / NULLIF(SUM(b.fta), 0), 3) AS avg_ft_pct,
          SUM(CASE WHEN b.wl = 'W' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN b.wl = 'L' THEN 1 ELSE 0 END) as losses
        FROM players p 
        JOIN boxscores b ON p.person_id = b.player_id
        WHERE UNACCENT(p.display_first_last) ILIKE UNACCENT($1)
        GROUP BY p.display_first_last
      `;
      
      const result = await client.query(sql, [`%${playerName}%`]);
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    } finally {
      client.query("ROLLBACK").catch((error) =>
        console.warn("Could not roll back transaction:", error)
      );
      client.release();
    }
  }

  async handleGetTeamRoster(args: ToolHandlerArgs): Promise<CallToolResult> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const teamName = args.team_name as string;

      const sql = `
        SELECT 
          p.display_first_last as player_name,
          COUNT(*) as games_played,
          ROUND(AVG(b.pts::numeric), 1) as avg_points,
          ROUND(AVG(b.reb::numeric), 1) as avg_rebounds,
          ROUND(AVG(b.ast::numeric), 1) as avg_assists,
          ROUND(AVG(b.stl::numeric), 1) as avg_steals,
          ROUND(AVG(b.blk::numeric), 1) as avg_blocks,
          ROUND(AVG(b.min::numeric), 1) as avg_minutes,
          ROUND(SUM(b.fgm::numeric) / NULLIF(SUM(b.fga), 0), 3) AS avg_fg_pct,
          ROUND(SUM(b.fg3m::numeric) / NULLIF(SUM(b.fg3a), 0), 3) AS avg_3p_pct,
          ROUND(SUM(b.ftm::numeric) / NULLIF(SUM(b.fta), 0), 3) AS avg_ft_pct
        FROM players p 
        JOIN teams t ON p.team_id = t.id
        JOIN boxscores b ON p.person_id = b.player_id
        WHERE UNACCENT(t.full_name) ILIKE UNACCENT($1) OR UNACCENT(t.abbreviation) ILIKE UNACCENT($1)
        GROUP BY p.display_first_last
        ORDER BY p.display_first_last
      `;

      const result = await client.query(sql, [`%${teamName}%`]);
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    } finally {
      client.query("ROLLBACK").catch((error) =>
        console.warn("Could not roll back transaction:", error)
      );
      client.release();
    }
  }

  async handleGetLeadingStats(args: ToolHandlerArgs): Promise<CallToolResult> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const stat_cat = args.stat_cat as string;

      // Map stat_cat to the correct column name
      const statMap: Record<string, string> = {
        points: "AVG(b.pts::numeric)",
        rebounds: "AVG(b.reb::numeric)",
        assists: "AVG(b.ast::numeric)",
        steals: "AVG(b.stl::numeric)",
        blocks: "AVG(b.blk::numeric)",
        minutes: "AVG(b.min::numeric)",
        fg_pct: "SUM(b.fgm::numeric) / NULLIF(SUM(b.fga), 0)",
        three_pct: "SUM(b.fg3m::numeric) / NULLIF(SUM(b.fg3a), 0)",
        ft_pct: "SUM(b.ftm::numeric) / NULLIF(SUM(b.fta), 0)",
      };

      // Default to points if not found
      const statColumn = statMap[stat_cat.toLowerCase()] || "AVG(b.pts::numeric)";

      const sql = `
        SELECT 
          p.display_first_last as player_name,
          COUNT(*) as games_played,
          ROUND(AVG(b.pts::numeric), 1) as avg_points,
          ROUND(AVG(b.reb::numeric), 1) as avg_rebounds,
          ROUND(AVG(b.ast::numeric), 1) as avg_assists,
          ROUND(AVG(b.stl::numeric), 1) as avg_steals,
          ROUND(AVG(b.blk::numeric), 1) as avg_blocks,
          ROUND(AVG(b.min::numeric), 1) as avg_minutes,
          ROUND(SUM(b.fgm::numeric) / NULLIF(SUM(b.fga), 0), 3) AS avg_fg_pct,
          ROUND(SUM(b.fg3m::numeric) / NULLIF(SUM(b.fg3a), 0), 3) AS avg_3p_pct,
          ROUND(SUM(b.ftm::numeric) / NULLIF(SUM(b.fta), 0), 3) AS avg_ft_pct
        FROM players p 
        JOIN teams t ON p.team_id = t.id
        JOIN boxscores b ON p.person_id = b.player_id
        GROUP BY p.display_first_last
        ORDER BY ${statColumn} DESC
        LIMIT 10
      `;

      const result = await client.query(sql);
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
      };
    
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    } finally {
      client.query("ROLLBACK").catch((error) =>
        console.warn("Could not roll back transaction:", error)
      );
      client.release();
    }
  }
}


