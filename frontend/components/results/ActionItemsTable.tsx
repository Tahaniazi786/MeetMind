"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ActionItem } from "@/context/MeetingContext";

interface Props {
  items: ActionItem[];
}

type SortKey = "priority" | "owner" | "deadline";

const priorityOrder = { high: 0, medium: 1, low: 2 };
const priorityColor = {
  high: "bg-status-high/15 text-status-high border-status-high/30",
  medium: "bg-status-medium/15 text-status-medium border-status-medium/30",
  low: "bg-status-low/15 text-status-low border-status-low/30",
};

export default function ActionItemsTable({ items }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("priority");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...items].sort((a, b) => {
    if (sortBy === "priority") {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortAsc ? diff : -diff;
    }
    const av = a[sortBy] || "";
    const bv = b[sortBy] || "";
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortBy === key ? (sortAsc ? " ↑" : " ↓") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card rounded-xl border border-bg-border overflow-hidden"
    >
      <div className="px-6 pt-5 pb-4">
        <h2 className="font-display font-bold text-lg">
          ✅ Action Items
          <span className="ml-2 text-text-muted font-mono text-sm font-normal">({items.length})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-bg-border bg-bg">
              <th className="text-left py-3 px-6 font-mono text-xs text-text-dim uppercase tracking-wide">
                Task
              </th>
              <th
                onClick={() => handleSort("owner")}
                className="text-left py-3 px-4 font-mono text-xs text-text-dim uppercase tracking-wide cursor-pointer hover:text-accent transition-colors"
              >
                Owner{sortIndicator("owner")}
              </th>
              <th
                onClick={() => handleSort("deadline")}
                className="text-left py-3 px-4 font-mono text-xs text-text-dim uppercase tracking-wide cursor-pointer hover:text-accent transition-colors"
              >
                Deadline{sortIndicator("deadline")}
              </th>
              <th
                onClick={() => handleSort("priority")}
                className="text-left py-3 px-4 font-mono text-xs text-text-dim uppercase tracking-wide cursor-pointer hover:text-accent transition-colors"
              >
                Priority{sortIndicator("priority")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-bg-border/50 hover:bg-bg-hover/50 transition-colors"
              >
                <td className="py-3 px-6 text-text max-w-[300px]">{item.task}</td>
                <td className="py-3 px-4">
                  <span className="font-mono text-accent">{item.owner}</span>
                </td>
                <td className="py-3 px-4 font-mono text-text-muted text-xs">{item.deadline}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border ${priorityColor[item.priority]}`}
                  >
                    {item.priority}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="px-6 py-8 text-center text-text-dim font-mono text-sm">
          No action items detected.
        </div>
      )}
    </motion.div>
  );
}
