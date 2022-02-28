import type { NextPage } from "next";
import Header from "../Header";
import Footer from "../Footer";
import styles from "./layout.module.css";

interface Props {
  colorScheme: string;
  toggleColorScheme: () => void;
}

const AppLayout: NextPage<Props> = (props) => {
  const { children, colorScheme, toggleColorScheme } = props;

  return (
    <>
      <Header colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
};

export default AppLayout;
