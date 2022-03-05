import { useEffect, useState, useRef } from "react";
import throttle from "lodash/throttle";

export interface Param {
  previousScrollTop: number;
  currentScrollTop: number;
}

const useDocumentScrollThrottled = (
  callback: ({ previousScrollTop, currentScrollTop }: Param) => void
) => {
  const _isMounted = useRef(false);

  const [, setScrollPosition] = useState(0);
  let previousScrollTop = 0;

  const handleDocumentScroll = () => {
    const { scrollTop: currentScrollTop } =
      document.documentElement || document.body;

    if (_isMounted.current)
      setScrollPosition((previousPosition) => {
        previousScrollTop = previousPosition;
        return currentScrollTop;
      });

    callback({ previousScrollTop, currentScrollTop });
  };

  const handleDocumentScrollThrottled = throttle(handleDocumentScroll, 250);

  useEffect(() => {
    _isMounted.current = true;
    window.addEventListener("scroll", handleDocumentScrollThrottled);

    return () => {
      _isMounted.current = false;
      window.removeEventListener("scroll", handleDocumentScrollThrottled);
    };
  }, [handleDocumentScrollThrottled]);
};

export default useDocumentScrollThrottled;
