import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Schema context for AI agents
export const NBA_SCHEMA_CONTEXT = `
NBA DATABASE SCHEMA:

TABLES:
• players: Player information
  - person_id (PRIMARY KEY): Unique player identifier (e.g., "201142" for Durant)
  - display_first_last: Full name format "Kevin Durant"
  - display_last_comma_first: Name format "Durant, Kevin"
  - team_id: Current team ID
  - from_year, to_year: Career span

• boxscores: Individual player game statistics
  - player_id: Links to players.person_id
  - game_id: Unique game identifier
  - game_date: Format "Oct 31, 2024"
  - matchup: Format "PHX vs. LAL" or "PHX @ LAL"
  - wl: Win/Loss ("W" or "L")
  - min: Minutes played
  - pts: Points scored
  - reb: Total rebounds
  - ast: Assists
  - stl: Steals
  - blk: Blocks
  - tov: Turnovers
  - fgm/fga: Field goals made/attempted
  - fg_pct: Field goal percentage
  - fg3m/fg3a: 3-pointers made/attempted
  - fg3_pct: 3-point percentage
  - ftm/fta: Free throws made/attempted
  - ft_pct: Free throw percentage
  - plus_minus: Plus/minus rating

• teams: Team information
  - id (PRIMARY KEY): Unique team identifier
  - full_name: Full team name
  - abbreviation: 3-letter team code

• schedule: Game schedule information
  - game_id: Unique game identifier
  - game_date: Game date
  - home_team_id, visitor_team_id: Team IDs

• game_logs: Team-level game statistics (NOT individual players)
  - team_id: Team identifier
  - game_id: Game identifier
  - All team aggregate stats

• team_rosters: Player-team relationships
  - teamid: Team identifier
  - season: Season year (e.g., "2024")
  - player_id: Player identifier (links to players.person_id)
  - Links players to teams

COMMON QUERY PATTERNS:
1. Player recent games: JOIN players ON person_id = boxscores.player_id
2. Player search: Use "display_first_last ILIKE '%name%'" for flexible matching
3. Recent data: Always "ORDER BY game_date DESC"
4. Team stats: Use game_logs table, NOT boxscores
5. Individual stats: Use boxscores table

EXAMPLES:
• Get Durant's last 10: SELECT * FROM boxscores WHERE player_id = (SELECT person_id FROM players WHERE display_first_last ILIKE '%Durant%') ORDER BY game_date DESC LIMIT 10
• Get team roster: SELECT p.* FROM players p JOIN team_rosters tr ON p.person_id = tr.player_id WHERE tr.team_id = ?
`;

export const tools: Tool[] = [
  {
    name: "query",
    description: `Run a read-only SQL query on the NBA database.${NBA_SCHEMA_CONTEXT}`,
    inputSchema: {
      type: "object",
      properties: {
        sql: { 
          type: "string",
          description: "SQL query to execute. Use the schema context above to write efficient queries."
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "get_player_recent_games",
    description: "Get recent games for a specific player by name",
    inputSchema: {
      type: "object",
      properties: {
        player_name: { 
          type: "string",
          description: "Player name (e.g., 'Kevin Durant', 'LeBron James')"
        },
        num_games: { 
          type: "number",
          description: "Number of recent games to retrieve (default: 10)",
          default: 10
        },
      },
      required: ["player_name"],
    },
  },
  {
    name: "get_player_season_stats",
    description: "Get aggregated season statistics for a player",
    inputSchema: {
      type: "object",
      properties: {
        player_name: { 
          type: "string",
          description: "Player name (e.g., 'Kevin Durant')"
        },
        season: { 
          type: "string",
          description: "Season year (e.g., '2024', optional - defaults to current season)"
        },
      },
      required: ["player_name"],
    },
  },
  {
    name: "get_team_roster",
    description: "Get current roster for a team",
    inputSchema: {
      type: "object",
      properties: {
        team_name: { 
          type: "string",
          description: "Team name or abbreviation (e.g., 'Phoenix Suns', 'PHX')"
        },
      },
      required: ["team_name"],
    },
  },
  {
    name: "get_leading_stats",
    description: "Get leading players in a specific statistical category",
    inputSchema: {
      type: "object",
      properties: {
        stat_cat: { 
          type: "string",
          description: "Statistical category to rank players by (e.g., 'points', 'rebounds', 'assists')"
        }
      },
      required: ["stat_cat"],
    },
  },
];