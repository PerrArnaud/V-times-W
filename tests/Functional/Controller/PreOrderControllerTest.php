<?php

namespace App\Tests\Functional\Controller;

use App\Entity\PreOrder;
use App\Entity\Stock;
use App\Repository\PreOrderRepository;
use App\Repository\StockRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PreOrderControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;
    private StockRepository $stockRepository;
    private PreOrderRepository $preOrderRepository;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine')->getManager();
        $this->stockRepository = $this->entityManager->getRepository(Stock::class);
        $this->preOrderRepository = $this->entityManager->getRepository(PreOrder::class);
    }

    protected function tearDown(): void
    {
        // Nettoyer les pré-commandes de test
        $preOrders = $this->preOrderRepository->findAll();
        foreach ($preOrders as $preOrder) {
            $this->entityManager->remove($preOrder);
        }
        
        // Nettoyer les produits de test
        $stocks = $this->stockRepository->findAll();
        foreach ($stocks as $stock) {
            $this->entityManager->remove($stock);
        }
        
        $this->entityManager->flush();
        $this->entityManager->close();
        
        parent::tearDown();
    }

    public function testFormPageIsAccessible(): void
    {
        $this->client->request('GET', '/pre-commande/');
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('form');
    }

    public function testFormDisplaysWithPreselectedProduct(): void
    {
        // Créer un produit disponible
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $this->client->request('GET', '/pre-commande/?produit=' . $stock->getId());
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('form');
    }

    public function testFormRedirectsWhenProductIsNotAvailable(): void
    {
        // Créer un produit non disponible
        $stock = new Stock();
        $stock->setName('Unavailable Product');
        $stock->setQuantity(0);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $this->client->request('GET', '/pre-commande/?produit=' . $stock->getId());
        
        $this->assertResponseRedirects('/products');
    }

    public function testSubmitValidPreOrder(): void
    {
        // Créer un produit disponible
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $crawler = $this->client->request('GET', '/pre-commande/');
        
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => 'Doe',
            'pre_order[prenom]' => 'John',
            'pre_order[email]' => 'john.doe@example.com',
            'pre_order[produit]' => $stock->getId(),
            'pre_order[quantiteCommandee]' => 2,
            'pre_order[message]' => 'Test message',
        ]);
        
        $this->client->submit($form);
        
        // Devrait rediriger vers la page de confirmation
        $this->assertResponseRedirects();
        $this->client->followRedirect();
        
        $this->assertRouteSame('app_preorder_confirmation');
        
        // Vérifier que la pré-commande a été créée
        $preOrder = $this->preOrderRepository->findOneBy(['email' => 'john.doe@example.com']);
        $this->assertNotNull($preOrder);
        $this->assertEquals('Doe', $preOrder->getNom());
        $this->assertEquals('John', $preOrder->getPrenom());
        $this->assertEquals(2, $preOrder->getQuantiteCommandee());
        
        // Vérifier que le stock a été décrémenté
        $this->entityManager->refresh($stock);
        $this->assertEquals(8, $stock->getQuantity());
    }

    public function testSubmitPreOrderWithInsufficientStock(): void
    {
        // Créer un produit avec stock limité
        $stock = new Stock();
        $stock->setName('Limited Stock Product');
        $stock->setQuantity(2);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $crawler = $this->client->request('GET', '/pre-commande/');
        
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => 'Doe',
            'pre_order[prenom]' => 'John',
            'pre_order[email]' => 'john.doe@example.com',
            'pre_order[produit]' => $stock->getId(),
            'pre_order[quantiteCommandee]' => 5, // Plus que le stock disponible
            'pre_order[message]' => 'Test message',
        ]);
        
        $this->client->submit($form);
        
        // Devrait rester sur la page avec un message d'erreur
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('.alert-danger, .flash-danger');
        $this->assertSelectorTextContains('body', 'Stock insuffisant');
    }

    public function testSubmitPreOrderWithInvalidEmail(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $crawler = $this->client->request('GET', '/pre-commande/');
        
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => 'Doe',
            'pre_order[prenom]' => 'John',
            'pre_order[email]' => 'invalid-email', // Email invalide
            'pre_order[produit]' => $stock->getId(),
            'pre_order[quantiteCommandee]' => 2,
        ]);
        
        $this->client->submit($form);
        
        // Devrait rester sur la page avec des erreurs de validation
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('.invalid-feedback, .form-error');
    }

    public function testSubmitPreOrderWithQuantityOutOfRange(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(50);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $crawler = $this->client->request('GET', '/pre-commande/');
        
        // Test avec quantité trop haute
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => 'Doe',
            'pre_order[prenom]' => 'John',
            'pre_order[email]' => 'john.doe@example.com',
            'pre_order[produit]' => $stock->getId(),
            'pre_order[quantiteCommandee]' => 15, // Plus que 10
        ]);
        
        $this->client->submit($form);
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('.invalid-feedback, .form-error');
    }

    public function testConfirmationPageDisplaysOrderDetails(): void
    {
        // Créer un produit et une pré-commande
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(25.0);
        $stock->setImage('test.jpg');
        
        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john.doe@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(3);
        $preOrder->setStatut('pending');
        
        $this->entityManager->persist($stock);
        $this->entityManager->persist($preOrder);
        $this->entityManager->flush();

        $this->client->request('GET', '/pre-commande/confirmation/' . $preOrder->getId());
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'John');
        $this->assertSelectorTextContains('body', 'Doe');
        $this->assertSelectorTextContains('body', 'Test Product');
        $this->assertSelectorTextContains('body', '3');
        
        // Vérifier que le prix total est affiché (25 * 3 = 75)
        $this->assertSelectorTextContains('body', '75');
    }

    public function testConfirmationPageReturns404ForInvalidId(): void
    {
        $this->client->request('GET', '/pre-commande/confirmation/99999');
        
        $this->assertResponseStatusCodeSame(404);
    }

    public function testSubmitPreOrderWithEmptyRequiredFields(): void
    {
        $crawler = $this->client->request('GET', '/pre-commande/');
        
        // Soumettre le formulaire vide
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => '',
            'pre_order[prenom]' => '',
            'pre_order[email]' => '',
        ]);
        
        $this->client->submit($form);
        
        // Devrait rester sur la page avec des erreurs de validation
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('.invalid-feedback, .form-error');
    }

    public function testMultiplePreOrdersDecrementStockCorrectly(): void
    {
        // Créer un produit avec un stock initial
        $stock = new Stock();
        $stock->setName('Popular Product');
        $stock->setQuantity(20);
        $stock->setPrice(30.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();
        $stockId = $stock->getId();
        $initialQuantity = $stock->getQuantity();

        // Première commande de 3 unités
        $crawler = $this->client->request('GET', '/pre-commande/');
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => 'Customer1',
            'pre_order[prenom]' => 'First',
            'pre_order[email]' => 'customer1@example.com',
            'pre_order[produit]' => $stockId,
            'pre_order[quantiteCommandee]' => 3,
        ]);
        $this->client->submit($form);
        
        // Deuxième commande de 5 unités
        $crawler = $this->client->request('GET', '/pre-commande/');
        $form = $crawler->selectButton('Envoyer')->form([
            'pre_order[nom]' => 'Customer2',
            'pre_order[prenom]' => 'Second',
            'pre_order[email]' => 'customer2@example.com',
            'pre_order[produit]' => $stockId,
            'pre_order[quantiteCommandee]' => 5,
        ]);
        $this->client->submit($form);
        
        // Vérifier que le stock a été décrémenté correctement
        $this->entityManager->clear();
        $updatedStock = $this->stockRepository->find($stockId);
        $this->assertEquals($initialQuantity - 3 - 5, $updatedStock->getQuantity());
        $this->assertEquals(12, $updatedStock->getQuantity());
    }
}
