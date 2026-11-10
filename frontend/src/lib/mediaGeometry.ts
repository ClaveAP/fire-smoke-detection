export interface MediaContentRect {
  offsetX: number;
  offsetY: number;
  renderWidth: number;
  renderHeight: number;
  containerWidth: number;
  containerHeight: number;
  scaleX: number;
  scaleY: number;
  pctOffsetX: number;
  pctOffsetY: number;
  pctWidth: number;
  pctHeight: number;
}

/**
 * Calculates the exact rendered content rectangle of a media element using CSS `object-contain`
 * inside a container. If container or media dimensions are unknown or 0, it falls back
 * to filling the container (100% width and height, 0 offset).
 */
export function getMediaContentRect(
  containerWidth: number,
  containerHeight: number,
  mediaWidth?: number,
  mediaHeight?: number
): MediaContentRect {
  if (
    !containerWidth ||
    !containerHeight ||
    !mediaWidth ||
    !mediaHeight ||
    mediaWidth <= 0 ||
    mediaHeight <= 0
  ) {
    return {
      offsetX: 0,
      offsetY: 0,
      renderWidth: containerWidth,
      renderHeight: containerHeight,
      containerWidth,
      containerHeight,
      scaleX: 1,
      scaleY: 1,
      pctOffsetX: 0,
      pctOffsetY: 0,
      pctWidth: 100,
      pctHeight: 100,
    };
  }

  const mediaRatio = mediaWidth / mediaHeight;
  const containerRatio = containerWidth / containerHeight;

  let renderWidth = containerWidth;
  let renderHeight = containerHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (containerRatio > mediaRatio) {
    // Container is wider than media -> pillarbox (dark space left and right)
    renderHeight = containerHeight;
    renderWidth = containerHeight * mediaRatio;
    offsetX = (containerWidth - renderWidth) / 2;
    offsetY = 0;
  } else {
    // Container is taller than media -> letterbox (dark space top and bottom)
    renderWidth = containerWidth;
    renderHeight = containerWidth / mediaRatio;
    offsetX = 0;
    offsetY = (containerHeight - renderHeight) / 2;
  }

  return {
    offsetX,
    offsetY,
    renderWidth,
    renderHeight,
    containerWidth,
    containerHeight,
    scaleX: renderWidth / containerWidth,
    scaleY: renderHeight / containerHeight,
    pctOffsetX: (offsetX / containerWidth) * 100,
    pctOffsetY: (offsetY / containerHeight) * 100,
    pctWidth: (renderWidth / containerWidth) * 100,
    pctHeight: (renderHeight / containerHeight) * 100,
  };
}

/**
 * Reads intrinsic dimensions from an HTMLVideoElement or HTMLImageElement.
 */
export function getMediaNaturalDimensions(
  element: HTMLVideoElement | HTMLImageElement | null | undefined
): { width: number; height: number } | null {
  if (!element) return null;
  if ("videoWidth" in element && element.videoWidth > 0 && element.videoHeight > 0) {
    return { width: element.videoWidth, height: element.videoHeight };
  }
  if ("naturalWidth" in element && element.naturalWidth > 0 && element.naturalHeight > 0) {
    return { width: element.naturalWidth, height: element.naturalHeight };
  }
  return null;
}
