import React from "react";
import { Link } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import logo from "../images/undraw_page_not_found_su-7-k-cropped.svg";

const NotFoundPage = () => {
  return (
    <Layout>
      <Seo title={"Page Not Found"} />
      <section className="px-4 py-24 mx-auto max-w-7xl">
        <div className="grid items-center w-full grid-cols-1 gap-10 mx-auto md:w-4/5 lg:grid-cols-2 xl:gap-32">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide uppercase">
              Error 404
            </p>
            <h1 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-left  md:text-4xl">
              Oops! The page you're looking for isn't here.
            </h1>
            <p className="mb-5 text-base text-left text-gray-300 md:text-xl">
              You might have the wrong address, or the page may have moved.
            </p>
            <Link
              to="/"
              className="w-full mb-2 sm:w-auto sm:mb-0 bg-gray-200 hover:bg-gray-500 hover:text-white text-gray-500 text-center py-2 px-4 rounded"
            >
              Back to homepage
            </Link>
          </div>
          <div>
            <img
              className="object-cover object-center w-full rounded-xl"
              alt="logo"
              src={logo}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFoundPage;
