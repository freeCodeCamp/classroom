import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          {/* @freecodecamp/ui sets the font stacks but doesn't bundle the font files. */}
          <link
            href='https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap'
            rel='stylesheet'
          />
        </Head>
        {/* Classroom is light-theme only for now. fCC UI's getThemingClass()
            reads window, so the palette class is set statically instead. */}
        <body className='light-palette'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
