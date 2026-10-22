'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { localizedPath } from '../translations/routing';
import { useSiteLanguage } from './site-context';

export default function LocalizedLink({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const { language } = useSiteLanguage();
  const destination =
    typeof href === 'string'
      ? localizedPath(href, language)
      : {
          ...href,
          pathname: href.pathname
            ? localizedPath(href.pathname, language)
            : href.pathname,
        };
  return <NextLink href={destination} {...props} />;
}
