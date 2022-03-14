import type { NextPage } from "next";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  createStyles,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid
} from "@mantine/core";
import SEO from "@components/SEO";
import svgImage from "../../public/svg/undraw_page_not_found_su-7-k-cropped.svg";

const useStyles = createStyles((theme) => ({
  title: {
    fontWeight: 900,
    fontSize: 34,
    marginBottom: theme.spacing.md,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 32
    }
  },

  control: {
    [theme.fn.smallerThan("sm")]: {
      width: "100%"
    }
  },

  mobileImage: {
    [theme.fn.largerThan("sm")]: {
      display: "none"
    }
  },

  desktopImage: {
    [theme.fn.smallerThan("sm")]: {
      display: "none"
    }
  }
}));

const FourOhFourPage: NextPage = () => {
  const { classes } = useStyles();

  return (
    <>
      <SEO title={"Page Not Found"} />
      <section>
        <Container size="xl" px={20} my={96}>
          <SimpleGrid
            spacing={80}
            cols={2}
            breakpoints={[{ maxWidth: "sm", cols: 1, spacing: 40 }]}
          >
            <div>
              <Title className={classes.title}>
                Oops! The page you&apos;re looking for isn&apos;t here.
              </Title>
              <Text color="dimmed" size="lg">
                Page you are trying to open does not exist. You may have
                mistyped the address, or the page has been moved to another URL.
                If you think this is an error, please contact me.
              </Text>
              <Link href="/" passHref>
                <Button
                  component="a"
                  variant="outline"
                  size="md"
                  mt="xl"
                  className={classes.control}
                >
                  Back to homepage
                </Button>
              </Link>
            </div>
            <Image
              className={classes.mobileImage}
              src={svgImage}
              alt="Hero"
              layout="responsive"
              priority
            />
          </SimpleGrid>
        </Container>
      </section>
    </>
  );
};

export default FourOhFourPage;
