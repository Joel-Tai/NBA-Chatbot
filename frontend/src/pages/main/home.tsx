import React from "react";

type HomeProps = {
  onQuery: (query: string) => void;
};

export const Home: React.FC<HomeProps> = ({ onQuery }) => {
  const queries = [
    "Who has the most points in a single game?",
    "What is LeBron James' career high in assists?",
    "Show me the top 5 players by rebounds in the 2022 season.",
    "What was the score of the Lakers vs Celtics game on Christmas?",
  ];
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-row gap-8 justify-center items-start">
        {/* Intro */}
        <div className="flex-1 min-h-[360px]  min-w-[250px] max-w-md bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Welcome to My Basketball Chatbot
          </h1>
          <p className="text-gray-700 leading-relaxed">
            I built a custom chatbot that lets users query an NBA statistics
            database using natural language, similar to StatMuse. The database
            includes detailed data on players, teams, and game stats. This
            project combines my passion for basketball with my interests in AI,
            the Model Context Protocol (MCP), and full-stack development. I
            designed and developed both the frontend and backend, integrating
            Natural Language Processing (NLP) with a structured SQL-backed
            system to deliver fast, conversational insights.
          </p>
        </div>
        {/* Limitations */}
        <div className="flex-1 min-h-[360px]  min-w-[250px] max-w-md bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Limitations
          </h3>
          <ul className="list-none space-y-2">
            <li className="text-gray-700 leading-relaxed">
              The chatbot is designed to handle a wide range of queries, but it
              may not understand every question perfectly. If you encounter any
              issues, please try rephrasing your question or checking the format
              of your query.
            </li>
            <li className="text-gray-700 leading-relaxed">
              Data is limited to the 2024-25 NBA regular season.
            </li>
          </ul>
        </div>
        {/* Example Queries */}
        <div className="flex-1 min-h-[360px] min-w-[250px] max-w-md bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Try out some queries
          </h3>
          <ul className="list-none space-y-2">
            {queries.map((q, idx) => (
              <li
                key={idx}
                className="cursor-pointer hover:text-blue-600 transition text-gray-700 leading-relaxed"
                onClick={() => onQuery(q)}
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
