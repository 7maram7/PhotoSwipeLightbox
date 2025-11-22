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
            var linkElements = el.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".gif"], a[href$=".JPG"], a[href$=".JPEG"], a[href$=".PNG"], a[href$=".GIF"]'),
                items = [];

            console.log('3. Found ' + linkElements.length + ' image links');

            for(var i = 0; i < linkElements.length; i++) {
                var linkEl = linkElements[i];

                // Skip if already processed
                if(linkEl.classList.contains('pswp-processed')) {
                    console.log('4. Link ' + i + ' already processed, skipping');
                    continue;
                }

                // Skip if this link has button-like attributes or classes
                if(linkEl.getAttribute('role') === 'button' ||
                   linkEl.classList.contains('button') ||
                   linkEl.classList.contains('btn')) {
                    console.log('4. Link ' + i + ' is a button, skipping');
                    continue;
                }

                var img = linkEl.querySelector('img');

                console.log('4. Processing link ' + i + ':', linkEl.href);

                // Must contain an img tag to be considered a gallery image
                if(!img) {
                    console.log('   - No img tag found, skipping');
                    continue;
                }
                
                // Check for data-size attribute first
                var size = linkEl.getAttribute('data-size');
                if(size) {
                    size = size.split('x');
                    var item = {
                        src: linkEl.getAttribute('href'),
                        w: parseInt(size[0], 10),
                        h: parseInt(size[1], 10)
                    };
                } else {
                    // No data-size, we'll load the image to get real dimensions
                    var item = {
                        src: linkEl.getAttribute('href'),
                        w: 0,
                        h: 0
                    };
                }

                if(img.getAttribute('alt')) {
                    item.title = img.getAttribute('alt');
                } else if(img.getAttribute('title')) {
                    item.title = img.getAttribute('title');
                }

                item.el = linkEl;
                items.push(item);
                
                linkEl.classList.add('pswp-processed');
                console.log('   - Added to gallery:', item);
            }

            console.log('5. Total items prepared:', items.length);
            return items;
        };

        var preloadImageSize = function(items, callback) {
            var loadedCount = 0;
            var totalItems = items.length;
            
            console.log('Preloading image dimensions for', totalItems, 'images');
            
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
                    console.log('Loaded dimensions for image', index, ':', this.width, 'x', this.height);
                    loadedCount++;
                    
                    if(loadedCount === totalItems && callback) {
                        console.log('All image dimensions loaded');
                        callback();
                    }
                };
                tempImg.onerror = function() {
                    // If image fails to load, use reasonable defaults
                    item.w = 1200;
                    item.h = 800;
                    console.log('Failed to load image', index, '- using defaults');
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

            // CRITICAL FIX: Check if this is a PhotoSwipe-processed image link FIRST
            // If not, don't interfere at all - just return without doing anything
            if(!clickedListItem.classList.contains('pswp-processed')) {
                // Not a gallery image, allow normal link behavior
                return;
            }

            // Additional safety check: skip if link has data-no-lightbox attribute
            if(clickedListItem.hasAttribute('data-no-lightbox') ||
               clickedListItem.hasAttribute('data-bypass-lightbox')) {
                return;
            }

            // Now we know it's a PhotoSwipe gallery link
            console.log('=== CLICK DETECTED ===');

            // Prevent default and open gallery
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            e.stopPropagation();

            var allLinks = galleryElement.querySelectorAll('a.pswp-processed'),
                index = -1;

            for (var i = 0; i < allLinks.length; i++) {
                if(allLinks[i] === clickedListItem) {
                    index = i;
                    break;
                }
            }

            console.log('Image index:', index);

            if(index >= 0) {
                openPhotoSwipe(index);
            }

            return false;
        };

        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
            params = {};

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
                    var thumbnail = galleryItems[index].el.querySelector('img'),
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

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

            console.log('Creating PhotoSwipe');
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
                console.log('PhotoSwipe opened successfully!');
            } catch(error) {
                console.error('ERROR creating PhotoSwipe:', error);
            }
        };

        // Parse and preload
        console.log('6. Parsing thumbnail elements...');
        galleryItems = parseThumbnailElements(galleryElement);
        
        console.log('7. Preloading original image dimensions...');
        preloadImageSize(galleryItems, function() {
            console.log('8. All dimensions loaded, gallery ready');
        });

        galleryElement.setAttribute('data-pswp-uid', 1);
        galleryElement.addEventListener('click', onThumbnailsClick, false);
        
        console.log('9. Click event listener attached');
        console.log('=== INITIALIZATION COMPLETE ===');

        var hashData = photoswipeParseHash();
        if(hashData.pid && hashData.gid) {
            openPhotoSwipe(hashData.pid - 1, true, true);
        }
    };

    // Initialize PhotoSwipe when DOM is ready
    // Try to target the most specific container first, fall back to #content
    var initGallery = function() {
        // Try common Omeka image gallery containers first
        var gallerySelectors = ['#item-images', '#content'];

        for (var i = 0; i < gallerySelectors.length; i++) {
            var element = document.querySelector(gallerySelectors[i]);
            if (element) {
                console.log('Initializing PhotoSwipe on:', gallerySelectors[i]);
                initPhotoSwipeFromDOM(gallerySelectors[i]);
                return;
            }
        }

        console.log('No suitable gallery container found');
    };

    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGallery);
    } else {
        initGallery();
    }

})();