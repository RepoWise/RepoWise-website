window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;
var INTERPOLATION_ENABLED = false; // Assets are not bundled, so avoid loading missing images

var interp_images = [];
function setInterpolationImage(i) {
  var image = interp_images[i];
  if (!image) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    image = new Image();
    image.src = path;
    image.ondragstart = function() { return false; };
    image.oncontextmenu = function() { return false; };
    interp_images[i] = image;
  }
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    var $slider = $('#interpolation-slider');
    var $imageWrapper = $('#interpolation-image-wrapper');

    if ($slider.length && $imageWrapper.length) {
      if (!INTERPOLATION_ENABLED) {
        $imageWrapper.text('The interpolation demo is disabled because the image assets are not bundled.');
        $slider.prop('disabled', true);
      } else {
        $slider.on('input', function(event) {
          setInterpolationImage(this.value);
        });
        setInterpolationImage(0);
        $slider.prop('max', NUM_INTERP_FRAMES - 1);
        bulmaSlider.attach();
      }
    }

})
