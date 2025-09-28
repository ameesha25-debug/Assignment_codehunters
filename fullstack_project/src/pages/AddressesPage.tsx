import { useState, useEffect } from "react";
import AccountLayout from "@/components/account/AccountLayout";
import { addresses } from "@/lib/addresses";

type Address = {
  id: string;
  name: string; // UI expects 'name'
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

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

export default function AddressesPage() {
  const [list, setList] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    try {
      const addrList = await addresses.list();
      // Map API's full_name -> UI name, is_default -> isDefault
      const fixedList = addrList.map(a => ({
        id: a.id,
        name: a.full_name,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.is_default,
      }));
      setList(fixedList);
    } catch (e: any) {
      alert(e?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(a: Address) {
    setEditing(a);
    setOpen(true);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    setLoading(true);
    try {
      await addresses.delete(id);
      await fetchAddresses();
    } catch (e: any) {
      alert(e?.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(form: AddressInput) {
    setLoading(true);
    try {
      const body = {
        full_name: form.name,  // Map name back to full_name for API
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        is_default: form.isDefault,
      };
      if (editing) {
        await addresses.update(editing.id, body);
      } else {
        await addresses.create(body);
      }
      await fetchAddresses();
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      alert(e?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  }

  async function setDefault(id: string) {
    setLoading(true);
    try {
      await addresses.setDefault(id);
      await fetchAddresses();
    } catch (e: any) {
      alert(e?.message || "Failed to set default address");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AccountLayout title="My Addresses">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-600">
          Manage shipping and billing addresses used during checkout.
        </p>
        <button
          onClick={onAdd}
          disabled={loading}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
        >
          Add new address
        </button>
      </div>

      {loading ? (
        <div className="text-center text-sm py-8 text-zinc-600">Loading...</div>
      ) : list.length === 0 ? (
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
                      {a.name}{" "}
                      {a.isDefault ? (
                        <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs">
                          Default
                        </span>
                      ) : null}
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
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(a.id)}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {!a.isDefault ? (
                <button
                  onClick={() => setDefault(a.id)}
                  className="mt-4 text-sm font-medium underline"
                  disabled={loading}
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
          busy={loading}
        />
      ) : null}
    </AccountLayout>
  );
}

function AddressModal({
  initial,
  onClose,
  onSubmit,
  busy,
}: {
  initial: Address | null;
  onClose: () => void;
  onSubmit: (data: AddressInput) => void;
  busy: boolean;
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
            disabled={busy}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Full name" value={form.name} onChange={set("name")} />
          <Field label="Phone" value={form.phone} onChange={set("phone")} />
          <Field label="Address line 1" value={form.line1} onChange={set("line1")} />
          <Field
            label="Address line 2 (optional)"
            value={form.line2 || ""}
            onChange={set("line2")}
          />
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
              disabled={busy}
            />
            Set as default
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={busy}
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
