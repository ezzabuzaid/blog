import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://techtext.dev/",
  author: "Ezzabuzaid",
  desc: "We produce targeted articles and step-by-step guides, meticulously curated for software engineers.",
  title: "TechText",
  ogImage: "logo.svg",
  lightAndDarkMode: true,
  postPerPage: 6,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/ezzabuzaid",
    linkTitle: `Follow me on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/ezzabuzaid",
    linkTitle: `Find me on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:ezzabuzaid@hotmail.com",
    linkTitle: `Send me an email`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/ezzabuzaid",
    linkTitle: `Follow me on Twitter`,
    active: true,
  },
];
