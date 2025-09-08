import { useState } from "react";
import er from "../assets/DatabaseEr.drawio.png";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "react-medium-image-zoom/dist/styles.css";

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="max-w-md w-full h-auto cursor-zoom-in rounded shadow"
        draggable={false}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white p-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={5}
              doubleClick={{ mode: "zoomIn" }}
              wheel={{ step: 0.2 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="mb-2 flex gap-2 justify-center">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => zoomIn()}
                    >
                      +
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => zoomOut()}
                    >
                      −
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => resetTransform()}
                    >
                      Reset
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-[80vh] max-w-[90vw] overflow-auto">
                    <TransformComponent>
                      <img
                        src={src}
                        alt={alt}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "80vh",
                          display: "block",
                          margin: "0 auto",
                          cursor: "grab",
                        }}
                        draggable={false}
                      />
                    </TransformComponent>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
}

export const Data = () => {
  return (
    <div className="mx-auto px-15 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Data Coverage
        </h1>
        <p className="text-gray-700 leading-relaxed">
          The dataset is made from{" "}
          <a
            href="https://github.com/swar/nba_api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            nba_api
          </a>
          . The nba_api gets their endpoint from NBA.com, so all data is from
          the NBA.com site. Currently it covers only 2024-2025 regular season
          data but I do plan to add more seasons. Currently, queries asking for
          team rosters, season stats and recent games are working. Asking
          different queries may not return as expected.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Database Design
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The database is designed to efficiently store and retrieve NBA
          statistics, including player data, team information, and game results.
          It uses a relational model with multiple tables to represent different
          entities and their relationships. The design allows for complex
          queries while maintaining performance and scalability.
        </p>
        <div className="flex flex-col items-center">
          <ZoomableImage src={er} alt="PNG ER Diagram" />
          <label className="text-gray-700 leading-relaxed mt-2">
            The current database design
          </label>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Future Plans
        </h2>
        <p className="text-gray-700 leading-relaxed">
          I plan to expand the dataset to include historical seasons, player
          transactions, and more detailed game statistics. Additionally, I aim
          to improve the chatbot's natural language understanding capabilities
          and add support for more complex queries.
        </p>
      </div>
    </div>
  );
};
