function Footer() {
  return (
    <footer
      className="text-gray-900 flex-shrink-0 w-full"
      style={{
        background: "#F0EFFF",
      }}
    >
      <div className="w-full flex flex-col items-center justify-center">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} NBA Chatbot. All rights reserved.
        </p>
        <a
          href="https://github.com/Joel-Tai/NBA-Chatbot"
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="https://github.com/Joel-Tai/NBA-Chatbot"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
