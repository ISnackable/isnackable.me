import React from "react";
import { Link } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import logo from "../images/undraw_personal_information_re_vw8a.svg";

const PrivacyPage = () => {
  return (
    <Layout>
      <Seo title={"Privacy"} />
      <section>
        <div className="container flex flex-col items-center px-5 py-8 mx-auto  max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col w-full max-w-3xl mx-auto prose text-left prose-blue">
            <div className="w-full mx-auto">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white mb-5">
                Privacy Policy
              </h1>
              <h2 className="text-white title-font font-medium mb-4">
                In short
              </h2>
              <p>I don't store you data.</p>
              <p>
                This website is hosted on GitHub Pages, which is just a static
                site. There isn't any place to store any information collected.
                GitHub might see your IP address when visiting to my website,
                but that is the nature of visiting a website.
              </p>
              <img
                className="object-cover object-center w-full rounded-xl mt-14"
                width={"100%"}
                height={"100%"}
                alt="Undraw personal information logo"
                src={logo}
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
