import { secondaryButtonClass } from "@/lib/styles";

interface PagerProps {
  skip: number;
  pageSize: number;
  count: number; // how many rows the current page returned
  onChange: (skip: number) => void;
}

// Previous / Next for the admin lists. A page with fewer rows than pageSize is the last one.
export default function Pager({ skip, pageSize, count, onChange }: PagerProps) {
  if (skip === 0 && count < pageSize) return null;
  return (
    <div className="mt-6 flex justify-between">
      <button
        type="button"
        disabled={skip === 0}
        onClick={() => onChange(Math.max(0, skip - pageSize))}
        className={secondaryButtonClass}
      >
        Previous
      </button>
      <button
        type="button"
        disabled={count < pageSize}
        onClick={() => onChange(skip + pageSize)}
        className={secondaryButtonClass}
      >
        Next
      </button>
    </div>
  );
}