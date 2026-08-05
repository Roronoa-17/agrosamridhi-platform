import {
  LayoutDashboard,
  FlaskConical,
  Sprout,
  Bug,
  FileText,
  Store,
  CloudSun,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/ai/soil-card", label: "Soil Health Card", icon: FlaskConical },
  { to: "/ai/crop-suggestion", label: "AI Crop Suggestion", icon: Sprout },
  { to: "/ai/pest-diagnosis", label: "Pest Diagnosis", icon: Bug },
  { to: "/schemes", label: "Govt Schemes", icon: FileText },
  { to: "/mandi", label: "Mandi Intelligence", icon: Store },
  { to: "/weather", label: "Weather & Advisory", icon: CloudSun },
];
