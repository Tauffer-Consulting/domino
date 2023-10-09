import { useState, useEffect, useRef } from "react";

/**
 * A custom React hook to determine if the mouse pointer is within a specified
 * percentage of an element's size from its center.
 *
 * @param {number} initialDistancePercentage - The distance in percentage from the
 *   element's center within which the mouse is considered "near." Default is 80.
 * @returns {Array} A tuple containing a boolean value indicating whether the mouse
 *   is near the element's center and a ref object to attach to the target element.
 */
export function useMouseProximity(
  initialDistancePercentage: number = 80,
): [boolean, React.MutableRefObject<any>] {
  const [isNear, setIsNear] = useState<boolean>(false);
  const elementRef = useRef<any>(null);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const element = elementRef.current;
      if (!element) return;

      // Get the coordinates of the mouse pointer
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Get the position and dimensions of the element
      const elementRect = element.getBoundingClientRect();
      const elementWidth = elementRect.width;
      const elementHeight = elementRect.height;
      const elementX = elementRect.left;
      const elementY = elementRect.top;

      // Calculate the distance between the mouse and the center of the element
      const centerX = elementX + elementWidth / 2;
      const centerY = elementY + elementHeight / 2;
      const distanceX = Math.abs(mouseX - centerX);
      const distanceY = Math.abs(mouseY - centerY);

      // Calculate the threshold distance based on the specified percentage
      const thresholdX =
        ((initialDistancePercentage / 100) * elementWidth + elementWidth) / 2;
      const thresholdY =
        ((initialDistancePercentage / 100) * +elementHeight) / 2;

      // Check if the mouse is within the threshold distance on both X and Y axes
      if (distanceX <= thresholdX && distanceY <= thresholdY) {
        setIsNear(true);
      } else {
        setIsNear(false);
      }
    }

    // Add mousemove event listener to track mouse position
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [initialDistancePercentage]);

  return [isNear, elementRef];
}
