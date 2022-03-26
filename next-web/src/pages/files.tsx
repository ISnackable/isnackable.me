/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Container } from "@mantine/core";
import SEO from "@components/SEO";
import { directoryUrl } from "@lib/config";

const Redirect = dynamic(() => import("@components/Redirect"), {
  ssr: false
});

const FilesPage: NextPage = () => {
  return (
    <>
      <SEO
        title="Files"
        description="Files page to redirect you my public directory listing."
      />
      <section>
        <Container size="sm" my="xl">
          <Redirect link={directoryUrl} timer={3000} />
        </Container>
      </section>
    </>
  );
};

export default FilesPage;
