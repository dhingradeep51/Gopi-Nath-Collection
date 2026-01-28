import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ Added for fast navigation
import paytm from '../assets/paytm-icon.svg';
import razorpay from '../assets/razorpay.svg';
import visa from '../assets/visa.svg';

const Footer = () => {
    // BRAND COLORS
    const goldColor = "#D4AF37";
    const darkerBurgundy = "#1a060c"; 

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const footerStyle = {
        backgroundColor: darkerBurgundy,
        color: 'white',
        padding: isMobile ? '40px 0 0 0' : '60px 0 0 0',
        fontFamily: "'Playfair Display', serif",
        borderTop: `1px solid ${goldColor}55`,
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-around',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
    };

    const columnStyle = {
        flex: '1',
        minWidth: '250px',
        marginBottom: '40px',
        padding: '0 20px',
    };

    const headingStyle = {
        color: goldColor,
        fontSize: '18px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '20px',
    };

    const listStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '10px 40px', 
        listStyle: 'none',
        padding: 0,
        margin: 0,
    };

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontSize: '14px',
        opacity: '0.9',
        lineHeight: '2.5',
    };

    const copyrightBarStyle = {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderTop: `1px solid ${goldColor}33`, 
        padding: '30px 20px',
        marginTop: '20px',
    };

    const bottomContentStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        fontSize: '12px',
        opacity: '0.8',
        textAlign: 'center'
    };

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                {/* Brand Column */}
                <div style={columnStyle}>
                    <h2 style={{ color: goldColor, fontFamily: 'cursive', fontStyle: 'italic', marginBottom: '5px', fontSize: '28px' }}>
                        Gopi Nath
                    </h2>
                    <p style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '2px', marginBottom: '15px' }}>
                        Collection
                    </p>
                    <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '20px' }}>
                        A Legacy of Spiritual Grandeur
                    </p>
                    <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', gap: '20px' }}>
                        <a href="#" style={{ color: goldColor, fontSize: '22px', textDecoration: 'none' }}>📸</a>
                        <a href="#" style={{ color: goldColor, fontSize: '22px', textDecoration: 'none' }}>f</a>
                        <a href="#" style={{ color: goldColor, fontSize: '22px', textDecoration: 'none' }}>P</a>
                        <a href="#" style={{ color: goldColor, fontSize: '22px', textDecoration: 'none' }}>▶</a>
                    </div>
                </div>

                {/* Information & Customer Service Column */}
                <div style={columnStyle}>
                    <h3 style={headingStyle}>Information & Customer Service</h3>
                    <ul style={listStyle}>
                        {/* ✅ Added About Us and Cancellation Policy to the grid */}
                        <li><Link to="/about" style={linkStyle}>• About Us</Link></li>
                        <li><Link to="/contact" style={linkStyle}>• Contact Us</Link></li>
                        <li><Link to="/cancel-policy" style={linkStyle}>• Cancellation Policy</Link></li>
                        <li><Link to="/refund" style={linkStyle}>• Refund Policy</Link></li>
                        <li><Link to="/privacy" style={linkStyle}>• Privacy Policy</Link></li>
                        <li><Link to="/term-service" style={linkStyle}>• Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            <div style={copyrightBarStyle}>
                <div style={bottomContentStyle}>
                    <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <img src={paytm} alt="Paytm" height="20" />
                        <img src={razorpay} alt="Razorpay" height="20" />
                        <img src={visa} alt="Visa" height="15" />
                    </div>
                    <div>
                        © 2026 Gopi Nath Collection. All rights reserved. <br/>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;