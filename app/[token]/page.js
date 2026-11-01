import { notFound } from "next/navigation";
import AdminPanel from "./AdminPanel";

const ADMIN_TOKEN = () => process.env.ADMIN_SECRET_TOKEN || "dws-admin-2024";

// The private admin area must never be indexed or previewed, and an unknown
// URL must not reveal that a Vault exists (so the title only appears for the real token).
export async function generateMetadata({ params }) {
  const { token } = await params;
  if (token !== ADMIN_TOKEN()) return { title: "Page not found", robots: { index: false, follow: false } };
  return { title: "Dharma Vault", robots: { index: false, follow: false, nocache: true } };
}

export default async function SecretPage({ params }) {
  const { token } = await params;

  if (token !== ADMIN_TOKEN()) {
    notFound();
  }

  return <AdminPanel />;
}
