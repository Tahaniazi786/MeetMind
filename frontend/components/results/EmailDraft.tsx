"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  email: string;
}

export default function EmailDraft({ email }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGmail = () => {
    const subject = encodeURIComponent("Meeting Follow-up Summary");
    const body = encodeURIComponent(email);
    window.open(`https://mail.google.com/mail/?view=cm&su=${subject}&body=${body}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card rounded-xl border border-bg-border overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="font-display font-bold text-lg">📧 Follow-up Email Draft</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
              copied
                ? "bg-status-low/15 text-status-low border-status-low/30"
                : "bg-bg border-bg-border text-text-muted hover:text-accent hover:border-accent/30"
            }`}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
          <button
            onClick={handleGmail}
            className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
          >
            Open in Gmail →
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-bg rounded-lg border border-bg-border p-5 font-mono text-sm text-text leading-7 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
          {email || "No email draft generated."}
        </div>
      </div>
    </motion.div>
  );
}
