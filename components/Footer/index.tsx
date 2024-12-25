import Link from "next/link";
import React from "react";
import styled from "styled-components";
import Socials from "../Socials";

const Footer = styled(
  ({
    className,
    hideBooking,
    theme,
  }: {
    className?: any;
    hideBooking?: boolean;
    theme?: any;
  }) => {
    return (
      <>
        {!hideBooking && <BookingBar />}
        <footer className={className}>
          <div className="footer-content">
            <section className="quick-links">
              <h4>Quick Links</h4>
              <div className="flex gap-0 md:gap-5 flex-col md:flex-row">
                <div className="flex flex-col">
                  <Link href="/">Home</Link>
                  <Link href="/about">About</Link>
                  <Link href="/articles">Articles</Link>
                  <Link href="/poems">Poems</Link>
                  <Link href="/messages">Messages</Link>
                </div>
                <div className="flex flex-col">
                  <Link href="/bookings">Bookings</Link>
                  <Link href="/music">Music</Link>
                  <Link href="/shop">Store</Link>
                  <Link href="/give">Give</Link>
                </div>
              </div>
            </section>

            <section className="contact-form">
              <h4>Contact Us</h4>
              <form>
                <input
                  placeholder="Your Name"
                  className="input bg-transparent"
                  type="text"
                  name="name"
                  required
                />
                <textarea
                  className="input bg-transparent"
                  placeholder="Your Message"
                  name="message"
                  rows={4}
                  required
                ></textarea>
                <button className="btn bg-danger small">Send Message</button>
              </form>
            </section>

            <section className="keep-in-touch">
              <h4>Stay Connected</h4>
              <Socials />
            </section>
          </div>
        </footer>
      </>
    );
  }
)`
  background: ${({ theme }) => theme.colors.primary};
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  position: relative;

  .footer-content {
    width: 85%;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;

    section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    h4 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: ${({ theme }) => theme.colors.accent};
    }

    a {
      color: ${({ theme }) => theme.colors.white};
      text-decoration: none;
      transition: opacity 0.3s;
    }

    a:hover {
      opacity: 0.8;
    }

    .quick-links {
      display: flex;
      flex-direction: column;
    }

    .contact-form {
      form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .input {
          padding: 0.75rem;
          border-radius: 5px;
          border: 1px solid ${({ theme }) => theme.colors.white};
          color: ${({ theme }) => theme.colors.text};
        }

        .input:focus {
          outline: none;
          border-color: ${({ theme }) => theme.colors.accent};
        }

        .btn {
          padding: 0.75rem;
          background: ${({ theme }) => theme.colors.accent};
          color: ${({ theme }) => theme.colors.white};
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn:hover {
          background: ${({ theme }) => theme.colors.accentHover};
        }
      }
    }

    .keep-in-touch {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .contact-form,
    .keep-in-touch {
      align-items: center;
    }
  }
`;

const BookingBar = ({}) => {
  return (
    <div
      style={{ backgroundPositionY: "50%", backgroundAttachment: "fixed" }}
      className="booking-wrapper w-full p-5 flex justify-center"
    >
      <Link href="/bookings" className="text-white">
        For bookings and appointments{" "}
        <button className="text-white font-bold"> Click here</button>
      </Link>

      <div></div>
    </div>
  );
};

export default Footer;
