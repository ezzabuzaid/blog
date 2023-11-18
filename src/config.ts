import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://writer.sh/",
  author: "Ezzabuzaid",
  title: "Writer.sh - Developer's Journey",
  desc: "Writer.sh showcases inspiring tales of developers who forged their own way, from unconventional beginnings to entrepreneurial triumphs in the tech realm.",
  ogImage: "logo.png",
  lightAndDarkMode: false,
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
    active: false,
  },
  {
    name: "RSSFeed",
    href: "./rss.xml",
    linkTitle: `Subscribe to my RSS Feed`,
    active: false,
  },
];
