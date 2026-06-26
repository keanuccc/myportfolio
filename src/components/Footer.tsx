export default function Footer() {
  return (
    <footer className="bg-apple-bgSecondary dark:bg-carddark py-16 px-6 sm:px-12 border-t border-black/5 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto text-center">
        <p className="text-base text-apple-text dark:text-white">
          Designed & Built by{" "}
          <a
            href="/"
            className="text-marrsgreen dark:text-carrigreen hover:underline font-medium"
          >
            Keanuccc
          </a>
        </p>
        <p className="mt-3 text-sm text-apple-textSecondary dark:text-textdark">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
