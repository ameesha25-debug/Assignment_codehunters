import { useEffect, useMemo, useRef, useState } from "react";
import AccountLayout from "@/components/account/AccountLayout";
import TextCategoryBar, { type Item } from "@/components/common/TextCategoryBar";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

type Form = {
  firstName: string;
  lastName: string;
  dob: string; // yyyy-mm-dd
  bio: string;
  contactPref: "SMS" | "CALL" | "";
  newsletter: boolean;
};

export default function ProfilePage() {
  const { user, reloadUser } = useAuth() as ReturnType<typeof useAuth> & {
    reloadUser?: () => Promise<void>;
  };

  // TextCategoryBar items
  const items: Item[] = [
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Kids", slug: "kids" },
    { name: "Footwear", slug: "footwear" },
    { name: "Bags", slug: "bags" },
    { name: "Beauty", slug: "beauty" },
    { name: "Watches", slug: "watches" },
  ];
  const activeSlug = ""; // none highlighted on profile

  // DOB helpers
  const toDateInput = (d?: string | null) => (d ? String(d).slice(0, 10) : "");
  const toDisplay = (iso: string) =>
    iso ? iso.slice(8, 10) + "-" + iso.slice(5, 7) + "-" + iso.slice(0, 4) : "";
  const toISO = (display: string) => {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display.trim());
    if (!m) return "";
    const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
    if (mm < 1 || mm > 12) return "";
    const dim = new Date(yyyy, mm, 0).getDate();
    if (dd < 1 || dd > dim) return "";
    return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  };

  // Initial values from user
  const initial: Form = useMemo(() => {
    const full = (user?.name || "").trim();
    const [firstName = "", lastName = ""] = full.split(" ");
    return {
      firstName,
      lastName,
      dob: toDateInput((user as any)?.dob),
      bio: (user as any)?.bio || "",
      contactPref: ((user as any)?.contact_pref as "SMS" | "CALL" | "") || "",
      newsletter: Boolean((user as any)?.newsletter),
    };
  }, [user]);

  const [form, setForm] = useState<Form>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dirty =
    form.firstName !== initial.firstName ||
    form.lastName !== initial.lastName ||
    form.dob !== initial.dob ||
    form.bio !== initial.bio ||
    form.contactPref !== initial.contactPref ||
    form.newsletter !== initial.newsletter;

  useEffect(() => {
    if (submitting) return;
    setForm(initial);
  }, [initial, submitting]);

  const set = <K extends keyof Form>(k: K) => (v: Form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please fill both first and last name.");
      setSubmitting(false);
      return;
    }

    let isoDob: string | null = null;
    if (form.dob) {
      const display = toDisplay(form.dob);
      const iso = toISO(display);
      if (!iso) {
        setError("Use DOB format dd-mm-yyyy or pick from calendar.");
        setSubmitting(false);
        return;
      }
      isoDob = iso;
    }

    try {
      await api.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: isoDob,
        bio: form.bio.trim() || null,
        contactPref: form.contactPref || null,
        newsletter: form.newsletter,
      } as any);

      // Optimistic, then reload
      setForm((p) => ({ ...p, dob: isoDob || "" }));
      if (reloadUser) await reloadUser();
      setSuccess("Profile updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  }

  const mobile = (user as any)?.mobile || (user as any)?.phone || "";

  return (
    <AccountLayout title="Profile">
      {/* Category bar */}
      <div className="mb-4">
        <TextCategoryBar
          kind="level1"
          items={items}
          activeSlug={activeSlug}
          basePath="/category"
        />
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        <HeaderCard />

        <form onSubmit={onSubmit} className="space-y-6">
          <Section title="Personal details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                placeholder="e.g., Riya"
                value={form.firstName}
                onChange={(v) => set("firstName")(v)}
                required
                hint="As on ID"
              />
              <Field
                label="Last name"
                placeholder="e.g., Verma"
                value={form.lastName}
                onChange={(v) => set("lastName")(v)}
                required
                hint="Surname"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm text-zinc-700">Mobile number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-700 select-none">
                  +91
                </span>
                <input
                  value={mobile}
                  disabled
                  className="w-full rounded-r-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-700"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">Used for order updates and login.</p>
            </div>

            <div className="mt-4">
              <DobField value={form.dob} onChange={(iso) => set("dob")(iso)} toDisplay={toDisplay} toISO={toISO} />
            </div>
          </Section>

          <Section title="Preferences">
            <div>
              <label className="mb-1 block text-sm text-zinc-700">About me</label>
              <textarea
                rows={3}
                maxLength={160}
                placeholder="Tell us a little about yourself (max 160 chars)"
                value={form.bio}
                onChange={(e) => set("bio")(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <p className="mt-1 text-xs text-zinc-500">
                {160 - (form.bio?.length || 0)} characters left
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm text-zinc-700">Preferred contact</label>
              <div className="flex items-center gap-6 text-sm text-zinc-700">
                <Option
                  label="SMS"
                  checked={form.contactPref === "SMS"}
                  onChange={() => set("contactPref")("SMS")}
                />
                <Option
                  label="Call"
                  checked={form.contactPref === "CALL"}
                  onChange={() => set("contactPref")("CALL")}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-md border border-zinc-200 p-3">
              <div>
                <p className="text-sm text-zinc-800">Subscribe to newsletters</p>
                <p className="text-xs text-zinc-500">Get product updates and offers.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={form.newsletter}
                  onChange={(e) => set("newsletter")(e.target.checked)}
                  className="accent-indigo-600"
                />
              </label>
            </div>
          </Section>

          <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 backdrop-blur-sm">
            {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
            {success ? <p className="mb-3 text-sm text-green-600">{success}</p> : null}
            <button
              type="submit"
              disabled={!dirty || submitting}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white shadow-sm ring-1 ring-indigo-600 transition-all hover:bg-indigo-800 hover:shadow-md active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Saving..." : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
}

function HeaderCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-indigo-50 to-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Profile</h1>
          <p className="text-sm text-zinc-600">Manage personal info and preferences</p>
        </div>
        <div className="hidden h-1.5 w-16 rounded-full bg-yellow-400 sm:block" />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white/70 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-4 w-1.5 rounded bg-yellow-400" />
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
  hint,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  const [touched, setTouched] = useState(false);
  const invalid = required && touched && !value.trim();

  return (
    <div className="group">
      <label className="mb-1 block text-sm text-zinc-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
          invalid ? "border-red-400" : "border-zinc-300"
        }`}
      />
      <div className="mt-1 h-5">
        {invalid ? (
          <span className="text-xs text-red-600">This field is required</span>
        ) : (
          <span className="text-xs text-zinc-500">{hint}</span>
        )}
      </div>
    </div>
  );
}

function Option({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
        checked ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-zinc-300 hover:border-indigo-300"
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="accent-indigo-600" />
      <span>{label}</span>
    </label>
  );
}

// DOB with masked input + icon calendar
function DobField({
  value,
  onChange,
  toDisplay,
  toISO,
}: {
  value: string; // yyyy-mm-dd
  onChange: (iso: string) => void;
  toDisplay: (iso: string) => string;
  toISO: (display: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(""); // dd-mm-yyyy
  const ref = useRef<HTMLDivElement | null>(null);
  const hiddenDateRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(toDisplay(value));
  }, [value, toDisplay]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onDraftChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const parts = [];
    if (digits.length >= 2) parts.push(digits.slice(0, 2));
    else parts.push(digits);
    if (digits.length >= 4) parts.push(digits.slice(2, 4));
    else if (digits.length > 2) parts.push(digits.slice(2));
    if (digits.length > 4) parts.push(digits.slice(4));
    setDraft(parts.filter(Boolean).join("-"));
  };

  const commitDraft = () => {
    if (!draft) {
      onChange("");
      return;
    }
    const iso = toISO(draft);
    if (iso) onChange(iso);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="mb-1 block text-sm text-zinc-700">Date of Birth</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="dd-mm-yyyy"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={commitDraft}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          inputMode="numeric"
          maxLength={10}
        />
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setTimeout(() => hiddenDateRef.current?.showPicker?.(), 0);
          }}
          className="rounded-md border border-zinc-300 px-2 py-2 text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
          aria-label="Open calendar"
        >
          <span aria-hidden>📅</span>
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">Use format dd-mm-yyyy or pick from calendar.</p>

      {/* Hidden native date input to render the calendar only */}
      <input
        ref={hiddenDateRef}
        type="date"
        value={value}
        onChange={(e) => {
          const iso = e.target.value;
          onChange(iso);
          setDraft(toDisplay(iso));
          setOpen(false);
        }}
        max={new Date().toISOString().slice(0, 10)}
        className="absolute left-0 top-full z-50 mt-2 w-0 h-0 opacity-0"
        aria-hidden
        tabIndex={-1}
      />

      {open ? <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-md border bg-transparent" /> : null}
    </div>
  );
}
