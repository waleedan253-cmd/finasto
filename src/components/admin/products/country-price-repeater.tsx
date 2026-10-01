"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Repeatable per-country price rows for the product form. Same
// controlled-array pattern as variant-repeater.tsx — this component only
// edits the array; product-form.tsx diffs it against what loaded from
// the server to build ProductInput.deletedCountryPriceIds on submit.

export type CountryOption = {
  id: string;
  name: string;
  currencyCode: string;
};

export type CountryPriceDraft = {
  id?: string; // present = existing row from the database
  countryId: string;
  price: string; // kept as string while editing, parsed to number on submit
  salePrice: string; // "" = no sale price
  active: boolean;
};

export function emptyCountryPrice(countryId = ""): CountryPriceDraft {
  return { countryId, price: "", salePrice: "", active: true };
}

export function CountryPriceRepeater({
  value,
  onChange,
  countries,
  errors,
}: {
  value: CountryPriceDraft[];
  onChange: (next: CountryPriceDraft[]) => void;
  countries: CountryOption[];
  errors?: Record<number, Partial<Record<keyof CountryPriceDraft, string>>>;
}) {
  const usedCountryIds = new Set(value.map((r) => r.countryId).filter(Boolean));
  const availableCountries = countries.filter((c) => !usedCountryIds.has(c.id));

  function update(index: number, patch: Partial<CountryPriceDraft>) {
    onChange(value.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    if (availableCountries.length === 0) return;
    onChange([...value, emptyCountryPrice(availableCountries[0].id)]);
  }

  if (countries.length === 0) {
    return (
      <p className="font-sans text-[13px] text-warm-gray">
        No countries configured yet. Add countries in Settings first, then
        country-specific pricing can be set here.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {value.map((row, index) => {
          const country = countries.find((c) => c.id === row.countryId);
          // Include the row's own current country in its dropdown options,
          // even though it's "used", so switching away and back works.
          const rowOptions = country
            ? [
                country,
                ...availableCountries.filter((c) => c.id !== country.id),
              ]
            : availableCountries;

          return (
            <CountryPriceRow
              key={row.id ?? `new-${index}`}
              row={row}
              index={index}
              currencyCode={country?.currencyCode ?? "USD"}
              options={rowOptions}
              errors={errors?.[index]}
              onChange={(patch) => update(index, patch)}
              onRemove={() => remove(index)}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={availableCountries.length === 0}
        className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-border-strong px-4 font-sans text-[13px] font-medium text-espresso transition-colors hover:border-copper disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        Add Country Price
      </button>

      {value.length === 0 && (
        <p className="mt-2 font-sans text-[13px] text-warm-gray">
          No country-specific pricing set — the product's base USD price will be
          converted at the live exchange rate for every market.
        </p>
      )}
    </div>
  );
}

function CountryPriceRow({
  row,
  index,
  currencyCode,
  options,
  errors,
  onChange,
  onRemove,
}: {
  row: CountryPriceDraft;
  index: number;
  currencyCode: string;
  options: CountryOption[];
  errors?: Partial<Record<keyof CountryPriceDraft, string>>;
  onChange: (patch: Partial<CountryPriceDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field
          label="Country"
          error={errors?.countryId}
          className="col-span-2 sm:col-span-1"
        >
          <select
            value={row.countryId}
            onChange={(e) => onChange({ countryId: e.target.value })}
            className={inputClass(!!errors?.countryId)}
          >
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Price (${currencyCode})`} error={errors?.price}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={row.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="0.00"
            className={inputClass(!!errors?.price)}
          />
        </Field>

        <Field label="Sale price" error={errors?.salePrice}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={row.salePrice}
            onChange={(e) => onChange({ salePrice: e.target.value })}
            placeholder="Optional"
            className={inputClass(!!errors?.salePrice)}
          />
        </Field>

        <div className="flex items-end justify-between gap-2">
          <label className="flex items-center gap-2 font-sans text-[13px] text-espresso/80">
            <input
              type="checkbox"
              checked={row.active}
              onChange={(e) => onChange({ active: e.target.checked })}
              className="h-4 w-4 rounded border-border-strong accent-copper"
            />
            Active
          </label>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove pricing for row ${index + 1}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-copper/10 hover:text-copper"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-sans text-[12px] text-warm-gray">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 font-sans text-[11px] text-copper">{error}</p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "h-10 w-full rounded-lg border bg-white px-3 font-sans text-[13px] text-espresso placeholder:text-warm-gray focus:outline-none",
    hasError ? "border-copper" : "border-border focus:border-copper",
  );
}
