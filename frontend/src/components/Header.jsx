import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/auth"; 
import { useCart } from "../context/cart"; 
import { Badge } from "antd"; 
import axios from "axios";

// Asset Imports
import usericon from "../assets/User1.svg";
import magnifying from "../assets/magnifying.svg";
import cart from "../assets/cart.svg";
import myorder from "../assets/myorder.svg";
import categoryIcon from "../assets/category.svg";

const Header = () => {
    const [auth, setAuth] = useAuth();
    const [cartItems] = useCart(); 
    const navigate = useNavigate();
    
    const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search Suggestion States
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const headerRef = useRef(null);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const goldColor = "#D4AF37";
    const burgundyColor = "#2D0A14";
    const topBarColor = "#1a060c";

    const placeholders = ["Kangan", "Laddo Gopal Dress", "Kesh", "Nam Jap Counter"];
    const BASE_URL = import.meta.env.VITE_API_URL;

    const trendingItems = [
        { name: "Kangan", slug: "kangan" },
        { name: "Laddo Gopal Dress", slug: "laddo-gopal-dress" },
        { name: "Kesh", slug: "kesh" },
        { name: "Nam Jap Counter", slug: "nam-jap-counter" }
    ];

    const handleCategoryNav = (catName) => {
        const formattedName = catName.toUpperCase().replace(/\s+/g, '-'); 
        navigate(`/category/${formattedName}`); 
        setKeyword("");
        setShowDropdown(false);
        closeAllMenus();
    };

    const handleSelectSuggestion = (product) => {
        if (product.category && product.category.slug) {
            navigate(`/category/${product.category.slug}`);
        } else {
            navigate(`/search-results/${product.name.toLowerCase()}`);
        }
        setKeyword("");
        setShowDropdown(false);
        closeAllMenus();
    };

    const fetchSuggestions = useCallback(async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}api/v1/product/search-suggest/${keyword}`);
            if (data?.success) {
                setSuggestions(data.results);
                setShowDropdown(true);
            }
        } catch (error) {
            console.log("Suggestion error:", error);
        }
    }, [keyword, BASE_URL]);

    useEffect(() => {
        const handleResize = () => {
            const mobileView = window.innerWidth < 1024;
            setIsMobile(mobileView);
            if (!mobileView) setIsMobileMenuOpen(false);
        };

        // ✅ FIXED: Proper click outside handling
        const handleClickOutside = (event) => {
            if (
                headerRef.current && 
                !headerRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                closeAllMenus();
                setShowDropdown(false);
            }
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (keyword.trim().length > 1) {
                fetchSuggestions();
            } else if (keyword.trim().length === 0) {
                setSuggestions([]);
                setShowDropdown(true); // Show trending when empty
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [keyword, fetchSuggestions]);

    const handleLogout = () => {
        setAuth({ ...auth, user: null, token: "" });
        localStorage.removeItem("auth"); 
        closeAllMenus(); 
        alert("Logged out successfully");
        navigate("/login");
    };

    const closeAllMenus = () => {
        setIsCategoryOpen(false);
        setIsLoginDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const iconGroupStyle = {
        display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
        color: goldColor, textDecoration: "none", fontSize: isMobile ? "16px" : "14px",
        fontWeight: "600", textTransform: "uppercase"
    };

    const dropdownBoxStyle = {
        position: "absolute", top: "100%", left: 0, width: isMobile ? "260px" : "220px",
        background: "white", boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        borderRadius: "4px", marginTop: "10px", zIndex: 5000, overflow: "hidden"
    };

    // Flipkart-style Search Component
    const GlobalSearch = () => (
        <div style={{ position: "relative", flex: 1, width: "100%" }}>
            <div style={{ 
                display: "flex", 
                background: "white",
                borderRadius: "2px", 
                padding: "0 16px", 
                height: "40px", 
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
            }}>
                <img src={magnifying} height="20" alt="search" style={{ opacity: 0.5 }} />
                <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder={isMobile ? "Search..." : `Search for ${placeholders[0]}, ${placeholders[1]}...`} 
                    value={keyword}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ 
                        background: "transparent", 
                        border: "none", 
                        outline: "none", 
                        width: "100%", 
                        padding: "0 12px", 
                        color: "#212121", 
                        fontSize: "14px",
                        fontFamily: "inherit"
                    }} 
                />
                {keyword && (
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setKeyword("");
                            setTimeout(() => searchInputRef.current?.focus(), 0);
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#878787",
                            fontSize: "24px",
                            cursor: "pointer",
                            padding: "0 5px",
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
            
            {showDropdown && (
                <div 
                    ref={dropdownRef}
                    className="suggestion-list"
                    onMouseDown={(e) => {
                        // Prevent input from losing focus when clicking dropdown
                        if (e.target.tagName !== 'INPUT') {
                            e.preventDefault();
                        }
                    }}
                >
                    {keyword.length === 0 ? (
                        <>
                            <div className="trending-header">Popular Suggestions</div>
                            {trendingItems.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="suggestion-row" 
                                    onClick={() => {
                                        handleCategoryNav(item.name);
                                        setTimeout(() => searchInputRef.current?.blur(), 0);
                                    }}
                                >
                                    <img src={magnifying} height="16" style={{opacity: 0.4}} alt="trend" />
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {suggestions.length > 0 ? (
                                suggestions.map((p) => (
                                    <div 
                                        key={p._id} 
                                        className="suggestion-row product-row" 
                                        onClick={() => {
                                            handleSelectSuggestion(p);
                                            setTimeout(() => searchInputRef.current?.blur(), 0);
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                            <img 
                                                src={`${BASE_URL}/api/v1/product/product-photo/${p._id}`} 
                                                className="suggestion-img" 
                                                alt={p.name} 
                                            />
                                            <div>
                                                <div style={{ fontSize: "14px", color: "#212121" }}>{p.name}</div>
                                                {p.category && (
                                                    <div style={{ fontSize: "12px", color: "#878787", marginTop: "2px" }}>
                                                        in {p.category.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">No results found for "{keyword}"</div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <header ref={headerRef} style={{ width: "100%", position: "relative", zIndex: 1000, display: "block" }}>
            <style>
                {`
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
                    
                    .dropdown-item { 
                        display: block; 
                        padding: 12px 20px; 
                        text-decoration: none; 
                        color: #333; 
                        font-size: 14px; 
                        font-weight: 500; 
                        border-bottom: 1px solid #f0f0f0; 
                        width: 100%; 
                        text-align: left; 
                        background: none; 
                        border: none; 
                        cursor: pointer;
                    }
                    .dropdown-item:hover { 
                        background-color: ${burgundyColor}; 
                        color: ${goldColor} !important;
                    }
                    
                    .nav-icon-gold { 
                        filter: invert(72%) sepia(53%) saturate(395%) hue-rotate(11deg) brightness(92%) contrast(88%); 
                    }
                    
                    .ant-scroll-number { 
                        background: ${goldColor} !important; 
                        color: ${burgundyColor} !important; 
                        box-shadow: 0 0 0 1px ${goldColor} !important; 
                        font-weight: bold; 
                    }
                    
                    /* Flipkart-style dropdown */
                    .suggestion-list { 
                        position: absolute; 
                        top: calc(100% + 1px);
                        left: 0; 
                        width: 100%; 
                        background: white; 
                        box-shadow: 0 4px 16px 0 rgba(0,0,0,.2);
                        z-index: 6000; 
                        max-height: 500px;
                        overflow-y: auto;
                    }
                    
                    .trending-header { 
                        padding: 14px 16px; 
                        font-size: 11px; 
                        text-transform: uppercase; 
                        color: #878787; 
                        font-weight: 500; 
                        background: #fff;
                        border-bottom: 1px solid #f0f0f0;
                        letter-spacing: 0.5px;
                    }
                    
                    .suggestion-row { 
                        padding: 12px 16px; 
                        color: #212121; 
                        font-size: 14px; 
                        cursor: pointer; 
                        display: flex; 
                        align-items: center; 
                        gap: 12px;
                        border-bottom: 1px solid #f0f0f0;
                        background: white;
                    }
                    
                    .suggestion-row:hover { 
                        background: #f0f0f0;
                    }
                    
                    .product-row {
                        padding: 10px 16px;
                    }
                    
                    .suggestion-img { 
                        width: 50px; 
                        height: 50px; 
                        object-fit: contain; 
                        background: #f5f5f5;
                        border-radius: 2px;
                        padding: 4px;
                    }

                    .no-results {
                        padding: 24px 16px;
                        text-align: center;
                        color: #878787;
                        font-size: 14px;
                    }

                    .suggestion-list::-webkit-scrollbar {
                        width: 8px;
                    }

                    .suggestion-list::-webkit-scrollbar-track {
                        background: #f5f5f5;
                    }

                    .suggestion-list::-webkit-scrollbar-thumb {
                        background: #ddd;
                        border-radius: 4px;
                    }

                    .suggestion-list::-webkit-scrollbar-thumb:hover {
                        background: #ccc;
                    }
                `}
            </style>

            {!isMobile && (
                <div style={{ display: "flex", justifyContent: "space-between", height: "35px", background: topBarColor, padding: "0 60px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "30px" }}>
                        <Link to="/about" style={{color: goldColor, textDecoration: "none", fontSize: "12px", fontWeight: "600"}}>ABOUT</Link>
                        <Link to="/contact" style={{color: goldColor, textDecoration: "none", fontSize: "12px", fontWeight: "600"}}>CONTACT US</Link>
                    </div>
                    <span style={{ color: "white", fontSize: "12px", fontStyle: "italic", opacity: 0.9 }}>
                        {auth?.user ? `Welcome back, ${auth.user.name}` : "Free delivery on orders above ₹299"}
                    </span>
                    <div 
                        onMouseEnter={() => setIsLoginDropdownOpen(true)} 
                        onMouseLeave={() => setIsLoginDropdownOpen(false)} 
                        style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 10px" }}
                    >
                        <span style={{color: goldColor, fontSize: "12px", fontWeight: "600", cursor: "pointer"}}>
                            {auth?.user ? `HI, ${auth.user.name.toUpperCase()}` : "MY ACCOUNT"} ▾
                        </span>
                        {isLoginDropdownOpen && (
                            <div style={{ ...dropdownBoxStyle, left: "auto", right: 0 }}>
                                {auth?.user ? (
                                    <>
                                        <Link to={`/dashboard/${auth?.user?.role === 1 ? 'admin' : 'user/profile'}`} className="dropdown-item" onClick={closeAllMenus}>My Profile</Link>
                                        <Link to={`/dashboard/${auth?.user?.role === 1 ? 'admin/orders' : 'user/orders'}`} className="dropdown-item" onClick={closeAllMenus}>My Orders</Link>
                                        <button onClick={handleLogout} className="dropdown-item">LOGOUT</button>
                                    </>
                                ) : ( 
                                    <Link to="/login" className="dropdown-item" onClick={closeAllMenus}>LOGIN / SIGNUP</Link> 
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ background: burgundyColor, padding: isMobile ? "15px 20px" : "15px 60px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <Link to="/" onClick={closeAllMenus} style={{ textDecoration: "none" }}>
                        <h1 style={{ 
                            color: goldColor, 
                            margin: 0, 
                            fontSize: isMobile ? "24px" : "32px", 
                            fontFamily: "'Playfair Display', serif", 
                            fontStyle: "italic" 
                        }}>
                            Gopi Nath Collection
                        </h1>
                    </Link>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        {isMobile && (
                            <Link to="/cart" onClick={closeAllMenus}>
                                <Badge count={cartItems?.length} showZero size="small">
                                    <img src={cart} className="nav-icon-gold" height="22" alt="cart" />
                                </Badge>
                            </Link>
                        )}
                        {isMobile && (
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                                style={{ 
                                    background: "none", 
                                    border: "none", 
                                    color: goldColor, 
                                    fontSize: "28px", 
                                    cursor: "pointer" 
                                }}
                            >
                                {isMobileMenuOpen ? "✕" : "☰"}
                            </button>
                        )}
                    </div>
                </div>

                {!isMobile && (
                    <div style={{ width: "100%", display: "flex", maxWidth: "600px" }}>
                        <GlobalSearch />
                    </div>
                )}

                {(isMobileMenuOpen || !isMobile) && (
                    <nav style={{ 
                        display: "flex", 
                        flexDirection: isMobile ? "column" : "row", 
                        gap: isMobile ? "20px" : "30px", 
                        width: isMobile ? "100%" : "auto", 
                        alignItems: isMobile ? "flex-start" : "center", 
                        position: "relative" 
                    }}>
                        <div 
                            style={{ position: "relative" }} 
                            onMouseEnter={() => !isMobile && setIsCategoryOpen(true)} 
                            onMouseLeave={() => !isMobile && setIsCategoryOpen(false)}
                        >
                            <div onClick={() => isMobile && setIsCategoryOpen(!isCategoryOpen)} style={iconGroupStyle}>
                                <img src={categoryIcon} className="nav-icon-gold" height="20" alt="cat" />
                                <span>SHOP ▾</span>
                            </div>
                            {isCategoryOpen && (
                                <div style={dropdownBoxStyle}>
                                    <li className="dropdown-item" onClick={() => handleCategoryNav("LADDO GOPAL DRESSES")}>Ladoo Gopal Dress</li>
                                    <li className="dropdown-item" onClick={() => handleCategoryNav("FULL SRINGAR")}>Full Shringar</li>
                                    <li className="dropdown-item" onClick={() => handleCategoryNav("COUNTER")}>Counter</li>
                                    <li className="dropdown-item" onClick={() => handleCategoryNav("HAIRS")}>Accessories</li>
                                </div>
                            )}
                        </div>
                        {!isMobile && (
                            <Link to="/cart" style={iconGroupStyle} onClick={closeAllMenus}>
                                <Badge count={cartItems?.length} showZero offset={[10, -5]}>
                                    <img src={cart} className="nav-icon-gold" height="20" alt="cart" /> 
                                    <span style={{ marginLeft: "5px", color: goldColor }}>CART</span>
                                </Badge>
                            </Link>
                        )}
                        <Link to={`/dashboard/${auth?.user?.role === 1 ? 'admin/orders' : 'user/orders'}`} style={iconGroupStyle} onClick={closeAllMenus}>
                            <img src={myorder} className="nav-icon-gold" height="20" alt="orders" /> 
                            <span>ORDERS</span>
                        </Link>
                        {isMobile && (
                            <div style={{ width: "100%", position: "relative" }}>
                                <div onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)} style={iconGroupStyle}>
                                    <img src={usericon} className="nav-icon-gold" height="20" alt="user" />
                                    <span>{auth?.user ? `HI, ${auth.user.name.toUpperCase()}` : "MY ACCOUNT"} ▾</span>
                                </div>
                                {isLoginDropdownOpen && (
                                    <div style={{ ...dropdownBoxStyle, left: "0", top: "100%" }}>
                                        {auth?.user ? (
                                            <>
                                                <Link to={`/dashboard/${auth?.user?.role === 1 ? 'admin' : 'user/profile'}`} className="dropdown-item" onClick={closeAllMenus}>My Profile</Link>
                                                <Link to={`/dashboard/${auth?.user?.role === 1 ? 'admin/orders' : 'user/orders'}`} className="dropdown-item" onClick={closeAllMenus}>My Orders</Link>
                                                <button onClick={handleLogout} className="dropdown-item">LOGOUT</button>
                                            </>
                                        ) : ( 
                                            <Link to="/login" className="dropdown-item" onClick={closeAllMenus}>LOGIN / SIGNUP</Link> 
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;