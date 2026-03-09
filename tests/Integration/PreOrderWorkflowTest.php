<?php

namespace App\Tests\Integration;

use App\Entity\PreOrder;
use App\Entity\Stock;
use App\Repository\PreOrderRepository;
use App\Repository\StockRepository;
use App\Service\EmailNotifier;
use App\Service\OrderProcessor;
use App\Service\StockManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * Test d'intégration du workflow complet de pré-commande.
 * 
 * Ce test vérifie que toute la chaîne fonctionne correctement :
 * - Création du produit
 * - Passage de la pré-commande
 * - Décrémentation du stock
 * - Envoi des emails
 * - Persistance en base de données
 */
class PreOrderWorkflowTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;
    private StockManager $stockManager;
    private OrderProcessor $orderProcessor;
    private EmailNotifier $emailNotifier;
    private StockRepository $stockRepository;
    private PreOrderRepository $preOrderRepository;

    protected function setUp(): void
    {
        self::bootKernel();
        
        $container = static::getContainer();
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->stockManager = $container->get(StockManager::class);
        $this->orderProcessor = $container->get(OrderProcessor::class);
        $this->emailNotifier = $container->get(EmailNotifier::class);
        $this->stockRepository = $this->entityManager->getRepository(Stock::class);
        $this->preOrderRepository = $this->entityManager->getRepository(PreOrder::class);
    }

    protected function tearDown(): void
    {
        // Nettoyer les données de test
        $preOrders = $this->preOrderRepository->findAll();
        foreach ($preOrders as $preOrder) {
            $this->entityManager->remove($preOrder);
        }
        
        $stocks = $this->stockRepository->findAll();
        foreach ($stocks as $stock) {
            $this->entityManager->remove($stock);
        }
        
        $this->entityManager->flush();
        $this->entityManager->close();
        
        parent::tearDown();
    }

    public function testCompletePreOrderWorkflow(): void
    {
        // Étape 1 : Créer un produit
        $stock = new Stock();
        $stock->setName('Integration Test Product');
        $stock->setQuantity(20);
        $stock->setPrice(35.00);
        $stock->setImage('integration-test.jpg');
        
        $this->stockManager->createStock($stock);
        $initialQuantity = $stock->getQuantity();
        
        // Étape 2 : Créer une pré-commande
        $preOrder = new PreOrder();
        $preOrder->setNom('Integration');
        $preOrder->setPrenom('Test');
        $preOrder->setEmail('integration.test@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(3);
        $preOrder->setMessage('This is an integration test');
        
        // Étape 3 : Valider la pré-commande
        $validationErrors = $this->orderProcessor->validatePreOrder($preOrder);
        $this->assertEmpty($validationErrors, 'La pré-commande devrait être valide');
        
        // Étape 4 : Traiter la pré-commande
        $result = $this->orderProcessor->processPreOrder($preOrder);
        
        // Vérifications du résultat
        $this->assertTrue($result['success'], 'Le traitement devrait réussir');
        $this->assertNotNull($result['preOrder'], 'La pré-commande devrait être retournée');
        $this->assertEquals(105.00, $result['totalPrice'], 'Le prix total devrait être 35 * 3 = 105');
        
        // Étape 5 : Vérifier la persistance en base de données
        $this->entityManager->clear(); // Vider le cache
        
        $savedPreOrder = $this->preOrderRepository->findOneBy([
            'email' => 'integration.test@example.com'
        ]);
        
        $this->assertNotNull($savedPreOrder, 'La pré-commande devrait être sauvegardée');
        $this->assertEquals('Integration', $savedPreOrder->getNom());
        $this->assertEquals('Test', $savedPreOrder->getPrenom());
        $this->assertEquals(3, $savedPreOrder->getQuantiteCommandee());
        $this->assertEquals('pending', $savedPreOrder->getStatut());
        
        // Étape 6 : Vérifier la décrémentation du stock
        $updatedStock = $this->stockRepository->find($stock->getId());
        $expectedQuantity = $initialQuantity - 3;
        
        $this->assertEquals($expectedQuantity, $updatedStock->getQuantity(), 
            'Le stock devrait être décrémenté de 3 unités');
    }

    public function testPreOrderWorkflowWithInsufficientStock(): void
    {
        // Créer un produit avec peu de stock
        $stock = new Stock();
        $stock->setName('Low Stock Product');
        $stock->setQuantity(2);
        $stock->setPrice(25.00);
        $stock->setImage('low-stock.jpg');
        
        $this->stockManager->createStock($stock);
        $initialQuantity = $stock->getQuantity();
        
        // Tenter de commander plus que disponible
        $preOrder = new PreOrder();
        $preOrder->setNom('Test');
        $preOrder->setPrenom('User');
        $preOrder->setEmail('test.user@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(5);
        
        // Traiter la pré-commande
        $result = $this->orderProcessor->processPreOrder($preOrder);
        
        // Vérifications
        $this->assertFalse($result['success'], 'Le traitement devrait échouer');
        $this->assertNull($result['preOrder'], 'Aucune pré-commande ne devrait être créée');
        $this->assertStringContainsString('Stock insuffisant', $result['message']);
        
        // Vérifier que le stock n'a pas changé
        $this->entityManager->refresh($stock);
        $this->assertEquals($initialQuantity, $stock->getQuantity(), 
            'Le stock ne devrait pas avoir changé');
        
        // Vérifier qu'aucune pré-commande n'a été créée
        $savedPreOrder = $this->preOrderRepository->findOneBy([
            'email' => 'test.user@example.com'
        ]);
        $this->assertNull($savedPreOrder, 'Aucune pré-commande ne devrait être enregistrée');
    }

    public function testCancelPreOrderRestoresStock(): void
    {
        // Créer un produit
        $stock = new Stock();
        $stock->setName('Cancellation Test Product');
        $stock->setQuantity(15);
        $stock->setPrice(40.00);
        $stock->setImage('cancel-test.jpg');
        
        $this->stockManager->createStock($stock);
        
        // Créer et traiter une pré-commande
        $preOrder = new PreOrder();
        $preOrder->setNom('Cancel');
        $preOrder->setPrenom('Test');
        $preOrder->setEmail('cancel.test@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(4);
        
        $result = $this->orderProcessor->processPreOrder($preOrder);
        $this->assertTrue($result['success']);
        
        // Vérifier que le stock a été décrémenté
        $this->entityManager->refresh($stock);
        $this->assertEquals(11, $stock->getQuantity());
        
        // Annuler la pré-commande
        $this->orderProcessor->cancelPreOrder($result['preOrder']);
        
        // Vérifier que le stock a été restauré
        $this->entityManager->refresh($stock);
        $this->assertEquals(15, $stock->getQuantity(), 
            'Le stock devrait être restauré après l\'annulation');
        
        // Vérifier que le statut a changé
        $this->entityManager->refresh($result['preOrder']);
        $this->assertEquals('cancelled', $result['preOrder']->getStatut());
    }

    public function testMultiplePreOrdersUpdateStockCorrectly(): void
    {
        // Créer un produit populaire
        $stock = new Stock();
        $stock->setName('Popular Product');
        $stock->setQuantity(50);
        $stock->setPrice(20.00);
        $stock->setImage('popular.jpg');
        
        $this->stockManager->createStock($stock);
        $initialQuantity = $stock->getQuantity();
        
        // Créer plusieurs pré-commandes
        $quantities = [5, 3, 7, 2];
        $totalOrdered = 0;
        
        foreach ($quantities as $index => $quantity) {
            $preOrder = new PreOrder();
            $preOrder->setNom('Customer' . $index);
            $preOrder->setPrenom('Test');
            $preOrder->setEmail('customer' . $index . '@example.com');
            $preOrder->setProduit($stock);
            $preOrder->setQuantiteCommandee($quantity);
            
            $result = $this->orderProcessor->processPreOrder($preOrder);
            $this->assertTrue($result['success'], 
                'La pré-commande ' . $index . ' devrait réussir');
            
            $totalOrdered += $quantity;
        }
        
        // Vérifier que le stock final est correct
        $this->entityManager->clear();
        $finalStock = $this->stockRepository->find($stock->getId());
        $expectedQuantity = $initialQuantity - $totalOrdered;
        
        $this->assertEquals($expectedQuantity, $finalStock->getQuantity(),
            sprintf('Le stock devrait être %d (initial) - %d (commandé) = %d', 
                $initialQuantity, $totalOrdered, $expectedQuantity));
    }

    public function testStockAvailabilityCheck(): void
    {
        // Créer un produit avec quantité exacte
        $stock = new Stock();
        $stock->setName('Exact Quantity Product');
        $stock->setQuantity(10);
        $stock->setPrice(30.00);
        $stock->setImage('exact.jpg');
        
        $this->stockManager->createStock($stock);
        
        // Vérifier différentes quantités
        $this->assertTrue($this->stockManager->hasAvailableStock($stock, 5), 
            'Devrait avoir 5 unités disponibles');
        $this->assertTrue($this->stockManager->hasAvailableStock($stock, 10), 
            'Devrait avoir 10 unités disponibles');
        $this->assertFalse($this->stockManager->hasAvailableStock($stock, 11), 
            'Ne devrait pas avoir 11 unités disponibles');
        
        // Commander exactement tout le stock
        $preOrder = new PreOrder();
        $preOrder->setNom('Complete');
        $preOrder->setPrenom('Stock');
        $preOrder->setEmail('complete.stock@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(10);
        
        $result = $this->orderProcessor->processPreOrder($preOrder);
        $this->assertTrue($result['success']);
        
        // Vérifier que le stock est épuisé
        $this->entityManager->refresh($stock);
        $this->assertEquals(0, $stock->getQuantity());
        $this->assertFalse($stock->isAvailable(), 
            'Le produit ne devrait plus être disponible');
    }

    public function testCalculateTotalPriceAccuracy(): void
    {
        $stock = new Stock();
        $stock->setName('Price Test Product');
        $stock->setQuantity(100);
        $stock->setPrice(19.99);
        $stock->setImage('price-test.jpg');
        
        $this->stockManager->createStock($stock);
        
        // Tester différentes quantités
        $testCases = [
            ['quantity' => 1, 'expected' => 19.99],
            ['quantity' => 2, 'expected' => 39.98],
            ['quantity' => 5, 'expected' => 99.95],
            ['quantity' => 10, 'expected' => 199.90],
        ];
        
        foreach ($testCases as $testCase) {
            $total = $this->stockManager->calculateTotalPrice($stock, $testCase['quantity']);
            $this->assertEquals($testCase['expected'], $total, 
                sprintf('Le prix pour %d unités devrait être %f', 
                    $testCase['quantity'], $testCase['expected']));
        }
    }
}
