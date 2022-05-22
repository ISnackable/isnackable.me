/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { LazyMotion, domAnimation, m } from "framer-motion";
import styles from "./layout.module.css";

// this is causing some issue with unmount memory leak warning
// const domAnimation = async () => (await import("./features")).default;
const Header = dynamic(() => import("../Header"));
const Footer = dynamic(() => import("../Footer"));

const AppLayout: NextPage<{ children: React.ReactNode }> = (
  props
): JSX.Element => {
  const router = useRouter();
  const { children } = props;

  return (
    <>
      <Header />
      <LazyMotion features={domAnimation}>
        <m.main
          key={router.asPath}
          className={styles.main}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </m.main>
      </LazyMotion>
      <Footer />
    </>
  );
};

export default AppLayout;
