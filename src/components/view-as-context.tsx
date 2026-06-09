"use client";

import type { Member } from "@/lib/queries";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "flat_view_as";

type ViewAsContextValue = {
  memberId: string;
  setMemberId: (id: string) => void;
  /** False until localStorage has been read on the client. */
  isReady: boolean;
};

const ViewAsContext = createContext<ViewAsContextValue | null>(null);

export function ViewAsProvider({
  members,
  children,
}: {
  members: Member[];
  children: ReactNode;
}) {
  const defaultMemberId = members[0]?.id ?? "";
  const [memberId, setMemberIdState] = useState(defaultMemberId);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && members.some((m) => m.id === stored)) {
      setMemberIdState(stored);
    } else {
      setMemberIdState(defaultMemberId);
    }
    setIsReady(true);
  }, [members, defaultMemberId]);

  const setMemberId = (id: string) => {
    setMemberIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <ViewAsContext.Provider value={{ memberId, setMemberId, isReady }}>
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAs() {
  const ctx = useContext(ViewAsContext);
  if (!ctx) {
    throw new Error("useViewAs must be used within ViewAsProvider");
  }
  return ctx;
}
