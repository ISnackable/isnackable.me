import type { NextPage } from "next";
import dynamic from "next/dynamic";

const NoSsr: NextPage = ({ children }) => <>{children}</>;

export default dynamic(() => Promise.resolve(NoSsr), { ssr: false });
