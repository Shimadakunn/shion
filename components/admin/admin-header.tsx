"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminHeaderContent = {
  title?: ReactNode;
  actions?: ReactNode;
};

type AdminHeaderContextValue = {
  header: AdminHeaderContent | null;
  setHeader: (header: AdminHeaderContent | null) => void;
};

const AdminHeaderContext = createContext<AdminHeaderContextValue | null>(null);

export function AdminHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<AdminHeaderContent | null>(null);

  const value = useMemo(
    () => ({ header, setHeader }),
    [header],
  );

  return (
    <AdminHeaderContext.Provider value={value}>
      {children}
    </AdminHeaderContext.Provider>
  );
}

export function useAdminHeader(header: AdminHeaderContent | null) {
  const context = useContext(AdminHeaderContext);

  if (!context)
    throw new Error("useAdminHeader must be used within AdminHeaderProvider.");

  const { setHeader } = context;

  useEffect(() => {
    setHeader(header);
    return () => setHeader(null);
  }, [setHeader, header]);
}

export function useAdminHeaderContent() {
  const context = useContext(AdminHeaderContext);

  if (!context)
    throw new Error(
      "useAdminHeaderContent must be used within AdminHeaderProvider.",
    );

  return context.header;
}
