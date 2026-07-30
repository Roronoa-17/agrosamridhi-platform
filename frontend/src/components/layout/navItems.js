import {
  LayoutDashboard,
  CloudSun,
  LineChart,
  FileText,
  Sparkles,
  UserCircle,
} from "lucide-react";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/weather", label: "Weather", icon: CloudSun },
  { to: "/mandi", label: "Mandi Prices", icon: LineChart },
  { to: "/schemes", label: "Govt Schemes", icon: FileText },
  { to: "/ai", label: "AI Tools", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: UserCircle },
];
