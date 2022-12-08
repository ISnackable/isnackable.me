/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
        <Container size="xl" px={20} my={96}>
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
              <Link href="/">
                <Button color="gray">Back to homepage</Button>
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
