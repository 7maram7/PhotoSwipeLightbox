# PhotoSwipe Lightbox Plugin for Omeka Classic

A comprehensive image viewing plugin for Omeka Classic that provides both a beautiful lightbox gallery experience and the ability to download all images from an item.

## Features

### 1. PhotoSwipe Image Gallery
- **Touch-enabled swipe navigation** - Swipe between images on mobile devices
- **Dark overlay background** - Professional presentation with 85% opacity overlay
- **Zoom functionality** - Zoom in/out with pinch gestures or buttons
- **Keyboard navigation** - Use arrow keys to navigate, ESC to close
- **Full-screen mode** - View images in full-screen for maximum impact
- **Responsive design** - Works seamlessly on desktop, tablet, and mobile

### 2. Download All Images
- **One-click download** - Download all images from an item as a single ZIP file
- **Original quality** - Downloads the original full-size image files
- **Smart naming** - ZIP filename includes the item title
- **Automatic positioning** - Button appears automatically on item pages with images

## Installation

1. Download the plugin
2. Extract to your Omeka `plugins` directory as `PhotoSwipeLightbox`
3. Go to Admin → Settings → Plugins
4. Click "Install" next to PhotoSwipe Lightbox
5. Activate the plugin

## Usage

### PhotoSwipe Lightbox

Once installed, the plugin automatically enhances all image galleries on item show pages:

1. Visit any item page that contains images
2. Click on any image thumbnail
3. The PhotoSwipe lightbox opens automatically
4. Navigate using:
   - **Swipe** left/right on touch devices
   - **Arrow keys** on desktop
   - **Next/Previous buttons**
   - **ESC** to close

### Download All Images

The download button appears automatically on any item page that contains images:

1. Visit an item page with images
2. Look for the "Download All Images" button (appears near the image gallery)
3. Click to download a ZIP file containing all original images
4. The ZIP filename will be based on the item title

## Technical Details

### PhotoSwipe Configuration

- Uses PhotoSwipe v4.1.3 from CDN
- Background opacity: 85%
- Max zoom level: 5x
- Double-tap zoom: 1:1 (actual pixel size)
- Close on vertical drag: enabled

### Download Functionality

- Creates temporary ZIP files in system temp directory
- Automatically cleans up temporary files after download
- Preserves original filenames
- Only includes actual image files (based on MIME type)

### Compatibility

- Requires Omeka Classic 2.0 or higher
- Tested with Omeka 3.1
- Works with all standard Omeka themes
- Compatible with custom themes using standard Omeka structure

### Container Detection

The plugin intelligently detects image containers in the following order:

1. `#item-images` (preferred)
2. `#content` (fallback)

### Excluding Links from PhotoSwipe

If you have specific links you don't want PhotoSwipe to process, add the `data-no-lightbox` or `data-bypass-lightbox` attribute:

```html
<a href="image.jpg" data-no-lightbox="true">
    <img src="thumbnail.jpg" alt="Not in gallery" />
</a>
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 8+)
- Chrome for Android

## Credits

- **PhotoSwipe** by Dmitry Semenov - https://photoswipe.com/
- **Plugin Development** by Aram Manasaryan

## License

MIT License

## Changelog

### Version 2.0
- Added download all images functionality
- Improved click handling to prevent interference with buttons
- Enhanced container detection
- Added support for data-no-lightbox attribute
- Better button styling and positioning

### Version 1.0
- Initial release with PhotoSwipe lightbox
- Basic gallery functionality
- Touch and swipe support
