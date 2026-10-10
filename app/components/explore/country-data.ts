import raw from './countries.json';
import { getCulturePage } from './culture-data';
import type { Country } from './explore-types';
export const countries: Country[] = (raw as Country[]).map(c => ({ ...c, culturalStatus: getCulturePage(c.slug) ? 'reviewed' : 'pending' }));
export const prototypeCountries = countries.filter(c => ['colombia', 'brasil', 'mexico', 'jamaica', 'haiti', 'curazao'].includes(c.slug));
for (const c of countries) {
  if (!c.slug || !c.name.en || !c.name.es || !c.intro.en || !c.intro.es || !Number.isFinite(c.center.lat) || !Number.isFinite(c.center.lng) || !c.sources.length) throw Error('Invalid roots destination: ' + c.slug);
}
if (new Set(countries.map(c => c.slug)).size !== countries.length) throw Error('Duplicate roots destination');
