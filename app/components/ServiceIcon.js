import { Globe, Layers, ShoppingBag, Search, Zap, Gem, Rocket, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";

const MAP = { Globe, Layers, ShoppingBag, Search, Zap, Gem, Rocket, MessageCircle, RefreshCw, ShieldCheck };

export default function ServiceIcon({ name, size = 20 }) {
  const I = MAP[name] || Globe;
  return <span className="icon-tile"><I size={size} aria-hidden="true" /></span>;
}
