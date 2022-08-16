import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { useRegisterEffect } from '@issr/core';

const books = [
  {
    __typename: 'Book',
    id: '1',
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    read: false
  },
  {
    __typename: 'Book',
    id: '2',
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    read: true
  },
];

export const typeDefs = gql`
  type Query {
    books: Book
  }

  type Book {
    id: String
    title: String
  }
`;

const asyncFn = () => new Promise((resolve) => setTimeout(() => resolve(books), 1000));

export const resolvers = {
  Query: {
    books: async () => await asyncFn()
  }
};

const GET_BOOKS = gql`
  query {
    books @client {
      id
      title
      read
    }
  }
`;

export const App = () => {
  useRegisterEffect();
  let { data } = useQuery(GET_BOOKS);

  const loaded = data && data.books && Array.isArray(data.books);
  return (
    <div>
      {!data && <h3>Loading...</h3>}
      {loaded && data.books.map(book => (
        <div key={book.id}>
          <h4>{book.title}</h4>
          <p>{book.author}</p>
        </div>
      ))}
    </div>
  );
};
