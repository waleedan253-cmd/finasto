import { Fragment, type ReactNode } from "react";

const BRAND = "Finasto";

export function withTM(text: string): ReactNode {
  return text.split(BRAND).flatMap((part, i, arr) =>
    i < arr.length - 1
      ? [
          <Fragment key={i}>{part}{BRAND}<sup className="ml-0.5 text-[0.4em] font-normal align-super">™</sup></Fragment>,
        ]
      : [<Fragment key={i}>{part}</Fragment>]
  );
}