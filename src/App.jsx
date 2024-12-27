import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import "./app.css"
import InfiniteScroll from "./InfiniteScroll";

const App = () => {
  return (
    <ApolloProvider client={client}>
      <InfiniteScroll />
    </ApolloProvider>
  );
};

export default App;