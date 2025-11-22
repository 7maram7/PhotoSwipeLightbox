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
        'define_routes',
        'public_items_show'
    );
    /**
     * Define custom routes for the plugin
     */
    public function hookDefineRoutes($args)
    {
        $router = $args['router'];

        // Don't add routes in admin theme
        if (is_admin_theme()) {
            return;
        }

        // Add route for downloading all images from an item
        $router->addRoute(
            'photoswipe_download_images',
            new Zend_Controller_Router_Route(
                'item/:itemId/download-images',
                array(
                    'module'     => 'photoswipe-lightbox',
                    'controller' => 'index',
                    'action'     => 'download',
                ),
                array('itemId' => '\d+')
            )
        );
    }

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

        // Custom styles for download button - neutral styling that adapts to theme
        echo '<style type="text/css">' . "\n";
        echo '.download-all-images-wrapper { margin: 1em 0; }' . "\n";
        echo '.download-all-images-button { display: inline-block; padding: 0.5em 1em; text-decoration: none; border: 1px solid #ccc; background: #f5f5f5; color: #333 !important; border-radius: 2px; transition: all 0.2s; }' . "\n";
        echo '.download-all-images-button:hover { background: #e9e9e9; border-color: #999; }' . "\n";
        echo '.download-all-images-button:before { content: "↓ "; font-weight: bold; }' . "\n";
        echo '</style>' . "\n";

        // Script to reposition the download button
        echo '<script type="text/javascript">' . "\n";
        echo 'if (typeof jQuery !== "undefined") {' . "\n";
        echo '  jQuery(document).ready(function($) {' . "\n";
        echo '    var btn = $(".download-all-images-wrapper");' . "\n";
        echo '    if (btn.length) {' . "\n";
        echo '      var itemFiles = $("#itemfiles, #item-images, .item-file");' . "\n";
        echo '      var collection = $("#collection");' . "\n";
        echo '      if (itemFiles.length) {' . "\n";
        echo '        btn.insertAfter(itemFiles.last());' . "\n";
        echo '      } else if (collection.length) {' . "\n";
        echo '        btn.insertBefore(collection.first());' . "\n";
        echo '      }' . "\n";
        echo '    }' . "\n";
        echo '  });' . "\n";
        echo '}' . "\n";
        echo '</script>' . "\n";
    }
    /**
     * Output download button on item show pages
     */
    public function hookPublicItemsShow($args)
    {
        $item = $args['item'];
        $view = $args['view'];

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

        // Generate download URL
        $url = $view->url(
            array('itemId' => $item->id),
            'photoswipe_download_images'
        );

        // Output the download button with data-no-lightbox to prevent PhotoSwipe from processing it
        echo '<div class="download-all-images-wrapper">';
        echo '<a href="' . html_escape($url) . '" class="download-all-images-button button" data-no-lightbox="true">';
        echo __('Download All Images');
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
        echo '<script src="' . $jsPath . '?v=4"></script>' . "\n";

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