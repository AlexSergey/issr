import React from 'react';
import { hydrate } from 'react-dom';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { createHttpLink } from 'apollo-link-http';
import { App, resolvers, typeDefs } from './App';
import createSsr from '@issr/core';

const SSR = createSsr();

const link = createHttpLink({
  uri: 'http://localhost:3010'
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache().restore(window.APOLLO_DATA),
  typeDefs,
  resolvers
});

hydrate(
  <SSR>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </SSR>,
  document.getElementById('root')
);
