/** Іконки з макета Figma. Розмір і колір задаються ззовні:
    <DeviceImacIcon className="size-8 text-white" /> */
export type IconProps = {
  className?: string;
  /** Товщина обведення в одиницях viewBox. Знадобиться, коли іконку
      малюють у розмірі, відмінному від того, під який зроблена сітка:
      напр. іконка на сітці 24 у полі 40px — це 2 × 24/40 = 1.2 */
  strokeWidth?: number;
};
