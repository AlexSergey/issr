import loadable from '@loadable/component';

const Home = loadable(() => import('./Home'));
const Secondary = loadable(() => import('./Secondary'));

export const routes = [
  {
    children: [
      {
        element: <Secondary />,
        path: '/secondary',
      },
      {
        element: <Home />,
        path: '/',
      },
    ],
  },
];
