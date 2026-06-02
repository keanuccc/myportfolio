export default function Footer() {
  return (
    <footer className="bg-white dark:bg-carddark py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto text-center text-sm text-slate-500 dark:text-slate-400">
        <p>
          Designed & Built by{" "}
          <a
            href="/"
            className="text-marrsgreen dark:text-carrigreen hover:underline"
          >
            Your Name
          </a>
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
