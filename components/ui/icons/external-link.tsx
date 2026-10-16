import type { IconProps } from "./types";

/** tabler-icon-external-link — сітка 20px, обведення 2 (експорт з Figma) */
export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path
        transform="translate(2.3333 2.3333)"
        d="M7.66667 2.66667H2.66667C2.22464 2.66667 1.80072 2.84226 1.48816 3.15482C1.17559 3.46738 1 3.89131 1 4.33333V12.6667C1 13.1087 1.17559 13.5326 1.48816 13.8452C1.80072 14.1577 2.22464 14.3333 2.66667 14.3333H11C11.442 14.3333 11.866 14.1577 12.1785 13.8452C12.4911 13.5326 12.6667 13.1087 12.6667 12.6667V7.66667M6.83333 8.5L14.3333 1M14.3333 5.16667V1H10.1667"
      />
    </svg>
  );
}
