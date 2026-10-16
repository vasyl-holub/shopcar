import type { IconProps } from "./types";

/* Іконки шапки — tabler, обведення 2 (експорт з Figma) */

const base24 = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function CartIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base24}
      strokeWidth={strokeWidth ?? 2}
      className={className}
      aria-hidden
    >
      <path
        transform="translate(3 2)"
        d="M3 15C3.53043 15 4.03914 15.2107 4.41421 15.5858C4.78929 15.9609 5 16.4696 5 17C5 17.5304 4.78929 18.0391 4.41421 18.4142C4.03914 18.7893 3.53043 19 3 19C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17C1 16.4696 1.21071 15.9609 1.58579 15.5858C1.96086 15.2107 2.46957 15 3 15ZM3 15H14M3 15V1H1M14 15C14.5304 15 15.0391 15.2107 15.4142 15.5858C15.7893 15.9609 16 16.4696 16 17C16 17.5304 15.7893 18.0391 15.4142 18.4142C15.0391 18.7893 14.5304 19 14 19C13.4696 19 12.9609 18.7893 12.5858 18.4142C12.2107 18.0391 12 17.5304 12 17C12 16.4696 12.2107 15.9609 12.5858 15.5858C12.9609 15.2107 13.4696 15 14 15ZM3 3L17 4L16 11H3"
      />
    </svg>
  );
}

export function UserIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base24}
      strokeWidth={strokeWidth ?? 2}
      className={className}
      aria-hidden
    >
      <path
        transform="translate(5 2)"
        d="M1 19V17C1 15.9391 1.42143 14.9217 2.17157 14.1716C2.92172 13.4214 3.93913 13 5 13H9C10.0609 13 11.0783 13.4214 11.8284 14.1716C12.5786 14.9217 13 15.9391 13 17V19M3 5C3 6.06087 3.42143 7.07828 4.17157 7.82843C4.92172 8.57857 5.93913 9 7 9C8.06087 9 9.07828 8.57857 9.82843 7.82843C10.5786 7.07828 11 6.06087 11 5C11 3.93913 10.5786 2.92172 9.82843 2.17157C9.07828 1.42143 8.06087 1 7 1C5.93913 1 4.92172 1.42143 4.17157 2.17157C3.42143 2.92172 3 3.93913 3 5Z"
      />
    </svg>
  );
}

/** Сітка 20px — саме такий бокс у макеті поруч з пунктом меню */
export function ChevronDownIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path transform="translate(4 7.3333)" d="M1 1L6 6L11 1" />
    </svg>
  );
}

/** tabler-icon-box — у макеті малюється в 40px, тому й сітка 40 */
export function BoxIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path
        transform="translate(5.6667 4)"
        d="M1 8.5V23.5L14.3333 31L27.6667 23.5V8.5L14.3333 1L1 8.5ZM27.6667 8.5L14.3333 16M14.3333 31V16M1 8.5L14.3333 16"
      />
    </svg>
  );
}
