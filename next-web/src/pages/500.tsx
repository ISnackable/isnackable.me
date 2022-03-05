import type { NextPage } from "next";
import Link from "next/link";
// import Image from "next/image";
import { Button, Container, SimpleGrid, Title, Text } from "@mantine/core";
import SEO from "@components/SEO";
// import svgImage from "../../public/svg/undraw_page_not_found_su-7-k-cropped.svg";

const Custom500: NextPage = () => {
  return (
    <>
      <SEO title={"Error 500"} />
      <section>
        <Container size="xl" padding={20} my={96}>
          <SimpleGrid
            cols={2}
            breakpoints={[{ maxWidth: 1020, cols: 1, spacing: "sm" }]}
          >
            <div>
              <Text size="lg" mb={8}>
                Error 500
              </Text>
              <Title order={1} mb={16}>
                Internal Server Error
              </Title>
              <Link href="/" passHref>
                <Button component="a" color="gray">
                  Back to homepage
                </Button>
              </Link>
            </div>
            <div>
              {/* <Image src={svgImage} alt="Hero" layout="responsive" priority /> */}
            </div>
          </SimpleGrid>
        </Container>
      </section>
    </>
  );
};

export default Custom500;
