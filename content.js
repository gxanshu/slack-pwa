/**
 * insert PWA manifest JSON
 */
const metaLink = document.createElement("link");
metaLink.setAttribute("rel", "manifest");
metaLink.setAttribute(
  "href",
  "https://raw.githubusercontent.com/gxanshu/slack-pwa/main/pwa/manifest.json"
);
document.head.appendChild(metaLink);
