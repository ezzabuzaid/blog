import { visit } from 'unist-util-visit';

export default function remarkEmbed() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      let fullText = '';

      // Concatenating text from text nodes within the paragraph
      node.children.forEach((child) => {
        if (child.type === 'text') {
          fullText += child.value
        }
      });

      const isEmbed= fullText.startsWith('{%') && fullText.endsWith('%}')
      if(!isEmbed) {
        return
      }


      const platform = extractPlatform(
        fullText
      );


         if (platform) {
          // Extract the URL from the pattern
          const url = node.children.find((child) => child.type === 'link').url

          // Platform-specific iframe HTML
          let iframeValue;
            if(platform === 'embed') {
             iframeValue = `<iframe src="${url}" style="width: 100%;" height="400" scrolling="no" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>`;
           }

          // Insert the iframe HTML node
          const iframeNode = {
            type: 'html',
            value: iframeValue,
          };

          parent.children.splice(index, 1, iframeNode);
        }
      });
   };
}
function extractPlatform(text) {
  const startTag = "{%";
  const endTag = "%}";

  const startIndex = text.indexOf(startTag);
  const endIndex = text.indexOf(endTag);

  if (startIndex !== -1 && endIndex !== -1) {
    const extractedText = text.substring(startIndex + startTag.length, endIndex).trim();
    return extractedText.split(" ")[0]; // Take the first word
  } else {
    return null;
  }
}