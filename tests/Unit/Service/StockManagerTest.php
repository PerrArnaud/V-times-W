<?php

namespace App\Tests\Unit\Service;

use App\Entity\Stock;
use App\Service\StockManager;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class StockManagerTest extends TestCase
{
    private EntityManagerInterface $entityManager;
    private SluggerInterface $slugger;
    private StockManager $stockManager;
    private string $projectDir;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->slugger = $this->createMock(SluggerInterface::class);
        $this->projectDir = sys_get_temp_dir() . '/test_project';
        
        // Créer le répertoire temporaire pour les tests
        if (!is_dir($this->projectDir . '/public/images/products')) {
            mkdir($this->projectDir . '/public/images/products', 0777, true);
        }

        $this->stockManager = new StockManager(
            $this->entityManager,
            $this->slugger,
            $this->projectDir
        );
    }

    protected function tearDown(): void
    {
        // Nettoyer les fichiers de test
        if (is_dir($this->projectDir)) {
            $this->removeDirectory($this->projectDir);
        }
    }

    private function removeDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->removeDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }

    public function testHasAvailableStockReturnsTrueWhenStockIsSufficient(): void
    {
        $stock = new Stock();
        $stock->setQuantity(10);

        $result = $this->stockManager->hasAvailableStock($stock, 5);

        $this->assertTrue($result);
    }

    public function testHasAvailableStockReturnsFalseWhenStockIsInsufficient(): void
    {
        $stock = new Stock();
        $stock->setQuantity(3);

        $result = $this->stockManager->hasAvailableStock($stock, 5);

        $this->assertFalse($result);
    }

    public function testHasAvailableStockReturnsFalseWhenStockIsNull(): void
    {
        $stock = new Stock();
        $stock->setQuantity(null);

        $result = $this->stockManager->hasAvailableStock($stock, 1);

        $this->assertFalse($result);
    }

    public function testDecrementStockSuccessfully(): void
    {
        $stock = new Stock();
        $stock->setQuantity(10);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->stockManager->decrementStock($stock, 3);

        $this->assertEquals(7, $stock->getQuantity());
    }

    public function testDecrementStockThrowsExceptionWhenInsufficientStock(): void
    {
        $stock = new Stock();
        $stock->setQuantity(2);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Stock insuffisant');

        $this->stockManager->decrementStock($stock, 5);
    }

    public function testIncrementStock(): void
    {
        $stock = new Stock();
        $stock->setQuantity(5);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->stockManager->incrementStock($stock, 3);

        $this->assertEquals(8, $stock->getQuantity());
    }

    public function testIncrementStockWhenQuantityIsNull(): void
    {
        $stock = new Stock();
        $stock->setQuantity(null);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->stockManager->incrementStock($stock, 5);

        $this->assertEquals(5, $stock->getQuantity());
    }

    public function testHandleImageUploadReturnsNullWhenNoFile(): void
    {
        $result = $this->stockManager->handleImageUpload(null);

        $this->assertNull($result);
    }

    public function testHandleImageUploadSuccessfully(): void
    {
        // Créer un fichier temporaire pour le test
        $tempFile = tempnam(sys_get_temp_dir(), 'test_image_');
        file_put_contents($tempFile, 'fake image content');

        $uploadedFile = new UploadedFile(
            $tempFile,
            'test-image.jpg',
            'image/jpeg',
            null,
            true
        );

        $this->slugger->expects($this->once())
            ->method('slug')
            ->with('test-image')
            ->willReturn('test-image');

        $result = $this->stockManager->handleImageUpload($uploadedFile);

        $this->assertNotNull($result);
        $this->assertStringStartsWith('test-image-', $result);
        $this->assertStringEndsWith('.jpg', $result);

        // Vérifier que le fichier a été déplacé
        $uploadedPath = $this->projectDir . '/public/images/products/' . $result;
        $this->assertFileExists($uploadedPath);
    }

    public function testDeleteImageReturnsTrueWhenFileExists(): void
    {
        // Créer un fichier de test
        $filename = 'test-file.jpg';
        $filepath = $this->projectDir . '/public/images/products/' . $filename;
        file_put_contents($filepath, 'test content');

        $result = $this->stockManager->deleteImage($filename);

        $this->assertTrue($result);
        $this->assertFileDoesNotExist($filepath);
    }

    public function testDeleteImageReturnsFalseWhenFileDoesNotExist(): void
    {
        $result = $this->stockManager->deleteImage('non-existent-file.jpg');

        $this->assertFalse($result);
    }

    public function testCreateStock(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($stock);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->stockManager->createStock($stock);
    }

    public function testUpdateStock(): void
    {
        $stock = new Stock();
        $stock->setName('Updated Product');

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->stockManager->updateStock($stock);
    }

    public function testDeleteStock(): void
    {
        $stock = new Stock();
        $stock->setImage('test-image.jpg');

        // Créer l'image pour le test
        $filepath = $this->projectDir . '/public/images/products/test-image.jpg';
        file_put_contents($filepath, 'test content');

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($stock);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->stockManager->deleteStock($stock);

        // Vérifier que l'image a été supprimée
        $this->assertFileDoesNotExist($filepath);
    }

    public function testCalculateTotalPrice(): void
    {
        $stock = new Stock();
        $stock->setPrice(25.50);

        $result = $this->stockManager->calculateTotalPrice($stock, 3);

        $this->assertEquals(76.50, $result);
    }

    public function testReplaceImageReturnsNullWhenNoNewFile(): void
    {
        $stock = new Stock();
        $stock->setImage('old-image.jpg');

        $result = $this->stockManager->replaceImage($stock, null);

        $this->assertNull($result);
    }

    public function testReplaceImageSuccessfully(): void
    {
        $stock = new Stock();
        $stock->setImage('old-image.jpg');

        // Créer l'ancienne image
        $oldImagePath = $this->projectDir . '/public/images/products/old-image.jpg';
        file_put_contents($oldImagePath, 'old content');

        // Créer le nouveau fichier
        $tempFile = tempnam(sys_get_temp_dir(), 'new_image_');
        file_put_contents($tempFile, 'new image content');

        $uploadedFile = new UploadedFile(
            $tempFile,
            'new-image.jpg',
            'image/jpeg',
            null,
            true
        );

        $this->slugger->expects($this->once())
            ->method('slug')
            ->with('new-image')
            ->willReturn('new-image');

        $result = $this->stockManager->replaceImage($stock, $uploadedFile);

        $this->assertNotNull($result);
        $this->assertStringStartsWith('new-image-', $result);
        
        // Vérifier que l'ancienne image a été supprimée
        $this->assertFileDoesNotExist($oldImagePath);
        
        // Vérifier que la nouvelle image existe
        $newImagePath = $this->projectDir . '/public/images/products/' . $result;
        $this->assertFileExists($newImagePath);
    }
}
