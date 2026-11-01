import { renderShareCard } from "@/lib/og";

export const alt = "Dharma Web Services — premium websites that convert";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderShareCard();
}
