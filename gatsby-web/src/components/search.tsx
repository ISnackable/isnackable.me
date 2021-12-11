// import React from "react";
// import algoliasearch from "algoliasearch/lite";
// import {
//   Configure,
//   connectHits,
//   InstantSearch,
//   SearchBox,
//   Hits,
// } from "react-instantsearch-dom";

// const algoliaClient = algoliasearch(
//   process.env.GATSBY_ALGOLIA_APP_ID,
//   process.env.GATSBY_ALGOLIA_SEARCH_KEY
// );

// const searchClient = {
//   ...algoliaClient,
//   search(requests) {
//     if (requests.every(({ params }) => !params.query)) {
//       return [];
//     }

//     return algoliaClient.search(requests);
//   },
// };

// export default function Search() {
//   return (
//     <InstantSearch
//       indexName={process.env.GATSBY_ALGOLIA_INDEX_NAME}
//       searchClient={searchClient}
//     >
//       {/* Here's the change */}
//       <Configure distinct />
//       <SearchBox />
//       <Hits />
//     </InstantSearch>
//   );
// }
