const MODE = {
  development: 'development',
  production: 'production',
  test: 'test',
};
const isProduction = () => process.env.NODE_ENV === 'production';

const isNotProduction = () => process.env.NODE_ENV !== 'production';

export default MODE[process.env.NODE_ENV];

export { isNotProduction, isProduction };
