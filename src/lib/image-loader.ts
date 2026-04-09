export default function cloudflareLoader({
  src,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Serve images directly — Cloudflare Image Resizing (/cdn-cgi/image/) requires
  // a paid add-on. Return the raw src so all images load without transformation.
  return src;
}
