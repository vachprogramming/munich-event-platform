export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            <span>🥨</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              MunichEvents
            </span>
          </div>
          
          {/* Copyright */}
          <p className="text-gray-400 text-sm text-center sm:text-right">
            © 2025 Munich Event Platform by Vachagan Muradyan
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            Built with FastAPI & Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}