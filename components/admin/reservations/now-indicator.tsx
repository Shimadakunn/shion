"use client";

import { useState, useEffect } from "react";
import { getCurrentMinutes, minutesToTime } from "./utils";

export function useCurrentMinutes() {
  const [minutes, setMinutes] = useState(getCurrentMinutes);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      setMinutes(getCurrentMinutes());
      interval = setInterval(() => setMinutes(getCurrentMinutes()), 60_000);
    }, msUntilNextMinute);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return minutes;
}

export function NowMarker({ nowMinutes }: { nowMinutes: number }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
      <div className="flex-1 h-[1.5px] bg-red-500" />
      <span className="text-[9px] font-medium text-red-500 tabular-nums shrink-0">
        {minutesToTime(nowMinutes)}
      </span>
    </div>
  );
}
