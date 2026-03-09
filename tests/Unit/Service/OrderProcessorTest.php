<?php

namespace App\Tests\Unit\Service;

use App\Entity\PreOrder;
use App\Entity\Stock;
use App\Repository\PreOrderRepository;
use App\Service\EmailNotifier;
use App\Service\OrderProcessor;
use App\Service\StockManager;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class OrderProcessorTest extends TestCase
{
    private EntityManagerInterface $entityManager;
    private StockManager $stockManager;
    private EmailNotifier $emailNotifier;
    private OrderProcessor $orderProcessor;
    private PreOrderRepository $preOrderRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->stockManager = $this->createMock(StockManager::class);
        $this->emailNotifier = $this->createMock(EmailNotifier::class);
        $this->preOrderRepository = $this->createMock(PreOrderRepository::class);

        $this->orderProcessor = new OrderProcessor(
            $this->entityManager,
            $this->stockManager,
            $this->emailNotifier
        );
    }

    public function testProcessPreOrderSuccessfully(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(20.0);
        $stock->setQuantity(10);
        $stock->setImage('test.jpg');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(2);

        // Mock des méthodes
        $this->stockManager->expects($this->once())
            ->method('hasAvailableStock')
            ->with($stock, 2)
            ->willReturn(true);

        $this->entityManager->expects($this->once())
            ->method('beginTransaction');

        $this->stockManager->expects($this->once())
            ->method('decrementStock')
            ->with($stock, 2);

        $this->stockManager->expects($this->once())
            ->method('calculateTotalPrice')
            ->with($stock, 2)
            ->willReturn(40.0);

        $this->entityManager->expects($this->once())
            ->method('persist')
            ->with($preOrder);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->emailNotifier->expects($this->once())
            ->method('sendPreOrderConfirmation')
            ->with($preOrder, 40.0)
            ->willReturn(true);

        $this->emailNotifier->expects($this->once())
            ->method('sendAdminNotification')
            ->with($preOrder, 40.0)
            ->willReturn(true);

        $this->entityManager->expects($this->once())
            ->method('commit');

        $result = $this->orderProcessor->processPreOrder($preOrder);

        $this->assertTrue($result['success']);
        $this->assertSame($preOrder, $result['preOrder']);
        $this->assertEquals(40.0, $result['totalPrice']);
        $this->assertStringContainsString('succès', $result['message']);
    }

    public function testProcessPreOrderFailsWhenProductNotAvailable(): void
    {
        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit(null);
        $preOrder->setQuantiteCommandee(2);

        $result = $this->orderProcessor->processPreOrder($preOrder);

        $this->assertFalse($result['success']);
        $this->assertNull($result['preOrder']);
        $this->assertEquals(0, $result['totalPrice']);
        $this->assertStringContainsString('pas disponible', $result['message']);
    }

    public function testProcessPreOrderFailsWhenInsufficientStock(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(20.0);
        $stock->setQuantity(1);
        $stock->setImage('test.jpg');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(5);

        $this->stockManager->expects($this->once())
            ->method('hasAvailableStock')
            ->with($stock, 5)
            ->willReturn(false);

        $result = $this->orderProcessor->processPreOrder($preOrder);

        $this->assertFalse($result['success']);
        $this->assertNull($result['preOrder']);
        $this->assertEquals(0, $result['totalPrice']);
        $this->assertStringContainsString('Stock insuffisant', $result['message']);
    }

    public function testProcessPreOrderRollbacksOnException(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(20.0);
        $stock->setQuantity(10);
        $stock->setImage('test.jpg');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(2);

        $this->stockManager->expects($this->once())
            ->method('hasAvailableStock')
            ->willReturn(true);

        $this->entityManager->expects($this->once())
            ->method('beginTransaction');

        $this->stockManager->expects($this->once())
            ->method('decrementStock')
            ->willThrowException(new \Exception('Database error'));

        $this->entityManager->expects($this->once())
            ->method('rollback');

        $result = $this->orderProcessor->processPreOrder($preOrder);

        $this->assertFalse($result['success']);
        $this->assertNull($result['preOrder']);
        $this->assertStringContainsString('erreur', $result['message']);
    }

    public function testCancelPreOrder(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(20.0);
        $stock->setQuantity(8);
        $stock->setImage('test.jpg');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(2);
        $preOrder->setStatut('pending');

        $this->stockManager->expects($this->once())
            ->method('incrementStock')
            ->with($stock, 2);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $this->emailNotifier->expects($this->once())
            ->method('sendCancellationNotification')
            ->with($preOrder)
            ->willReturn(true);

        $this->orderProcessor->cancelPreOrder($preOrder);

        $this->assertEquals('cancelled', $preOrder->getStatut());
    }

    public function testValidatePreOrderReturnsNoErrorsForValidOrder(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(20.0);
        $stock->setQuantity(10);
        $stock->setImage('test.jpg');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(2);

        $errors = $this->orderProcessor->validatePreOrder($preOrder);

        $this->assertEmpty($errors);
    }

    public function testValidatePreOrderReturnsErrorWhenNoProduct(): void
    {
        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit(null);
        $preOrder->setQuantiteCommandee(2);

        $errors = $this->orderProcessor->validatePreOrder($preOrder);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('Aucun produit', $errors[0]);
    }

    public function testValidatePreOrderReturnsErrorWhenQuantityTooLow(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(0);

        $errors = $this->orderProcessor->validatePreOrder($preOrder);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('au moins de 1', $errors[0]);
    }

    public function testValidatePreOrderReturnsErrorWhenQuantityTooHigh(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(15);

        $errors = $this->orderProcessor->validatePreOrder($preOrder);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('dépasser 10', $errors[0]);
    }

    public function testValidatePreOrderReturnsErrorWhenInvalidEmail(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('invalid-email');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(2);

        $errors = $this->orderProcessor->validatePreOrder($preOrder);

        $this->assertNotEmpty($errors);
        $this->assertStringContainsString('email', strtolower($errors[0]));
    }

    public function testCalculatePreOrderTotal(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(25.50);

        $preOrder = new PreOrder();
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(3);

        $this->stockManager->expects($this->once())
            ->method('calculateTotalPrice')
            ->with($stock, 3)
            ->willReturn(76.50);

        $result = $this->orderProcessor->calculatePreOrderTotal($preOrder);

        $this->assertEquals(76.50, $result);
    }

    public function testCalculatePreOrderTotalReturnsZeroWhenNoProduct(): void
    {
        $preOrder = new PreOrder();
        $preOrder->setProduit(null);
        $preOrder->setQuantiteCommandee(3);

        $result = $this->orderProcessor->calculatePreOrderTotal($preOrder);

        $this->assertEquals(0.0, $result);
    }

    public function testGetPreOrderStatistics(): void
    {
        $this->entityManager->expects($this->once())
            ->method('getRepository')
            ->with(PreOrder::class)
            ->willReturn($this->preOrderRepository);

        $this->preOrderRepository->expects($this->exactly(4))
            ->method('count')
            ->willReturnMap([
                [[], 100],
                [['statut' => 'pending'], 30],
                [['statut' => 'completed'], 60],
                [['statut' => 'cancelled'], 10],
            ]);

        $stats = $this->orderProcessor->getPreOrderStatistics();

        $this->assertEquals(100, $stats['total']);
        $this->assertEquals(30, $stats['pending']);
        $this->assertEquals(60, $stats['completed']);
        $this->assertEquals(10, $stats['cancelled']);
    }
}
