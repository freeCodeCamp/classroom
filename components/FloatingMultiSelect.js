import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MultiSelect } from 'react-multi-select-component';

/**
 * Wraps react-multi-select-component and renders it into a portal on
 * document.body, positioned over an in-flow anchor element.
 *
 * react-multi-select-component has no built-in floating/portal option, and
 * its dropdown panel is absolutely positioned relative to its own wrapper.
 * When that wrapper sits inside a scrollable ancestor (e.g. a modal panel
 * with `overflow-auto`), the open panel gets clipped by that boundary.
 * Portaling the whole widget out to document.body sidesteps the clipping
 * entirely, at the cost of manually tracking the anchor's position.
 *
 * This is a deliberately lightweight fix (no new dependency). If positioning
 * needs get more advanced later (e.g. flipping above the anchor near the
 * viewport edge), consider swapping to a library with native floating
 * support (e.g. react-select's menuPortalTarget, or @floating-ui/react).
 */
export default function FloatingMultiSelect(props) {
  const anchorRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [mounted, setMounted] = useState(false);

  const updateRect = () => {
    if (anchorRef.current) {
      setRect(anchorRef.current.getBoundingClientRect());
    }
  };

  useLayoutEffect(() => {
    setMounted(true);
    updateRect();
  }, []);

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    window.addEventListener('resize', updateRect);
    // 'scroll' doesn't bubble, so listen on the capture phase to also catch
    // scrolling inside the modal panel, not just the window itself.
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [mounted]);

  return (
    <>
      <div ref={anchorRef} className='min-h-[42px]' />
      {mounted &&
        rect &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              zIndex: 60
            }}
          >
            <MultiSelect {...props} onMenuToggle={updateRect} />
          </div>,
          document.body
        )}
    </>
  );
}
