/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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

  const [scrollPosition, setScrollPosition] = useState(0);
  let previousScrollTop = 0;

  const handleDocumentScroll = () => {
    const { scrollTop: currentScrollTop } =
      document.documentElement || document.body;

    if (_isMounted.current) {
      previousScrollTop = scrollPosition;
      setScrollPosition(currentScrollTop);
    }

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
