"use client";

// Phone field: flag + country code picker, then the number. Works inside
// an antd Form.Item (it gets value and onChange from it). The value it
// gives back is ONE string in +E.164 form, for example "+923001234567",
// which is exactly what complete_affiliate_profile() in SQL accepts.

import { useState } from "react";
import { Input, Select } from "antd";
import {
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { Flag } from "@/components/ui/flag";
import { COUNTRIES } from "./country-select";

// Use in <Form.Item rules={[phoneRule]}>. Empty passes (use `required`
// for that); anything filled in must be a real number for that country.
export const phoneRule = {
  validator: (_: unknown, v?: string) =>
    !v || isValidPhoneNumber(v)
      ? Promise.resolve()
      : Promise.reject(new Error("Enter a valid phone number")),
};

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string; // used when there is no saved number yet
  disabled?: boolean;
  placeholder?: string;
};

export function PhoneInput({
  value,
  onChange,
  defaultCountry = "PK",
  disabled,
  placeholder = "300 1234567",
}: Props) {
  // Split a saved +E.164 number into country + national part once, when
  // the field first appears. After that the two parts are the field's
  // own state.
  const [country, setCountry] = useState<CountryCode>(() => {
    const p = value ? parsePhoneNumberFromString(value) : undefined;
    return (p?.country ?? defaultCountry) as CountryCode;
  });
  const [national, setNational] = useState<string>(() => {
    const p = value ? parsePhoneNumberFromString(value) : undefined;
    return p?.nationalNumber ?? "";
  });

  function emit(c: CountryCode, text: string) {
    const digits = text.replace(/\D/g, "");
    if (!digits) {
      onChange?.("");
      return;
    }
    // Handles a leading 0 (0300...) and a pasted +92... number.
    const parsed = parsePhoneNumberFromString(text, c);
    onChange?.(
      parsed ? parsed.number : `+${getCountryCallingCode(c)}${digits}`,
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      <Select<CountryCode>
        showSearch
        disabled={disabled}
        value={country}
        onChange={(c) => {
          setCountry(c);
          emit(c, national);
        }}
        optionFilterProp="search"
        optionLabelProp="short"
        popupMatchSelectWidth={280}
        style={{ width: 118, flexShrink: 0 }}
        options={COUNTRIES.map((c) => ({
          value: c.code,
          search: `${c.name} ${c.code} +${getCountryCallingCode(c.code)}`,
          short: (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Flag code={c.code} />+{getCountryCallingCode(c.code)}
            </span>
          ),
          label: (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flag code={c.code} />
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ opacity: 0.6 }}>
                +{getCountryCallingCode(c.code)}
              </span>
            </span>
          ),
        }))}
      />
      <Input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        value={national}
        placeholder={placeholder}
        maxLength={20}
        onChange={(e) => {
          setNational(e.target.value);
          emit(country, e.target.value);
        }}
      />
    </div>
  );
}
