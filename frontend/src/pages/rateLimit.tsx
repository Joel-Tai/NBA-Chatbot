function RateLimit() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <span className="text-5xl mb-4">🚦</span>
        <h1 className="text-2xl font-bold mb-2 text-red-600">
          Rate Limit Exceeded
        </h1>
        <p className="text-gray-700 text-center mb-2">
          Oh no, you've exceeded your rate limit!
        </p>
        <p className="text-gray-500 text-center">
          Please wait a while before trying again.
        </p>
      </div>
    </div>
  );
}

export default RateLimit;
