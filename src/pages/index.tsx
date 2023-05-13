import type { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import MarkdownTextarea from "@/components/MarkdownTextarea";
import Button from "@/components/Button";

const LandingPage = () => (
  <div className="min-h-screen bg-gray-100">
    <header className="flex items-center justify-between bg-white px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-800">DeadEnd Devs</h1>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link href={"/home"} className="text-gray-800 hover:text-gray-600">
              Home
            </Link>
          </li>
          <li>
            <Link href={"/about"} className="text-gray-800 hover:text-gray-600">
              About
            </Link>
          </li>
          <li>
            <Link href={"/login"} className="text-gray-800 hover:text-gray-600">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
    <main className="mx-auto max-w-5xl px-8 py-12">
      <h2 className="mb-6 text-4xl font-bold text-gray-800">
        Welcome to DeadEnd Devs!
      </h2>
      <div className="mb-8 text-lg text-gray-600">
        A place where you showcase your code to others in{" "}
        <span className="text-blue-500">informative</span> and
        <span className="text-blue-500"> educational</span> ways!
      </div>
      <div>
        <p>Let&apos;s write some JavaScript code!</p>
        <MarkdownTextarea>
          {`function WhatWeCanDo() {
    const youAreAmazing = true; // You really are :)

    if (youAreAmazing === true) {
      return "Keep being amazing!!!";
    };
};`}
        </MarkdownTextarea>
        <p>This can be refactored to this:</p>
        <MarkdownTextarea>
          {`// Semicolons are optional in JS
const WhatWeCanDo = () => { // ES6 arrow function
    const youAreAmazing = true // You still are :)

    if (youAreAmazing) { // This will be true because of truthy and falsy values in JS.
      return "Keep being amazing!!!"
    }
}`}
        </MarkdownTextarea>
      </div>
      <Button href="login" className="relative top-4">
        Sign up now!
      </Button>
    </main>
    <footer className="absolute bottom-0 left-0 right-0 bg-gray-800 px-60 py-4 text-center text-white">
      <p>&copy; 2023 DeadEnd Devs. All rights not reserved.</p>
    </footer>
  </div>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/home",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default LandingPage;
