'use client';
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { languageCookie, localizedPath } from '../translations/routing';
import type { Language } from '../translations/language';
import { initialExploreState } from './explore/explore-utils';
import type { ExploreState } from './explore/explore-types';
import type { AgendaState } from './events/event-types';
type ContextValue = {
  exploreState: ExploreState;
  setExploreState: Dispatch<SetStateAction<ExploreState>>;
  language: Language;
  setLanguage(language: Language): void;
  state: AgendaState | null;
  setState(state: AgendaState): void;
};
const SiteContext = createContext<ContextValue | null>(null);
export function SiteProvider({
  children,
  language,
}: {
  children: ReactNode;
  language: Language;
}) {
  const setLanguage = (nextLanguage: Language) => {
    document.cookie = `${languageCookie}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    if (nextLanguage === language) return;
    window.location.assign(
      localizedPath(window.location.pathname, nextLanguage) +
        window.location.search +
        window.location.hash,
    );
  };
  const [exploreState, setExploreState] = useState(initialExploreState);
  const [state, setState] = useState<AgendaState | null>(null);
  return (
    <SiteContext.Provider
      value={{ language, setLanguage, state, setState, exploreState, setExploreState }}
    >
      {children}
    </SiteContext.Provider>
  );
}
function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw Error('SiteProvider is required');
  return value;
}
export function useSiteLanguage() {
  const { language, setLanguage } = useSite();
  return { language, setLanguage };
}
export function useAgendaState() {
  const { state, setState } = useSite();
  return { state, setState };
}

export function useExploreState() {
  const { exploreState, setExploreState } = useSite();
  return { state: exploreState, setState: setExploreState };
}
