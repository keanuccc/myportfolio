"use client";

import { useEffect, useState } from "react";
import { Profile } from "@/lib/types";

export default function Contact() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = profile?.contact.socialLinks || [];
  const contactEmail = profile?.contact.email || "2245269601@@qq.com";

  return (
    <section
      id="contact"
      className="section text-center min-h-screen flex flex-col justify-center"
    >
      <div className="mb-6">
        <span>
          <h2 className="section-heading">Contact</h2>
        </span>
      </div>
      <p className="my-6 max-w-4xl mx-auto text-2xl leading-relaxed text-slate-600 dark:text-slate-300">
        无论是 AI 产品合作、技术交流，还是职业机会探讨，都欢迎随时联系我。
      </p>

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto w-full mt-4 mb-10 space-y-5"
      >
        <div className="flex flex-col sm:flex-row gap-5">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 px-5 py-4 rounded-lg bg-white dark:bg-[#1B2731] border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-marrsgreen dark:focus:ring-carrigreen text-lg transition-all duration-300"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-5 py-4 rounded-lg bg-white dark:bg-[#1B2731] border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-marrsgreen dark:focus:ring-carrigreen text-lg transition-all duration-300"
          />
        </div>
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="w-full px-5 py-4 rounded-lg bg-white dark:bg-[#1B2731] border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-marrsgreen dark:focus:ring-carrigreen text-lg resize-none transition-all duration-300"
        />

        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-marrsgreen to-marrslight dark:from-carrigreen dark:to-carrilight hover:bg-marrslight active:bg-marrsdark dark:hover:bg-carrilight dark:active:bg-carridark text-bglight dark:text-bgdark py-4 px-14 rounded-lg text-xl font-medium outline-marrsgreen dark:outline-carrigreen focus-visible:outline-double outline-offset-2 inline-block shadow-lg hover:shadow-xl hover:shadow-marrsgreen/20 dark:hover:shadow-carrigreen/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>

        {success && (
          <p className="text-marrsgreen dark:text-carrigreen text-lg">
            Message sent successfully!
          </p>
        )}
        {error && <p className="text-red-500 text-lg">{error}</p>}
      </form>

      {/* Fallback mailto link */}
      <div className="mb-10">
        <a
          role="button"
          className="bg-marrsgreen hover:bg-marrslight active:bg-marrsdark dark:hover:bg-carrilight dark:active:bg-carridark dark:bg-carrigreen text-bglight dark:text-bgdark py-5 px-14 rounded-lg text-2xl font-medium outline-marrsgreen dark:outline-carrigreen focus-visible:outline-double outline-offset-2 inline-block shadow-lg hover:shadow-xl transition-shadow"
          href={`mailto:${contactEmail}`}
        >
          Say Hello
        </a>
      </div>

      <div className="flex justify-center items-center gap-8 mt-4">
        {/* GitHub */}
        <a
          href={
            socialLinks.find((l) => l.platform === "github")?.url ||
            "https://github.com/keanuccc"
          }
          target="_blank"
          rel="noreferrer"
          title="GitHub"
          className="text-slate-500 dark:text-slate-400 hover:text-marrsgreen dark:hover:text-carrigreen transition-colors hover:scale-110 transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>

        {/* WeChat */}
        <div className="relative group">
          <div
            title="WeChat"
            className="text-slate-500 dark:text-slate-400 hover:text-marrsgreen dark:hover:text-carrigreen transition-colors hover:scale-110 transform cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.937 6.937 0 0 1-.261-1.883c0-3.54 3.28-6.41 7.326-6.41.18 0 .354.014.53.025-.838-3.2-4.153-5.461-8.41-5.461zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.564 2.677c-3.617 0-6.554 2.536-6.554 5.668 0 3.131 2.937 5.667 6.554 5.667.72 0 1.417-.105 2.076-.296a.674.674 0 0 1 .564.076l1.36.796a.258.258 0 0 0 .13.042c.126 0 .227-.103.227-.23 0-.057-.023-.113-.038-.168l-.278-1.056a.466.466 0 0 1 .168-.524C21.022 17.406 22 15.77 22 13.923c0-3.132-2.937-5.668-6.554-5.668h-.284zm-2.32 3.16c.505 0 .914.416.914.928a.921.921 0 0 1-.914.927.921.921 0 0 1-.913-.927c0-.512.41-.928.913-.928zm4.642 0c.505 0 .913.416.913.928a.921.921 0 0 1-.913.927.921.921 0 0 1-.914-.927c0-.512.41-.928.914-.928z" />
            </svg>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            微信: xjyczh20070309
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
