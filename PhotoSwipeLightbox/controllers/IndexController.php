<?php
/**
 * Controller for handling image downloads
 */
class PhotoSwipeLightbox_IndexController extends Omeka_Controller_AbstractActionController
{
    /**
     * Download all images for an item as a ZIP file
     */
    public function downloadAction()
    {
        // Turn off the view and layout
        $this->_helper->viewRenderer->setNoRender(true);
        if ($layout = Zend_Layout::getMvcInstance()) {
            $layout->disableLayout();
        }

        // Validate item ID
        $itemId = (int)$this->_getParam('itemId');
        if (!$itemId) {
            throw new Omeka_Controller_Exception_404('Invalid item ID.');
        }

        // Get the item
        $item = get_record_by_id('Item', $itemId);
        if (!$item) {
            throw new Omeka_Controller_Exception_404('Item not found.');
        }

        // Gather all image files for this item
        $files = get_db()->getTable('File')->findByItem($itemId);
        $images = array_filter($files, function($f) {
            return strpos($f->mime_type, 'image/') === 0;
        });

        if (empty($images)) {
            $this->_helper->flashMessenger('No images found for this item.', 'error');
            return $this->_helper->redirector('show', 'items', null, array('id' => $itemId));
        }

        // Create a temporary ZIP file
        $zip = new ZipArchive;
        $tempFile = tempnam(sys_get_temp_dir(), 'omeka_item_' . $itemId . '_');

        if ($zip->open($tempFile, ZipArchive::OVERWRITE) !== true) {
            $this->_helper->flashMessenger('Could not create ZIP archive.', 'error');
            return $this->_helper->redirector('show', 'items', null, array('id' => $itemId));
        }

        // Add each image to the ZIP
        $addedCount = 0;
        foreach ($images as $file) {
            $originalPath = FILES_DIR . '/original/' . $file->filename;
            if (file_exists($originalPath) && is_readable($originalPath)) {
                // Use the original filename or a sanitized version
                $filename = $file->original_filename ? $file->original_filename : $file->filename;
                $zip->addFile($originalPath, $filename);
                $addedCount++;
            }
        }

        $zip->close();

        // If no files were actually added, clean up and return error
        if ($addedCount === 0) {
            @unlink($tempFile);
            $this->_helper->flashMessenger('No readable image files found.', 'error');
            return $this->_helper->redirector('show', 'items', null, array('id' => $itemId));
        }

        // Get item title for filename (sanitized)
        $itemTitle = metadata($item, array('Dublin Core', 'Title'));
        $safeTitle = preg_replace('/[^A-Za-z0-9_\-]/', '_', $itemTitle);
        $safeTitle = substr($safeTitle, 0, 50); // Limit length
        $zipFilename = $safeTitle ? $safeTitle . '_images.zip' : 'Item_' . $itemId . '_images.zip';

        // Stream the ZIP file to the user
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
        header('Content-Length: ' . filesize($tempFile));
        header('Pragma: no-cache');
        header('Expires: 0');

        readfile($tempFile);

        // Clean up temporary file
        @unlink($tempFile);
        exit;
    }
}
