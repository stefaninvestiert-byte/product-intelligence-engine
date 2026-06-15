"use client";

type CopyableItemProps = {
  text: string;
  prefix?: React.ReactNode;
  className?: string;
};

export default function CopyableItem({ text, prefix, className = "" }: CopyableItemProps) {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-700 rounded-lg p-3 text-slate-300 text-sm cursor-pointer hover:border-blue-500/50 transition-colors ${className}`}
      onClick={() => navigator.clipboard.writeText(text)}
      title="Klicken zum Kopieren"
    >
      {prefix}
      {text}
    </div>
  );
}

export function CopyablePrimaryText({ text }: { text: string }) {
  return (
    <div
      className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap cursor-pointer hover:border-blue-500/50 transition-colors"
      onClick={() => navigator.clipboard.writeText(text)}
      title="Klicken zum Kopieren"
    >
      {text}
    </div>
  );
}
