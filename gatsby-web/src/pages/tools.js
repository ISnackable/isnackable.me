import React from "react";
import Layout from "../components/layout";
import Seo from "../components/seo";

const ToolsPage = () => {
  return (
    <Layout>
      <Seo
        title={"Tools"}
        description={"A collection of tools I find useful"}
      />
      <section className="text-gray-400 body-font ">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-wrap w-full mb-20 flex-col items-center text-center">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-white">
              Useful Tools
            </h1>
            <p className="lg:w-1/2 w-full leading-relaxed text-opacity-80">
              WIP, Adding tools that I find useful
            </p>
          </div>
          <div className="flex flex-wrap -m-4">
            <div className="xl:w-1/3 md:w-1/2 p-4">
              <div className="border border-gray-700 border-opacity-75 p-6 rounded-lg">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-gray-800 text-blue-400 mb-4">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h2 className="text-lg text-white font-medium title-font mb-2">
                  Tool #1
                </h2>
                <p className="leading-relaxed text-base">Tool Description</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ToolsPage;
