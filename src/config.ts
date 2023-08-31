import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://techtext.dev/",
  author: "Ezzabuzaid",
  desc: "Your home for in-depth tech articles and tutorials",
  title: "TechText",
  ogImage: "logo.svg",
  lightAndDarkMode: true,
  postPerPage: 4,
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
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/ezzabuzaid",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:ezzabuzaid@hotmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/ezzabuzaid",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
];
