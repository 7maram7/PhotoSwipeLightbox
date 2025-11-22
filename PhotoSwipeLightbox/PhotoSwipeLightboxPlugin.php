<?php
/**
 * PhotoSwipe Lightbox Plugin
 *
 * Provides PhotoSwipe v4 image gallery lightbox functionality for Omeka Classic.
 */
class PhotoSwipeLightboxPlugin extends Omeka_Plugin_AbstractPlugin
{
    protected $_hooks = array(
        'public_head',
        'public_footer'
    );

    /**
     * Add PhotoSwipe CSS to item show pages
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
