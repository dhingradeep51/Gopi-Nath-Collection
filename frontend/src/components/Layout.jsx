import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";

const Layout = ({ 
  children, 
  title = "Gopi Nath Collection - Devotional Items", 
  description = "Shop for premium devotional items, idols, and spiritual accessories.", 
  keywords = "Gopi Nath, Devotional, Spiritual, Pooja Items", 
  author = "Deepak" 
}) => {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
        
        {/* ✅ Favicon Implementation */}
        <link rel="icon" type="image/png" href="/gopi.png" />
        
        {/* Apple Touch Icon (Optional but recommended for mobile) */}
        <link rel="apple-touch-icon" href="/gopi.png" />
      </Helmet>
      
      <Header />
      
      <main style={{ minHeight: "75vh" }}>
        <Toaster 
          position="top-center"
          reverseOrder={false}
        />
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;