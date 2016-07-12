"use strict";

(function () {
  if (!window.addEventListener) return; // Check for IE9+

  var _window = window;
  var tinycolor = _window.tinycolor;

  var getComputedStyle = document.defaultView.getComputedStyle || window.getComputedStyle;
  var topThreshhold = 100; // px
  var animation = null;
  var duration = null; // ms
  var startTime = null;
  var startPosition = null;
  var backToTopping = false;

  var options = INSTALL_OPTIONS;
  var element = void 0;
  var text = void 0;

  function getColors() {
    var backgroundColor = void 0;

    if (options.backgroundColor) {
      backgroundColor = tinycolor(options.backgroundColor);
    } else {
      var documentBackgroundColor = getComputedStyle(document.body).backgroundColor;
      var components = tinycolor(documentBackgroundColor).toHsl();

      // Find contrasting color.
      components.l = Math.abs((components.l + 0.5) % 1) + (1 - components.s) * 0.15;
      backgroundColor = tinycolor(components);
    }

    var iconColor = backgroundColor.clone();

    backgroundColor.setAlpha(0.18);

    return {
      backgroundColor: backgroundColor.toRgbString(),
      iconColor: iconColor.toRgbString()
    };
  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  function resetPositions() {
    startTime = null;
    startPosition = null;
    backToTopping = false;
  }

  function animateLoop(time) {
    if (!startTime) startTime = time;

    var timeSoFar = time - startTime;
    var easedPosition = easeInOutQuad(timeSoFar, startPosition, -startPosition, duration);

    window.scrollTo(0, easedPosition);

    if (timeSoFar < duration) {
      animation = requestAnimationFrame(animateLoop);
    } else {
      resetPositions();
    }
  }

  function backToTop() {
    if (backToTopping) return;

    backToTopping = true;
    startPosition = document.documentElement.scrollTop || document.body.scrollTop;
    duration = startPosition / 2;

    requestAnimationFrame(animateLoop);
  }

  function setVisibility() {
    if (!element) return;

    var visibility = window.scrollY > topThreshhold ? "visible" : "hidden";

    element.setAttribute("visibility", visibility);
  }

  function setShape() {
    if (!element) return;

    element.setAttribute("shape", options.shape);
  }

  function setColors() {
    if (!element || !text) return;

    var _getColors = getColors();

    var backgroundColor = _getColors.backgroundColor;
    var iconColor = _getColors.iconColor;


    element.style.backgroundColor = backgroundColor;
    text.style.color = iconColor;
  }

  function updateElement() {
    element = Eager.createElement({ selector: "body", method: "append" }, element);
    element.setAttribute("app-id", "back-to-top-button");
    element.addEventListener("click", backToTop);

    text = document.createElement("text");
    text.textContent = "⇧";
    element.appendChild(text);

    setVisibility();
    setShape();
    setColors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateElement);
  } else {
    updateElement();
  }

  window.addEventListener("blur", function () {
    if (!element) return;

    if (backToTopping) {
      cancelAnimationFrame(animation);
      resetPositions();
      window.scrollTo(0, 0);
    }
  });

  window.addEventListener("scroll", setVisibility);

  window.INSTALL_SCOPE = {
    updateColors: function updateColors(nextOptions) {
      options = nextOptions;

      setColors();
    },
    updateShape: function updateShape(nextOptions) {
      options = nextOptions;

      setShape();
    }
  };
})();