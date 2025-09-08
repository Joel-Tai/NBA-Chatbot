function Contact() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Contact Me</h1>
        <p className="mb-2">
          Email:{" "}
          <a
            href="mailto:your.email@example.com"
            className="text-blue-600 underline hover:text-blue-800"
          >
            your.email@example.com
          </a>
        </p>
        <p className="mb-2">
          LinkedIn:{" "}
          <a
            href="https://www.linkedin.com/in/your-linkedin/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            linkedin.com/in/your-linkedin
          </a>
        </p>
        <p>
          GitHub:{" "}
          <a
            href="https://github.com/Joel-Tai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            github.com/Joel-Tai
          </a>
        </p>
      </div>
    </div>
  );
}

export default Contact;
