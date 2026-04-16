import getReadingTime from 'reading-time';
import { visit } from 'unist-util-visit';

/**
 * Remark plugin that calculates reading time and injects it into
 * remarkPluginFrontmatter as `minutesRead` (e.g. '5 min read').
 * Zero runtime JS — runs entirely at build time.
 */
export function remarkReadingTime() {
  return function (tree, file) {
    let text = '';
    visit(tree, ['text', 'code'], (node) => {
      text += node.value;
    });
    const { minutes, words } = getReadingTime(text);
    const rounded = Math.max(1, Math.ceil(minutes));
    // Inject into Astro's remark frontmatter pipeline
    if (!file.data.astro) file.data.astro = {};
    if (!file.data.astro.frontmatter) file.data.astro.frontmatter = {};
    file.data.astro.frontmatter.minutesRead = `${rounded} min read`;
    file.data.astro.frontmatter.wordCount = words;
  };
}
