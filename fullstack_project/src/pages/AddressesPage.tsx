// src/pages/AddressesPage.tsx
import { useState } from "react";
import AccountLayout from "@/components/account/AccountLayout";

type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export default function AddressesPage() {
  // Temporary local list; replace with API fetch later
  const [list, setList] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(a: Address) {
    setEditing(a);
    setOpen(true);
  }

  function onDelete(id: string) {
    // TODO: call DELETE /api/addresses/:id
    setList((l) => l.filter((x) => x.id !== id));
  }

  function onSubmit(form: AddressInput) {
    if (editing) {
      // TODO: call PUT /api/addresses/:id
      setList((l) =>
        l.map((x) => (x.id === editing.id ? { ...editing, ...form } : x))
      );
    } else {
      // TODO: call POST /api/addresses
      const id = crypto.randomUUID();
      setList((l) => [
        ...l.map((a) => ({ ...a, isDefault: form.isDefault ? false : a.isDefault })),
        { id, ...form },
      ]);
    }
    setOpen(false);
    setEditing(null);
  }

  return (
    <AccountLayout title="My Addresses">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-600">
          Manage shipping and billing addresses used during checkout.
        </p>
        <button
          onClick={onAdd}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
        >
          Add new address
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-sm text-zinc-600">
          No addresses yet. Click “Add new address” to create one.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((a) => (
            <li key={a.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">
                      {a.name} {a.isDefault ? <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs">Default</span> : null}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-zinc-700 whitespace-pre-line">
                    {a.line1}
                    {a.line2 ? `\n${a.line2}` : ""}
                    {`\n${a.city}, ${a.state} ${a.pincode}`}
                    {`\n+91 ${a.phone}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(a)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(a.id)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {!a.isDefault ? (
                <button
                  onClick={() =>
                    setList((l) =>
                      l.map((x) => ({ ...x, isDefault: x.id === a.id }))
                    )
                  }
                  className="mt-4 text-sm font-medium underline"
                >
                  Set as default
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <AddressModal
          initial={editing ?? null}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={onSubmit}
        />
      ) : null}
    </AccountLayout>
  );
}

type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

function AddressModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Address | null;
  onClose: () => void;
  onSubmit: (data: AddressInput) => void;
}) {
  const [form, setForm] = useState<AddressInput>({
    name: initial?.name || "",
    phone: initial?.phone || "",
    line1: initial?.line1 || "",
    line2: initial?.line2 || "",
    city: initial?.city || "",
    state: initial?.state || "",
    pincode: initial?.pincode || "",
    isDefault: initial?.isDefault || false,
  });

  const set = (k: keyof AddressInput) => (v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v as any }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit address" : "Add new address"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Full name" value={form.name} onChange={set("name")} />
          <Field label="Phone" value={form.phone} onChange={set("phone")} />
          <Field label="Address line 1" value={form.line1} onChange={set("line1")} />
          <Field label="Address line 2 (optional)" value={form.line2 || ""} onChange={set("line2")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="City" value={form.city} onChange={set("city")} />
            <Field label="State" value={form.state} onChange={set("state")} />
            <Field label="Pincode" value={form.pincode} onChange={set("pincode")} />
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.isDefault}
              onChange={(e) => set("isDefault")(e.target.checked)}
            />
            Set as default
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-black focus:outline-none"
      />
    </label>
  );
}
