import type { Id } from "@/convex/_generated/dataModel";

export type ViewMode = "3days" | "day";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no_show"
  | "completed"
;

export type Reservation = {
  _id: Id<"reservations">;
  date: string;
  time: string;
  service: string;
  partySize: number;
  name: string;
  email: string;
  phone?: string;
  status: ReservationStatus;
  notes?: string;
};

export type ServicePeriod = {
  name: string;
  openTime: string;
  closeTime: string;
  maxCovers: number;
};
