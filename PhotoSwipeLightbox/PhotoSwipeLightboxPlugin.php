<?php
/**
 * PhotoSwipe Lightbox Plugin
 *
 * Provides PhotoSwipe image gallery with lightbox functionality
 * and the ability to download all images from an item as a ZIP file.
 */
class PhotoSwipeLightboxPlugin extends Omeka_Plugin_AbstractPlugin
{
    protected $_hooks = array(
        'public_head',
        'public_footer',
        'public_items_show'
    );

    /**
     * Add PhotoSwipe CSS and custom styles to item show pages
     */
    public function hookPublicHead($args)
    {
        // Only load on item show pages
        $request = Zend_Controller_Front::getInstance()->getRequest();
        if ($request->getControllerName() !== 'items' || $request->getActionName() !== 'show') {
            return;
        }

        // PhotoSwipe v4 CSS
        echo '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.3/photoswipe.min.css" />' . "\n";
        echo '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.3/default-skin/default-skin.min.css" />' . "\n";

        // Minimal custom styles for download button
        echo '<style type="text/css">' . "\n";
        echo '.download-all-images-wrapper { margin: 0.5em 0; }' . "\n";
        echo '.download-all-images-button { display: inline-block; padding: 0.4em 0.8em; text-decoration: none; }' . "\n";
        echo '</style>' . "\n";
    }

    /**
     * Output download button on item show pages
     */
    public function hookPublicItemsShow($args)
    {
        $item = $args['item'];

        // Check if item has any image files
        $files = get_db()->getTable('File')->findByItem($item->id);
        $hasImages = false;

        foreach ($files as $file) {
            if (strpos($file->mime_type, 'image/') === 0) {
                $hasImages = true;
                break;
            }
        }

        // Only show button if item has images
        if (!$hasImages) {
            return;
        }

        // Generate download URL using Omeka plugin routing
        // Plugin folder name is PhotoSwipeLightbox, so URL starts with that
        $url = public_url('PhotoSwipeLightbox/index/download?item=' . $item->id);

        // Output the download button
        echo '<div class="download-all-images-wrapper">';
        echo '<a href="' . html_escape($url) . '" class="download-all-images-button">';
        echo '↓ ' . __('Download All Images');
        echo '</a>';
        echo '</div>' . "\n";
    }

    /**
     * Load PhotoSwipe JavaScript and HTML structure on item show pages
     */
    public function hookPublicFooter($args)
    {
        // Only load on item show pages
        $request = Zend_Controller_Front::getInstance()->getRequest();
        if ($request->getControllerName() !== 'items' || $request->getActionName() !== 'show') {
            return;
        }

        // PhotoSwipe v4 JavaScript
        echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.3/photoswipe.min.js"></script>' . "\n";
        echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.3/photoswipe-ui-default.min.js"></script>' . "\n";

        // Our custom initialization script
        $jsPath = public_url('plugins/PhotoSwipeLightbox/views/public/javascripts/photoswipe-init.js');
        echo '<script src="' . $jsPath . '?v=5"></script>' . "\n";

        // PhotoSwipe HTML structure
        echo $this->_getPhotoSwipeHTML();
    }

    private function _getPhotoSwipeHTML()
    {
        return '
<!-- Root element of PhotoSwipe -->
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="pswp__bg"></div>
    <div class="pswp__scroll-wrap">
        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
            <div class="pswp__top-bar">
                <div class="pswp__counter"></div>
                <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
                <button class="pswp__button pswp__button--share" title="Share"></button>
                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
                <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                        <div class="pswp__preloader__cut">
                            <div class="pswp__preloader__donut"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div class="pswp__share-tooltip"></div>
            </div>
            <button class="pswp__button pswp__button--arrow--left" title="Previous"></button>
            <button class="pswp__button pswp__button--arrow--right" title="Next"></button>
            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>
        </div>
    </div>
</div>';
    }
}
