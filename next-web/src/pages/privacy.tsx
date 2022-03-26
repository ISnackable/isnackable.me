/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import Image from "next/image";
import { Anchor, Container, Title, Text, List } from "@mantine/core";
import SEO from "@components/SEO";
import { socialUsername } from "@lib/config";
import svgImage from "../../public/svg/undraw_personal_information_re_vw8a.svg";

const PrivacyPage: NextPage = () => {
  return (
    <>
      <SEO
        title="Privacy policy"
        description="The privacy of your data — and it is your data, not ours! — is a big deal to me. Here's the rundown of what I collect and why, when I access your information, and your rights."
      />
      <section>
        <Container size="sm" mb="xl">
          <Title order={1} mt="xl">
            Privacy policy
          </Title>
          <Text size="md" mb="xl">
            <em>Last updated: March 24, 2022</em>
          </Text>
          <Title order={2} my="lg">
            In short
          </Title>

          <List withPadding>
            <List.Item> No personal information is collected</List.Item>
            <List.Item>
              No information such as cookies is stored in the browser
            </List.Item>
            <List.Item>
              No information is shared with, sent to or sold to third-parties
            </List.Item>
            <List.Item>
              No information is shared with advertising companies
            </List.Item>
            <List.Item>
              No information is mined and harvested for personal and behavioural
              trends
            </List.Item>
            <List.Item>No information is monetized</List.Item>
          </List>

          <Text size="md" mt="md" mb={30}>
            I use the open source Plausible Analytics to count website visits,
            downloads, etc. It is a GDPR, CCPA and cookie law compliant site
            analytics tool. You can see the same data I can see on the{" "}
            <Anchor
              href="https://plausible.io/isnackable.me"
              target="_blank"
              rel="noopener noreferrer"
            >
              public dashboard
            </Anchor>
            . No cookies are used and no personal data — not even an IP address
            or browser user agent — is stored. For more information, see the{" "}
            <Anchor
              href="https://plausible.io/data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Plausible Data Policy
            </Anchor>
            .
          </Text>
          <Image
            src={svgImage}
            layout="responsive"
            alt="Undraw personal information logo"
            priority
          />

          <Title order={2} id="what-I-collect-and-why" mt={30} mb="lg">
            What I collect and why
          </Title>
          <Text size="md" my="md">
            Our guiding principle is to collect only what I need. Here&apos;s
            what that means in practice:
          </Text>

          <Title order={3} id="website-interactions" my="lg">
            Website interactions
          </Title>
          <Text size="md" my="md">
            When you browse to my pages, your browser automatically shares
            certain information such as which operating system and browser
            version you are using. I track that information, along with the
            pages you are visiting, page load timing, and which website referred
            you for statistical purposes like conversion rates and to test new
            designs.
          </Text>
          <Text size="md" my="md">
            These web analytics data are tied to your IP address. The analytics
            I used is Plausible, an open source GDPR, CCPA and cookie law
            compliant site analytics tool. You can see the same data I can see
            on the{" "}
            <Anchor
              href="https://plausible.io/isnackable.me"
              target="_blank"
              rel="noopener noreferrer"
            >
              public dashboard
            </Anchor>{" "}
            No cookies are used and no personal data — not even an IP address or
            browser user agent — is stored. For more information, see the{" "}
            <Anchor
              href="https://plausible.io/data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Plausible Data Policy
            </Anchor>
            .
          </Text>

          <Title order={2} id="information-I-do-not-collect" my="lg">
            Information I do not collect
          </Title>
          <Text size="md" my="md">
            I don&apos;t collect any characteristics of protected
            classifications including age, race, gender, religion, sexual
            orientation, gender identity, gender expression, or physical and
            mental abilities or disabilities.{" "}
            <strong>
              This website is not capable collecting such informations
            </strong>
            .
          </Text>

          <Title order={2} id="when-i-access-or-share-your-information" my="lg">
            When I access or share your information
          </Title>
          <Text size="md" my="md">
            Our default practice is to not access your information. I am not
            able to tie this information to you as an individual. The only times
            I&apos;ll ever access or share your info is:
          </Text>
          <List>
            <List.Item>
              <strong>For statistical purposes.</strong> It is only used to view
              current page visitors. This information is used to get valuable
              stats to help me improve my efforts on the website.
            </List.Item>
          </List>

          <Title order={2} id="how-I-secure-your-data" my="lg">
            How I secure your data
          </Title>
          <Text size="md" my="md">
            All data is encrypted via{" "}
            <Anchor
              href="https://en.wikipedia.org/wiki/Transport_Layer_Security"
              target="_blank"
              rel="noopener noreferrer"
            >
              SSL/TLS
            </Anchor>{" "}
            when transmitted from your browser to Plausible&apos;s Analytics
            server.
          </Text>

          <Title order={2} id="changes-questions" my="lg">
            Changes &amp; questions
          </Title>
          <Text size="md" my="md">
            I may update this policy as needed to comply with relevant
            regulations and reflect any new practices. You can view a history of
            the changes to our policies since early-2022{" "}
            <Anchor
              href={`https://github.com/${socialUsername}/isnackable.me`}
              target="_blank"
              rel="noopener noreferrer"
            >
              on GitHub
            </Anchor>
            .
          </Text>
        </Container>
      </section>
    </>
  );
};

export default PrivacyPage;
