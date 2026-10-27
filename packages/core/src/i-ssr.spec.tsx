import { renderToString } from 'react-dom/server';

import { createSsr, ExcludeSsr } from './i-ssr';

// onlyClient mode: no hydration, ExcludeSsr renders children immediately
const SSR = createSsr({}, { onlyClient: true });

describe('ExcludeSsr tests', () => {
  test('renders multiple children on the client', () => {
    const result = renderToString(
      <SSR>
        <ExcludeSsr>
          <span>a</span>
          <span>b</span>
        </ExcludeSsr>
      </SSR>,
    );

    expect(result).toBe('<span>a</span><span>b</span>');
  });

  test('renders text children on the client', () => {
    expect(
      renderToString(
        <SSR>
          <ExcludeSsr>text</ExcludeSsr>
        </SSR>,
      ),
    ).toBe('text');
  });

  test('renders function children on the client', () => {
    expect(
      renderToString(
        <SSR>
          <ExcludeSsr>{() => <b>fn</b>}</ExcludeSsr>
        </SSR>,
      ),
    ).toBe('<b>fn</b>');
  });
});

describe('ExcludeSsr without provider', () => {
  test('renders nothing until mounted', () => {
    expect(renderToString(<ExcludeSsr>text</ExcludeSsr>)).toBe('');
  });
});
