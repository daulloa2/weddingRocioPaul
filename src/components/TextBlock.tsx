// components/TextBlock.tsx
"use client";

export default function TextBlock({
  title,
  paragraphs,
  className,
  titleClassName,
  paragraphClassName,
}: {
  title?: string;
  paragraphs: string[];
  className?: string;
  titleClassName?: string;
  paragraphClassName?: string;
}) {
  return (
    <div
      className={`sm:rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className ?? ""}`}
    >
      {title && (
        <h2
          className={`text-center mb-2 text-slate-800 ${titleClassName ?? ""}`}
        >
          {title}
        </h2>
      )}
      <div className="space-y-2 text-sm text-slate-700 text-[15px] sm:text-[20px]">
        {paragraphs.map((p, i) => (
          <p key={i} className={paragraphClassName}>{p}</p>
        ))}
      </div>
    </div>
  );
}
