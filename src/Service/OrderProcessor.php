<?php

namespace App\Service;

use App\Entity\PreOrder;
use App\Entity\Stock;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Service de traitement des commandes et pré-commandes.
 */
class OrderProcessor
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private StockManager $stockManager,
        private EmailNotifier $emailNotifier
    ) {
    }

    /**
     * Traite une pré-commande complète.
     *
     * @return array{success: bool, preOrder: PreOrder|null, totalPrice: float, message: string}
     */
    public function processPreOrder(PreOrder $preOrder): array
    {
        $stock = $preOrder->getProduit();
        $quantity = $preOrder->getQuantiteCommandee();

        // Vérifier la disponibilité du stock
        if (!$stock || !$stock->isAvailable()) {
            return [
                'success' => false,
                'preOrder' => null,
                'totalPrice' => 0,
                'message' => 'Le produit sélectionné n\'est pas disponible.'
            ];
        }

        // Vérifier la quantité disponible
        if (!$this->stockManager->hasAvailableStock($stock, $quantity)) {
            return [
                'success' => false,
                'preOrder' => null,
                'totalPrice' => 0,
                'message' => sprintf(
                    'Stock insuffisant. Il ne reste que %d unité(s) disponible(s).',
                    $stock->getQuantity() ?? 0
                )
            ];
        }

        // Utiliser une transaction pour garantir la cohérence
        $this->entityManager->beginTransaction();

        try {
            // Décrémenter le stock
            $this->stockManager->decrementStock($stock, $quantity);

            // Calculer le prix total
            $totalPrice = $this->stockManager->calculateTotalPrice($stock, $quantity);

            // Persister la pré-commande
            $this->entityManager->persist($preOrder);
            $this->entityManager->flush();

            // Envoyer les emails de notification
            $this->emailNotifier->sendPreOrderConfirmation($preOrder, $totalPrice);
            $this->emailNotifier->sendAdminNotification($preOrder, $totalPrice);

            $this->entityManager->commit();

            return [
                'success' => true,
                'preOrder' => $preOrder,
                'totalPrice' => $totalPrice,
                'message' => 'Pré-commande enregistrée avec succès.'
            ];
        } catch (\Exception $e) {
            $this->entityManager->rollback();
            
            return [
                'success' => false,
                'preOrder' => null,
                'totalPrice' => 0,
                'message' => 'Une erreur est survenue lors du traitement de la commande: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Annule une pré-commande et restaure le stock.
     */
    public function cancelPreOrder(PreOrder $preOrder): void
    {
        $stock = $preOrder->getProduit();
        $quantity = $preOrder->getQuantiteCommandee();

        // Restaurer le stock
        if ($stock) {
            $this->stockManager->incrementStock($stock, $quantity);
        }

        // Mettre à jour le statut
        $preOrder->setStatut('cancelled');
        $this->entityManager->flush();

        // Notifier par email
        $this->emailNotifier->sendCancellationNotification($preOrder);
    }

    /**
     * Valide qu'une pré-commande peut être traitée.
     */
    public function validatePreOrder(PreOrder $preOrder): array
    {
        $errors = [];

        if (!$preOrder->getProduit()) {
            $errors[] = 'Aucun produit sélectionné.';
        }

        if ($preOrder->getQuantiteCommandee() < 1) {
            $errors[] = 'La quantité doit être au moins de 1.';
        }

        if ($preOrder->getQuantiteCommandee() > 10) {
            $errors[] = 'La quantité ne peut pas dépasser 10 unités.';
        }

        if (!filter_var($preOrder->getEmail(), FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'L\'adresse email n\'est pas valide.';
        }

        return $errors;
    }

    /**
     * Calcule le prix total d'une pré-commande.
     */
    public function calculatePreOrderTotal(PreOrder $preOrder): float
    {
        $stock = $preOrder->getProduit();
        $quantity = $preOrder->getQuantiteCommandee();

        if (!$stock) {
            return 0.0;
        }

        return $this->stockManager->calculateTotalPrice($stock, $quantity);
    }

    /**
     * Récupère les statistiques des pré-commandes.
     */
    public function getPreOrderStatistics(): array
    {
        $repository = $this->entityManager->getRepository(PreOrder::class);
        
        $total = $repository->count([]);
        $pending = $repository->count(['statut' => 'pending']);
        $completed = $repository->count(['statut' => 'completed']);
        $cancelled = $repository->count(['statut' => 'cancelled']);

        return [
            'total' => $total,
            'pending' => $pending,
            'completed' => $completed,
            'cancelled' => $cancelled
        ];
    }
}
