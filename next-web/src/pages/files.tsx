import type { NextPage } from "next";
import { Container } from "@mantine/core";
import SEO from "@components/SEO";
import Redirect from "@components/Redirect";

const FilesPage: NextPage = () => {
  return (
    <>
      <SEO title={"Files"} />
      <section>
        <Container size="sm" mb="xl">
          <Redirect link="https://files.isnackable.me/" timer={3000} />
        </Container>
      </section>
    </>
  );
};

export default FilesPage;
