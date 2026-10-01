import { useRouter } from 'next/router';
import { Button } from '@freecodecamp/ui';

const isInternal = href => /^\/(?!\/)/.test(href);

const isModifiedClick = event =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

/**
 * A link that looks like a button, based on freeCodeCamp's
 * client/src/components/helpers/button-link.tsx.
 *
 * fCC renders internal links through Gatsby's Link with legacy `.btn` classes
 * that aren't part of @freecodecamp/ui. Here, @freecodecamp/ui's Button always
 * renders the `<a>` (so styles come from the library), and plain left-clicks on
 * internal links are handed to Next's router for client-side navigation.
 * Modified clicks (ctrl/cmd/middle) keep the browser's default behavior.
 */
export default function ButtonLink({
  href,
  onClick,
  target,
  size = 'medium',
  ...rest
}) {
  const router = useRouter();

  const handleClick = event => {
    if (onClick) {
      onClick(event);
    }
    if (
      event.defaultPrevented ||
      !isInternal(href) ||
      target === '_blank' ||
      isModifiedClick(event)
    ) {
      return;
    }
    event.preventDefault();
    router.push(href);
  };

  return (
    <Button
      variant='primary'
      href={href}
      target={target}
      size={size}
      onClick={handleClick}
      {...rest}
    />
  );
}
