require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(isProd ? { cssnano: {} } : {}),
  },
};
