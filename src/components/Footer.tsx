export default function Footer() {
  return (
    <footer className="bg-white dark:bg-carddark py-10 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto text-center text-sm text-slate-500 dark:text-slate-400">
        <p className="text-base">
          Designed & Built by{" "}
          <a
            href="/"
            className="text-marrsgreen dark:text-carrigreen hover:underline font-medium"
          >
            Your Name
          </a>
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
