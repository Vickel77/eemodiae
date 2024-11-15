import Link from "next/link";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Close from "../Icons/Close";
import Hamburger from "../Icons/Hamburger";
import { MdLogout } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import logo from "../../assets/logo-5.png";

const Navbar = styled(({ className }: { className?: any }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    router.push("/");
    toast("Log Out Successful");
  };

  useEffect(() => {
    const _isLoggedIn = localStorage.getItem("isLoggedIn");
    if (_isLoggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <nav className={className}>
      <div className="navbar-content">
        <div className="logo">
          <Link href="/">
            <img src={logo.src} alt="" width={120} />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="desktop-links">
          {/* <Link href="/" className={router.pathname === "/" ? "active" : ""}>
            HOME
          </Link> */}
          <Link
            href="/about"
            className={router.pathname === "/about" ? "active" : ""}
          >
            ABOUT
          </Link>
          <Link
            href="/articles"
            className={router.pathname === "/articles" ? "active" : ""}
          >
            ARTICLES
          </Link>
          <Link
            href="/poems"
            className={router.pathname === "/poems" ? "active" : ""}
          >
            POEMS
          </Link>
          <Link
            href="/messages"
            className={router.pathname === "/messages" ? "active" : ""}
          >
            MESSAGES
          </Link>
          <Link
            href="/shop"
            className={router.pathname === "/shop" ? "active" : ""}
          >
            STORE
          </Link>
          <Link
            href="/give"
            className={`${
              router.pathname === "/give" ? "active" : ""
            } bg-primary px-2 py-1 rounded-sm text-white`}
          >
            GIVE
          </Link>
          {isLoggedIn && (
            <button onClick={logout} className="logout-btn">
              <MdLogout size={20} />
              LOG OUT
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="hamburger-menu">
          <Hamburger size="20" onClick={() => setIsOpen(!isOpen)} />
          {isOpen && <MobileMenu onClose={() => setIsOpen(false)} />}
        </div>
      </div>
    </nav>
  );
})`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  width: 100%;
  background: #ffffff55;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.colors.primary};
  padding: 1rem 2rem;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

  .navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .desktop-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    font-size: 0.8rem;
  }

  /* Active link styling */
  .desktop-links > .active {
    border-top: 2px dashed ${({ theme }) => theme.colors.primary}; /* Optional underline */
  }

  .logout-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  .hamburger-menu {
    display: none;
  }

  .main-content {
    padding-top: 4rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    .desktop-links {
      display: none;
    }
    .hamburger-menu {
      display: block;
    }
  }
`;

const MobileMenu = styled(
  ({ className, onClose }: { className?: any; onClose?: () => void }) => {
    return (
      <div className={className}>
        <div className="top-bar">
          <div className="logo">
            <Link href="/">
              <img src={logo.src} alt="" width={120} />
            </Link>
          </div>

          <Close onClick={onClose} size="30" />
        </div>
        <section>
          <Link href="/">HOME</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/articles">ARTICLES</Link>
          <Link href="/poems">POEMS</Link>
          <Link href="/messages">MESSAGES</Link>
          <Link href="/shop">STORE</Link>
          <Link href="/give">GIVE</Link>
        </section>
      </div>
    );
  }
)`
  height: 100vh;
  width: 100vw;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  animation: fadeIn 0.3s;

  .top-bar {
    width: 100%;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
  }

  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
  }

  section a {
    font-size: 1.5rem;
    padding: 1rem;
    width: 100%;
    text-align: center;
    color: ${({ theme }) => theme.colors.primary};
  }

  section a:hover {
    background: ${({ theme }) => theme.colors.primaryAccent};
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
export default Navbar;
