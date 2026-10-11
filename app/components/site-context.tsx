'use client';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { persistLanguage, readLanguage, serverLanguage, subscribeLanguage } from './language-store';
import type { Language } from './home-copy';
import { initialExploreState } from './explore/explore-utils';
import type { ExploreState } from './explore/explore-types';
import type { AgendaState } from './events/event-types';
type ContextValue = { exploreState: ExploreState; setExploreState: Dispatch<SetStateAction<ExploreState>>; language: Language; setLanguage(language: Language): void; state: AgendaState | null; setState(state: AgendaState): void };
const SiteContext = createContext<ContextValue | null>(null);
export function SiteProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, readLanguage, serverLanguage);
  const setLanguage = persistLanguage;
  const [exploreState, setExploreState] = useState(initialExploreState);
  const [state, setState] = useState<AgendaState | null>(null);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <SiteContext.Provider value={{ language, setLanguage, state, setState, exploreState, setExploreState }}>{children}</SiteContext.Provider>;
}
function useSite() { const value = useContext(SiteContext); if (!value) throw Error('SiteProvider is required'); return value; }
export function useSiteLanguage() { const { language, setLanguage } = useSite(); return { language, setLanguage }; }
export function useAgendaState() { const { state, setState } = useSite(); return { state, setState }; }

export function useExploreState() { const { exploreState, setExploreState } = useSite(); return { state: exploreState, setState: setExploreState }; }
