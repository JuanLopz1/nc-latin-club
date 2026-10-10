import raw from './countries.json';
import type { Country } from './explore-types';
export const countries = raw as Country[];
export const prototypeCountries = countries.filter(c => ['colombia', 'brasil', 'mexico', 'jamaica', 'haiti', 'curazao'].includes(c.slug));
for (const c of countries) {
  if (!c.slug || !c.name.en || !c.name.es || !c.intro.en || !c.intro.es || !Number.isFinite(c.center.lat) || !Number.isFinite(c.center.lng) || !c.sources.length) throw Error('Invalid roots destination: ' + c.slug);
}
if (new Set(countries.map(c => c.slug)).size !== countries.length) throw Error('Duplicate roots destination');
