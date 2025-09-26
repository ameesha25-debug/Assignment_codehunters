import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="border-b bg-zinc-50">
        <div className="container mx-auto flex items-center gap-2 px-4 py-3 text-sm text-zinc-600">
          <Link to="/help" className="hover:text-yellow-600 hover:underline">Help</Link>
          <span>›</span>
          <span className="text-zinc-800">Contact us</span>
        </div>
      </nav>

      {/* Header copy */}
      <header className="container mx-auto px-4 py-8 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Contact us</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          We’re here to help. Get in touch with us in any of these ways:
        </p>
        <div className="mt-6 h-px w-full bg-zinc-200" />
      </header>

      {/* Tiles */}
      <main className="container mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <ContactTile
            borderColor="border-indigo-400"
            icon={
              <CircleIcon>
                <MailIcon />
              </CircleIcon>
            }
            title="Write to us"
            body="Drop us a line and we'll get back to you as fast as we can."
            ctaLabel="help@nykaaish.com"
            href="mailto:help@nykaaish.com"
          />

          <ContactTile
            borderColor="border-blue-500"
            icon={
              <CircleIcon>
                <FacebookIcon />
              </CircleIcon>
            }
            title="Facebook us"
            body="Connect with us on your favourite social network."
            ctaLabel="@nykaaish"
            href="https://facebook.com/nykaaish"
          />

          <ContactTile
            borderColor="border-zinc-900"
            icon={
              <CircleIcon>
                <XIcon />
              </CircleIcon>
            }
            title="Tweet us"
            body="Reach out in 140 characters! We’re @nykaaish."
            ctaLabel="@nykaaish"
            href="https://x.com/nykaaish"
          />

          <ContactTile
            borderColor="border-rose-400"
            icon={
              <CircleIcon>
                <PhoneIcon />
              </CircleIcon>
            }
            title="Talk to us"
            body="Monday to Sunday, 10:00AM to 10:00PM"
            ctaLabel="Call 1800‑123‑1555"
            href="tel:18001231555"
          />
        </div>
      </main>
    </div>
  );
}

/* UI bits */

function ContactTile({
  icon,
  title,
  body,
  ctaLabel,
  href,
  borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  borderColor?: string;
}) {
  return (
    <a
      href={href}
      className={`group block rounded-2xl border ${borderColor ?? "border-zinc-200"} bg-white p-6 text-center shadow-sm transition-all hover:shadow-md`}
    >
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-600">{body}</p>
      <p className="mt-3 text-sm font-medium text-indigo-700 group-hover:underline">{ctaLabel}</p>
    </a>
  );
}

function CircleIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-current text-zinc-700">
      {children}
    </span>
  );
}

/* Inline icons (no external deps) */

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden>
      <path d="M13 22v-9h3l1-4h-4V7c0-1.03.34-2 2-2h2V1h-3c-3 0-5 2-5 5v3H7v4h2v9h4z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden>
      <path d="M17.5 3h3l-7.5 8.5L21 21h-3l-6-7-6 7H3l7.5-8.5L3 3h3l6 7 5.5-7z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden>
      <path d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.22c1.2.48 2.5.74 3.8.74a1 1 0 011 1V20a1 1 0 01-1 1C11.85 21 3 12.15 3 2a1 1 0 011-1h3.28a1 1 0 011 1c0 1.31.26 2.6.74 3.8a1 1 0 01-.22 1.1L6.6 10.8z" />
    </svg>
  );
}
