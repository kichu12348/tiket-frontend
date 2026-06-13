"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Ticket,
  ClipboardList,
  Settings,
  ChevronLeft
} from "lucide-react";
import styles from "./SidebarNav.module.css";

interface SidebarNavProps {
  eventId: string;
}

export default function SidebarNav({ eventId }: SidebarNavProps) {
  const pathname = usePathname();

  const links = [
    { href: `/edit/${eventId}/overview`, label: "Overview", icon: LayoutDashboard },
    { href: `/edit/${eventId}/details`, label: "Details", icon: FileText },
    { href: `/edit/${eventId}/tickets`, label: "Tickets", icon: Ticket },
    { href: `/edit/${eventId}/forms`, label: "Forms", icon: ClipboardList },
    { href: `/edit/${eventId}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <nav className={styles.sidebar}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backLink}>
          <ChevronLeft size={16} />
          <span>Dashboard</span>
        </Link>
        <h2 className={styles.title}>Edit Event</h2>
      </div>

      <ul className={styles.navList}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
