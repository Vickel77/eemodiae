"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Close from "../Icons/Close";
import Hamburger from "../Icons/Hamburger";
import { MdLogout } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

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
  ("");
  useEffect(() => {
    const _isLoggedIn = localStorage.getItem("isLoggedIn");
    if (_isLoggedIn === "true") {
      setIsLoggedIn(true);
    }
  });
  return (
    <div className={className}>
      <div className="hamburger">
        <Hamburger size="30" onClick={() => setIsOpen(!isOpen)} />
        {isLoggedIn && (
          <button onClick={logout}>
            <MdLogout size={30} />
          </button>
        )}
        {isOpen && <View onClose={() => setIsOpen(false)} />}
      </div>
    </div>
  );
})`
  position: fixed;
  top: 0;
  left: 0;
  // border: 1px solid red;
  z-index: 5;
  width: 100%;
  // background: #ffffff77;
  // backdrop-filter: blur(10px);
  // color: ${({ theme }) => theme.colors.primary};
  .hamburger {
    width: 100%;
    padding: 1.2rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    // mix-blend-mode: difference;

    * {
      // filter: drop-shadow(1px 1px 0px ${({ theme }) => theme.colors.white});
    }
  }
`;

const View = styled(
  ({ className, onClose }: { className?: any; onClose?: () => void }) => {
    return (
      <div className={className}>
        <div className="top-bar">
          <Close onClick={onClose} size="60" />
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
  animation: in-animation 0.3s;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  @keyframes in-animation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .top-bar {
    width: 100%;
    padding: 1.2rem;
  }

  section {
    margin-top: 3rem;
  }
  section > * {
    font-size: 1.2rem;
    padding: 0.5rem 2.5rem;
    width: 100%;
    display: block;
  }
  section > *:hover {
    transition: 0.3s;
    background: ${({ theme }) => theme.colors.primaryAccent};
    border-left: 5px solid ${({ theme }) => theme.colors.primary};
  }
`;

export default Navbar;
