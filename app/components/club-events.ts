import { agendaEntries } from "./events/agenda-data";
import type { EventEntry } from "./events/event-types";
export type ClubEvent = EventEntry;
export const clubEvents = agendaEntries.filter((entry): entry is EventEntry => entry.kind === "event" && entry.category === "at-nc");
