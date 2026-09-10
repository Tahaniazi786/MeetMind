"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ActionItem } from "@/context/MeetingContext";

interface Props {
  items: ActionItem[];
}

type SortKey = "priority" | "owner" | "deadline";

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
const priorityColor: Record<string, string> = {
  high: "bg-status-high/15 text-status-high border-status-high/30",
  medium: "bg-status-medium/15 text-status-medium border-status-medium/30",
  low: "bg-status-low/15 text-status-low border-status-low/30",
};

export default function ActionItemsTable({ items: initialItems }: Props) {
  const [items, setItems] = useState<(ActionItem & { completed?: boolean })[]>(initialItems);
  const [sortBy, setSortBy] = useState<SortKey>("priority");
  const [sortAsc, setSortAsc] = useState(true);

  const toggleComplete = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((i) => i.completed).length;

  const sorted = [...items].sort((a, b) => {
    // Keep completed items at the bottom if sorted
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (sortBy === "priority") {
      const pA = priorityOrder[a.priority?.toLowerCase()] ?? 1;
      const pB = priorityOrder[b.priority?.toLowerCase()] ?? 1;
      const diff = pA - pB;
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
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <span>✅ Action Items</span>
          <span className="text-text-muted font-mono text-sm font-normal">
            ({completedCount}/{items.length} completed)
          </span>
        </h2>
        {completedCount > 0 && (
          <span className="text-xs font-mono font-bold text-status-low bg-status-low/10 px-2.5 py-1 rounded-md border border-status-low/20">
            {Math.round((completedCount / items.length) * 100)}% Done
          </span>
        )}
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
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleComplete(i)}
                className={`border-b border-bg-border/50 hover:bg-bg-hover/50 transition-colors cursor-pointer ${
                  item.completed ? "opacity-60 bg-bg/40" : ""
                }`}
              >
                <td className="py-3.5 px-6 text-text max-w-[320px]">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!item.completed}
                      onChange={() => toggleComplete(i)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 accent-accent w-4 h-4 rounded cursor-pointer"
                    />
                    <span className={item.completed ? "line-through text-text-muted" : "font-medium"}>
                      {item.task}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-accent font-semibold">{item.owner}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-text-muted text-xs">{item.deadline}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      priorityColor[item.priority?.toLowerCase()] || priorityColor.medium
                    }`}
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
