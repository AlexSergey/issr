export default function Html({ children, title }) {
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="description" content="iSSR example with React 18" />
      <title>{title}</title>
    </head>
    <body>
    <noscript
      dangerouslySetInnerHTML={{
        __html: `<b>Enable JavaScript to run this app.</b>`,
      }}
    />
    <div id="root">{children}</div>
    </body>
    </html>
  );
}
