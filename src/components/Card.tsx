import type { BlogFrontmatter } from "@content/_schemas";

export interface Props {
  href?: string;
  frontmatter: BlogFrontmatter;
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, description, minutesRead } = frontmatter;
  return (
    <li className="my-1 space-y-0.5">
      <a rel="prefetch" className="flex" href={href}>
        <span>-</span>
        <h3 className="ml-2 text-sm decoration-dashed hover:underline">
          {title}
        </h3>
      </a>
      {/* <Datetime datetime={pubDatetime} minutesRead={minutesRead} /> */}

      {/* <p>{description}</p> */}
    </li>
  );
}
