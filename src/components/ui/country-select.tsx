"use client";

// Country picker with real flags. The value is the ISO code ("PK"); the
// name is looked up from it. Shared by the Settings form and PhoneInput.
// Client-only file: import it from client components, not server ones.

import { Select } from "antd";
import { getCountries, type CountryCode } from "libphonenumber-js";
import { Flag } from "@/components/ui/flag";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export type CountryOption = { code: CountryCode; name: string };

// Built once when the file loads, not on every render.
export const COUNTRIES: CountryOption[] = getCountries()
  .map((code) => ({ code, name: regionNames.of(code) ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name));

const NAME_BY_CODE = new Map(COUNTRIES.map((c) => [c.code as string, c.name]));

export const countryName = (code?: string | null): string =>
  NAME_BY_CODE.get((code ?? "").toUpperCase()) ?? "";

type Props = {
  value?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
};

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select your country",
  disabled,
  allowClear,
}: Props) {
  return (
    <Select<string>
      showSearch
      allowClear={allowClear}
      disabled={disabled}
      value={value || undefined}
      onChange={(v) => onChange?.(v ?? "")}
      placeholder={placeholder}
      optionFilterProp="search"
      options={COUNTRIES.map((c) => ({
        value: c.code,
        search: `${c.name} ${c.code}`,
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Flag code={c.code} />
            {c.name}
          </span>
        ),
      }))}
      style={{ width: "100%" }}
    />
  );
}
