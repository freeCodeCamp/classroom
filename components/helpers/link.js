import NextLink from 'next/link';

/**
 * Mirrors freeCodeCamp's client/src/components/helpers/link.tsx:
 * - Internal paths (starting with a single "/") use Next's client-side router.
 * - External links open in a new tab unless `sameTab` is set.
 */
export default function Link({ children, to, external, sameTab, ...other }) {
  if (!external && /^\/(?!\/)/.test(to)) {
    return (
      <NextLink href={to} {...other}>
        {children}
      </NextLink>
    );
  } else if (sameTab && external) {
    return (
      <a href={to} {...other}>
        {children}
      </a>
    );
  }

  return (
    <a href={to} {...other} rel='noopener noreferrer' target='_blank'>
      {children}
    </a>
  );
}
