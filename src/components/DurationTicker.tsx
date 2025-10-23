import { useEffect, useState } from "react";
import { minutesBetween, formatDuration } from "../utils/calculations";

interface DurationTickerProps {
  openedAt: string;
  closedAt?: string;
}

export function DurationTicker({ openedAt, closedAt }: DurationTickerProps) {
  const [duration, setDuration] = useState(() => minutesBetween(openedAt, closedAt));

  useEffect(() => {
    if (closedAt) {
      // Bill đã đóng, không cần update
      setDuration(minutesBetween(openedAt, closedAt));
      return;
    }

    // Update mỗi 30 giây
    const interval = setInterval(() => {
      setDuration(minutesBetween(openedAt));
    }, 30000);

    return () => clearInterval(interval);
  }, [openedAt, closedAt]);

  return <span>{formatDuration(duration)}</span>;
}
