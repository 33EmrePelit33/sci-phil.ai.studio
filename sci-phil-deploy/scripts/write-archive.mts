import { writeFileSync } from "node:fs";
import { fetchAndSieve } from "../src/lib/blog-sync.ts";

const archive = await fetchAndSieve();
writeFileSync(
  new URL("../src/data/archive.json", import.meta.url),
  JSON.stringify(archive),
);
console.log(
  JSON.stringify({
    source: archive.sourceCount,
    turkish: archive.turkishCount,
    dropped: archive.droppedTranslations,
    first: archive.posts[0]?.title,
    last: archive.posts.at(-1)?.title,
  }),
);
