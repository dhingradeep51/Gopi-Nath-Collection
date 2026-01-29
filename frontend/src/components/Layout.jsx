/* ... imports ... */

const Layout = ({ children, title, description, keywords, author }) => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
        
        {/* ✅ ADD THIS LINE FOR FAVICON */}
        <link rel="icon" type="image/png" href="/gopi.jpg" />
        {/* Or if using .ico: <link rel="icon" href="/favicon.ico" /> */}
      </Helmet>
      
      <Header />
      <main style={{ minHeight: "70vh" }}>
        <Toaster />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;