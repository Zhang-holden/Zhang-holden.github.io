/* Sidebar navigation scroll-spy highlight */
(function ($) {
  "use strict";

  $(document).ready(function () {
    var navLinks = $(".sidebar__nav .nav__list a");
    if (navLinks.length === 0) { return; }

    // Map each anchor link to its target section id (href="/#about-me" -> "about-me")
    var targets = [];
    navLinks.each(function () {
      var m = (this.getAttribute("href") || "").match(/#([^/]+)$/);
      if (m) { targets.push({ link: this, id: m[1] }); }
    });

    // Collect section elements; skip silently if not on the page (sub-pages)
    var sections = [];
    $.each(targets, function () {
      var el = document.getElementById(this.id);
      if (el) { sections.push({ link: this.link, el: el }); }
    });
    if (sections.length === 0) { return; }

    var activeClass = "active";

    var highlight = function () {
      var pos = window.pageYOffset + 120; // offset matches smooth-scroll (-20) + header slack
      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        var top = $(sections[i].el).offset().top;
        if (top <= pos) { current = sections[i]; } else { break; }
      }
      navLinks.removeClass(activeClass);
      $(current.link).addClass(activeClass);
    };

    $(window).on("scroll resize", function () {
      window.requestAnimationFrame(highlight);
    });
    highlight();
  });
})(jQuery);
