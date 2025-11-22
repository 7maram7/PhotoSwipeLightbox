(function() {
    'use strict';

    console.log('=== PhotoSwipe Init Script Loaded ===');

    var initPhotoSwipeFromDOM = function(gallerySelector) {

        console.log('1. Starting initialization for selector:', gallerySelector);

        var galleryElement = document.querySelector(gallerySelector);
        console.log('2. Gallery element found:', galleryElement);

        if(!galleryElement) {
            console.error('ERROR: Gallery element not found!');
            return;
        }

        var galleryItems = [];

        var parseThumbnailElements = function(el) {
            // Find ALL links in the gallery container
            var allLinks = el.querySelectorAll('a');
            var items = [];

            console.log('3. Found ' + allLinks.length + ' total links');

            for(var i = 0; i < allLinks.length; i++) {
                var linkEl = allLinks[i];

                // Skip if already processed
                if(linkEl.classList.contains('pswp-processed')) {
                    continue;
                }

                // Must contain an img tag to be a gallery item
                var img = linkEl.querySelector('img');
                if(!img) {
                    continue;
                }

                // Must link to an image file (check href for image patterns)
                var href = linkEl.getAttribute('href') || '';
                if(!/\.(jpg|jpeg|png|gif|webp|bmp|tiff)/i.test(href) && !href.includes('/files/')) {
                    continue;
                }

                console.log('4. Processing image link ' + items.length + ':', href);

                // Check for data-size attribute first
                var size = linkEl.getAttribute('data-size');
                var item;
                if(size) {
                    size = size.split('x');
                    item = {
                        src: href,
                        w: parseInt(size[0], 10),
                        h: parseInt(size[1], 10)
                    };
                } else {
                    // No data-size, we'll load the image to get real dimensions
                    item = {
                        src: href,
                        w: 0,
                        h: 0
                    };
                }

                // Get title from img alt or title
                if(img.getAttribute('alt')) {
                    item.title = img.getAttribute('alt');
                } else if(img.getAttribute('title')) {
                    item.title = img.getAttribute('title');
                }

                item.el = linkEl;
                items.push(item);

                // Mark as processed
                linkEl.classList.add('pswp-processed');
                console.log('   ✓ Added to gallery');
            }

            console.log('5. Total gallery items:', items.length);
            return items;
        };

        var preloadImageSize = function(items, callback) {
            var loadedCount = 0;
            var totalItems = items.length;

            if(totalItems === 0) {
                if(callback) callback();
                return;
            }

            console.log('6. Preloading dimensions for', totalItems, 'images');

            items.forEach(function(item, index) {
                // If dimensions already set, skip
                if(item.w > 0 && item.h > 0) {
                    loadedCount++;
                    if(loadedCount === totalItems && callback) {
                        callback();
                    }
                    return;
                }

                // Create temporary image to get dimensions
                var tempImg = new Image();
                tempImg.onload = function() {
                    item.w = this.width;
                    item.h = this.height;
                    console.log('   Loaded dimensions for image', index, ':', this.width, 'x', this.height);
                    loadedCount++;

                    if(loadedCount === totalItems && callback) {
                        console.log('7. All dimensions loaded');
                        callback();
                    }
                };
                tempImg.onerror = function() {
                    // If image fails to load, use reasonable defaults
                    item.w = 1200;
                    item.h = 800;
                    console.log('   Failed to load image', index, '- using defaults');
                    loadedCount++;

                    if(loadedCount === totalItems && callback) {
                        callback();
                    }
                };
                tempImg.src = item.src;
            });
        };

        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        var onThumbnailsClick = function(e) {
            e = e || window.event;

            var eTarget = e.target || e.srcElement;

            // Find the closest link element
            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'A');
            });

            if(!clickedListItem) {
                return;
            }

            // Check if this is a PhotoSwipe-processed image link
            if(!clickedListItem.classList.contains('pswp-processed')) {
                // Not a gallery image, allow normal link behavior
                return;
            }

            console.log('=== IMAGE CLICK DETECTED ===');

            // Prevent default and open gallery
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            e.stopPropagation();

            var allLinks = galleryElement.querySelectorAll('a.pswp-processed');
            var index = -1;

            for (var i = 0; i < allLinks.length; i++) {
                if(allLinks[i] === clickedListItem) {
                    index = i;
                    break;
                }
            }

            console.log('Opening gallery at index:', index);

            if(index >= 0) {
                openPhotoSwipe(index);
            }

            return false;
        };

        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1);
            var params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function(index, disableAnimation, fromURL) {
            console.log('=== OPENING PHOTOSWIPE ===');
            console.log('Index:', index);

            var pswpElement = document.querySelectorAll('.pswp')[0];

            if(!pswpElement) {
                console.error('CRITICAL ERROR: PhotoSwipe HTML structure not found!');
                return;
            }

            if(typeof PhotoSwipe === 'undefined' || typeof PhotoSwipeUI_Default === 'undefined') {
                console.error('CRITICAL ERROR: PhotoSwipe library not loaded!');
                return;
            }

            if(galleryItems.length === 0) {
                console.error('ERROR: No items in gallery!');
                return;
            }

            var options = {
                bgOpacity: 0.85,
                closeOnVerticalDrag: true,
                showAnimationDuration: 333,
                hideAnimationDuration: 333,
                index: parseInt(index, 10),
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                // Allow more zoom
                maxSpreadZoom: 5,

                // Start at actual pixel size (1:1 ratio)
                getDoubleTapZoom: function(isMouseClick, item) {
                    return 1;
                },

                getThumbBoundsFn: function(index) {
                    var thumbnail = galleryItems[index].el.querySelector('img');
                    var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    var rect = thumbnail.getBoundingClientRect();

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                }
            };

            if(fromURL) {
                if(options.galleryPIDs) {
                    for(var j = 0; j < galleryItems.length; j++) {
                        if(galleryItems[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            if(isNaN(options.index)) {
                console.error('ERROR: Invalid index');
                return;
            }

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            console.log('Creating PhotoSwipe with', galleryItems.length, 'items');
            console.log('Item dimensions:', galleryItems[index].w, 'x', galleryItems[index].h);

            try {
                var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, galleryItems, options);

                // Listen for the gettingData event to ensure we have dimensions
                gallery.listen('gettingData', function(index, item) {
                    if (item.w < 1 || item.h < 1) {
                        var img = new Image();
                        img.onload = function() {
                            item.w = this.width;
                            item.h = this.height;
                            gallery.invalidateCurrItems();
                            gallery.updateSize(true);
                        };
                        img.src = item.src;
                    }
                });

                gallery.init();
                console.log('✓ PhotoSwipe opened successfully!');
            } catch(error) {
                console.error('ERROR creating PhotoSwipe:', error);
            }
        };

        // Parse and preload
        console.log('Parsing gallery items...');
        galleryItems = parseThumbnailElements(galleryElement);

        if(galleryItems.length === 0) {
            console.log('No gallery items found - PhotoSwipe will not be initialized');
            return;
        }

        preloadImageSize(galleryItems, function() {
            console.log('8. Gallery ready with', galleryItems.length, 'items');
        });

        galleryElement.setAttribute('data-pswp-uid', 1);
        galleryElement.addEventListener('click', onThumbnailsClick, false);

        console.log('9. Click event listener attached to', gallerySelector);
        console.log('=== PHOTOSWIPE INITIALIZATION COMPLETE ===');

        var hashData = photoswipeParseHash();
        if(hashData.pid && hashData.gid) {
            openPhotoSwipe(hashData.pid - 1, true, true);
        }
    };

    // Initialize when DOM is ready
    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing PhotoSwipe');
            initPhotoSwipeFromDOM('#content');
        });
    } else {
        console.log('DOM already loaded, initializing PhotoSwipe immediately');
        initPhotoSwipeFromDOM('#content');
    }

})();
