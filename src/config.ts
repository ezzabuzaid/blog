import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://writer.sh/",
  author: "Ezzabuzaid",
  desc: "I'm Senior Software Engineer and a Technical Writer with a keen interest in merging technology and communication. Passionate about software development and committed to reading and lifelong learning.",
  title: "Writer.sh - Software Engineering Blog",
  ogImage: "logo.svg",
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
  // {
  //   name: "Twitter",
  //   href: "https://twitter.com/ezzabuzaid",
  //   linkTitle: `Follow me on Twitter`,
  //   active: true,
  // },
  {
    name: "RSSFeed",
    href: "https://feeds.feedburner.com/writersh",
    linkTitle: `Subscribe to my RSS Feed`,
    active: true,
  },
];
