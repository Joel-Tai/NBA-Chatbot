import myResume from "../assets/Resume.pdf"; // Place your PDF in src/assets/

export const Resume = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Resume</h1>
      <a
        href={myResume}
        download="Joel_Tai_Resume.pdf"
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Download Resume
      </a>
      <div className="w-full aspect-[8.5/11] border rounded shadow overflow-hidden">
        <iframe
          src={myResume}
          title="Resume PDF"
          className="w-full h-[80vh] min-h-[500px] border-0"
        />
      </div>
    </div>
  );
};
