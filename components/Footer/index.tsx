import Link from "next/link";
import React from "react";
import styled from "styled-components";
import Socials from "../Socials";

const Footer = styled(({ className }) => {
  return (
    <div className={className}>
      <div className="content">
        <button className="btn cta">Request for mentorship</button>
        <aside>
          <section>
            <section className="quick-links">
              <h4>Quick Links</h4>
              <Link className="link" href="/">
                HOME
              </Link>
              <Link className="link" href="/about">
                ABOUT
              </Link>
              <Link className="link" href="/poems">
                PEOMS
              </Link>
              <Link className="link" href="/shop">
                STORE
              </Link>
            </section>
          </section>
          <section className="contact-form">
            <form>
              <input
                placeholder="Name"
                className="input"
                type="text"
                name=""
                id=""
              />
              <textarea
                className="input"
                placeholder="Message"
                name=""
                id=""
                cols={30}
                rows={10}
              ></textarea>
              <button className="btn small">Send Mail</button>
            </form>
          </section>
          <section className="keep-in-touch">
            <h4>Keep in Touch</h4>
            <Socials />
            <a className="link" href="tel:080774432234">
              <i className="fa fa-phone" aria-hidden="true"></i>
              080774432234
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
})`
  background: ${({ theme }) => theme.colors.primary};
  padding: 2rem 0;
  * {
    color: ${({ theme }) => theme.colors.white} !important;
  }
  .content {
    width: 80%;
    margin: 0rem auto;
    text-align: center;
    .cta {
      padding-bottom: 2ren;
      border-radius: 50px;
      box-shadow: 0 4px 10px #00000099;
      font-size: 1.5rem;
      padding-inline: 3rem;
      background: ${({ theme }) => theme.colors.danger};
    }

    aside {
      display: grid;
      grid-template-columns: 1fr 1.75fr 1fr;
      justify-content: center;
      margin-top: 4rem;
      gap: 4rem;

      .quick-links {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        .link:hover {
          opacity: 0.8;
        }
      }
      .contact-form {
        width: min(100%, 399px);
        form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input,
        .btn {
          background: transparent;
          border-radius: 10px;
          border: 1px solid ${({ theme }) => theme.colors.white};
        }
      }
      .keep-in-touch {
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        h3 {
          margin: 0;
          padding: 0;
        }
      }
      @media (max-width: 767px) {
        grid-template-columns: 1fr;
        place-items: center;
        text-align: center;
        .quick-links {
          align-items: center;
        }
        .keep-in-touch {
          align-items: center;
        }
      }
    }
  }
`;
export default Footer;
