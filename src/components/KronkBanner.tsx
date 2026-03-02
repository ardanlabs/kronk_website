import svgContent from "@/assets/kronk-banner.svg?raw";

/**
 * Inline SVG banner so we can target internal groups (e.g. #foreground) with CSS animations.
 * Animations are defined in index.css under .kronk-banner
 */
export const KronkBanner = () => (
  <div
    className="kronk-banner mx-auto mb-4 max-w-3xl w-full [&_svg]:w-full [&_svg]:rounded-lg [&_svg]:shadow-lg"
    dangerouslySetInnerHTML={{ __html: svgContent }}
  />
);
