import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Container } from "@mantine/core";
import SEO from "@components/SEO";

const Redirect = dynamic(() => import("@components/Redirect"), {
  ssr: false
});

const FilesPage: NextPage = () => {
  return (
    <>
      <SEO title={"Files"} />
      <section>
        <Container size="sm" my="xl">
          <Redirect link="https://files.isnackable.me/" timer={3000} />
        </Container>
      </section>
    </>
  );
};

export default FilesPage;
