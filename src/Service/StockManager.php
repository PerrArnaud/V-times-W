<?php

namespace App\Service;

use App\Entity\Stock;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Service de gestion du stock des produits.
 */
class StockManager
{
    private const UPLOAD_DIR = '/public/images/products';

    public function __construct(
        private EntityManagerInterface $entityManager,
        private SluggerInterface $slugger,
        private string $projectDir
    ) {
    }

    /**
     * Vérifie si un produit a suffisamment de stock disponible.
     */
    public function hasAvailableStock(Stock $stock, int $quantity): bool
    {
        return $stock->getQuantity() !== null && $stock->getQuantity() >= $quantity;
    }

    /**
     * Décrémente le stock d'un produit.
     *
     * @throws \InvalidArgumentException Si le stock est insuffisant
     */
    public function decrementStock(Stock $stock, int $quantity): void
    {
        if (!$this->hasAvailableStock($stock, $quantity)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Stock insuffisant. Il ne reste que %d unité(s) disponible(s).',
                    $stock->getQuantity() ?? 0
                )
            );
        }

        $stock->setQuantity($stock->getQuantity() - $quantity);
        $this->entityManager->flush();
    }

    /**
     * Incrémente le stock d'un produit (en cas d'annulation par exemple).
     */
    public function incrementStock(Stock $stock, int $quantity): void
    {
        $currentQuantity = $stock->getQuantity() ?? 0;
        $stock->setQuantity($currentQuantity + $quantity);
        $this->entityManager->flush();
    }

    /**
     * Gère l'upload d'une image de produit.
     *
     * @return string|null Le nom du fichier uploadé ou null si pas d'upload
     * @throws \RuntimeException En cas d'erreur d'upload
     */
    public function handleImageUpload(?UploadedFile $imageFile): ?string
    {
        if (!$imageFile) {
            return null;
        }

        $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $imageFile->guessExtension();

        try {
            $imageFile->move(
                $this->projectDir . self::UPLOAD_DIR,
                $newFilename
            );
            return $newFilename;
        } catch (\Exception $e) {
            throw new \RuntimeException('Erreur lors de l\'upload de l\'image: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Supprime une image de produit du système de fichiers.
     */
    public function deleteImage(string $filename): bool
    {
        $imagePath = $this->projectDir . self::UPLOAD_DIR . '/' . $filename;
        
        if (file_exists($imagePath)) {
            return unlink($imagePath);
        }
        
        return false;
    }

    /**
     * Remplace l'image d'un produit.
     *
     * @return string|null Le nom du nouveau fichier ou null si pas de changement
     */
    public function replaceImage(Stock $stock, ?UploadedFile $newImageFile): ?string
    {
        if (!$newImageFile) {
            return null;
        }

        $newFilename = $this->handleImageUpload($newImageFile);

        // Supprimer l'ancienne image
        $oldImage = $stock->getImage();
        if ($oldImage) {
            $this->deleteImage($oldImage);
        }

        return $newFilename;
    }

    /**
     * Persiste un nouveau produit en base de données.
     */
    public function createStock(Stock $stock): void
    {
        $this->entityManager->persist($stock);
        $this->entityManager->flush();
    }

    /**
     * Met à jour un produit existant.
     */
    public function updateStock(Stock $stock): void
    {
        $this->entityManager->flush();
    }

    /**
     * Supprime un produit de la base de données.
     */
    public function deleteStock(Stock $stock): void
    {
        // Supprimer l'image associée
        if ($stock->getImage()) {
            $this->deleteImage($stock->getImage());
        }

        $this->entityManager->remove($stock);
        $this->entityManager->flush();
    }

    /**
     * Calcule le prix total pour une quantité donnée.
     */
    public function calculateTotalPrice(Stock $stock, int $quantity): float
    {
        return $stock->getPrice() * $quantity;
    }
}
