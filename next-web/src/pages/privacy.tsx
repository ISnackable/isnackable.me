/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Image from "next/image";
import { Container, Title, Text } from "@mantine/core";
import SEO from "@components/SEO";
import svgImage from "../../public/svg/undraw_personal_information_re_vw8a.svg";

const PrivacyPage: NextPage = () => {
  return (
    <>
      <SEO title={"Privacy"} />
      <section>
        <Container size="sm" mb="xl">
          <Title order={1} my="xl">
            Privacy Policy
          </Title>
          <Title order={2} my="md">
            In short
          </Title>
          <Text size="md" my="md">
            I don&apos;t store you data.
          </Text>
          <Text size="md" my="md">
            This website is hosted on Vercel, which is just a static site
            hosting platform. There isn&apos;t any place to store any
            information collected. Vercel might see your IP address when you are
            visiting to my website, but that is the nature of visiting a
            website.
          </Text>
          <Image
            src={svgImage}
            layout="responsive"
            alt="Undraw personal information logo"
            priority
          />
        </Container>
      </section>
    </>
  );
};

export default PrivacyPage;
