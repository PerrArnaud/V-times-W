<?php

namespace App\Tests\Functional\Controller;

use App\Entity\Stock;
use App\Entity\User;
use App\Repository\StockRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class StockControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;
    private StockRepository $stockRepository;
    private ?User $adminUser = null;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get('doctrine')->getManager();
        $this->stockRepository = $this->entityManager->getRepository(Stock::class);
        
        // Créer un utilisateur admin pour les tests
        $this->createAdminUser();
    }

    protected function tearDown(): void
    {
        // Nettoyer la base de données après chaque test
        $stocks = $this->stockRepository->findAll();
        foreach ($stocks as $stock) {
            $this->entityManager->remove($stock);
        }
        
        if ($this->adminUser) {
            $this->entityManager->remove($this->adminUser);
        }
        
        $this->entityManager->flush();
        $this->entityManager->close();
        
        parent::tearDown();
    }

    private function createAdminUser(): void
    {
        $userRepository = $this->entityManager->getRepository(User::class);
        
        // Vérifier si l'utilisateur existe déjà
        $existingUser = $userRepository->findOneBy(['name' => 'test_admin']);
        if ($existingUser) {
            $this->adminUser = $existingUser;
            return;
        }

        $this->adminUser = new User();
        $this->adminUser->setName('test_admin');
        $this->adminUser->setPassword(
            static::getContainer()->get('security.password_hasher')->hashPassword(
                $this->adminUser,
                'admin123'
            )
        );
        $this->adminUser->setRoles(['ROLE_ADMIN']);
        
        $this->entityManager->persist($this->adminUser);
        $this->entityManager->flush();
    }

    private function loginAsAdmin(): void
    {
        $this->client->loginUser($this->adminUser);
    }

    public function testIndexPageRequiresAuthentication(): void
    {
        $this->client->request('GET', '/stock');
        
        $this->assertResponseRedirects();
    }

    public function testIndexPageDisplaysStocksForAdmin(): void
    {
        $this->loginAsAdmin();
        
        // Créer quelques produits de test
        $stock1 = new Stock();
        $stock1->setName('Product 1');
        $stock1->setQuantity(10);
        $stock1->setPrice(20.0);
        $stock1->setImage('test1.jpg');
        
        $stock2 = new Stock();
        $stock2->setName('Product 2');
        $stock2->setQuantity(5);
        $stock2->setPrice(30.0);
        $stock2->setImage('test2.jpg');
        
        $this->entityManager->persist($stock1);
        $this->entityManager->persist($stock2);
        $this->entityManager->flush();

        $this->client->request('GET', '/stock');
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Product 1');
        $this->assertSelectorTextContains('body', 'Product 2');
    }

    public function testNewPageDisplaysFormForAdmin(): void
    {
        $this->loginAsAdmin();
        
        $this->client->request('GET', '/stock/new');
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('form');
    }

    public function testCreateNewStockWithValidData(): void
    {
        $this->loginAsAdmin();
        
        $crawler = $this->client->request('GET', '/stock/new');
        
        $form = $crawler->selectButton('Enregistrer')->form([
            'stock[name]' => 'New Test Product',
            'stock[quantity]' => 15,
            'stock[price]' => 25.99,
        ]);
        
        $this->client->submit($form);
        
        $this->assertResponseRedirects('/stock');
        
        // Vérifier que le produit a été créé
        $stock = $this->stockRepository->findOneBy(['name' => 'New Test Product']);
        $this->assertNotNull($stock);
        $this->assertEquals(15, $stock->getQuantity());
        $this->assertEquals(25.99, $stock->getPrice());
    }

    public function testShowPageDisplaysStockDetails(): void
    {
        $this->loginAsAdmin();
        
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $this->client->request('GET', '/stock/' . $stock->getId());
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('body', 'Test Product');
        $this->assertSelectorTextContains('body', '10');
        $this->assertSelectorTextContains('body', '20');
    }

    public function testEditPageDisplaysFormWithExistingData(): void
    {
        $this->loginAsAdmin();
        
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();

        $crawler = $this->client->request('GET', '/stock/' . $stock->getId() . '/edit');
        
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('form');
        
        // Vérifier que les valeurs sont pré-remplies
        $form = $crawler->selectButton('Enregistrer')->form();
        $this->assertEquals('Test Product', $form['stock[name]']->getValue());
        $this->assertEquals(10, $form['stock[quantity]']->getValue());
        $this->assertEquals(20.0, $form['stock[price]']->getValue());
    }

    public function testUpdateStockWithValidData(): void
    {
        $this->loginAsAdmin();
        
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();
        $stockId = $stock->getId();

        $crawler = $this->client->request('GET', '/stock/' . $stockId . '/edit');
        
        $form = $crawler->selectButton('Enregistrer')->form([
            'stock[name]' => 'Updated Product',
            'stock[quantity]' => 20,
            'stock[price]' => 30.0,
        ]);
        
        $this->client->submit($form);
        
        $this->assertResponseRedirects('/stock');
        
        // Vérifier que le produit a été mis à jour
        $this->entityManager->clear();
        $updatedStock = $this->stockRepository->find($stockId);
        $this->assertEquals('Updated Product', $updatedStock->getName());
        $this->assertEquals(20, $updatedStock->getQuantity());
        $this->assertEquals(30.0, $updatedStock->getPrice());
    }

    public function testDeleteStock(): void
    {
        $this->loginAsAdmin();
        
        $stock = new Stock();
        $stock->setName('Test Product to Delete');
        $stock->setQuantity(10);
        $stock->setPrice(20.0);
        $stock->setImage('test.jpg');
        
        $this->entityManager->persist($stock);
        $this->entityManager->flush();
        $stockId = $stock->getId();

        $crawler = $this->client->request('GET', '/stock');
        
        // Simuler la soumission du formulaire de suppression
        $this->client->request('POST', '/stock/' . $stockId, [
            '_token' => $this->getCSRFToken('delete' . $stockId),
        ]);
        
        $this->assertResponseRedirects('/stock');
        
        // Vérifier que le produit a été supprimé
        $this->entityManager->clear();
        $deletedStock = $this->stockRepository->find($stockId);
        $this->assertNull($deletedStock);
    }

    public function testCreateStockWithInvalidDataShowsErrors(): void
    {
        $this->loginAsAdmin();
        
        $crawler = $this->client->request('GET', '/stock/new');
        
        // Soumettre un formulaire avec des données invalides
        $form = $crawler->selectButton('Enregistrer')->form([
            'stock[name]' => '', // Nom vide
            'stock[quantity]' => -5, // Quantité négative
            'stock[price]' => -10, // Prix négatif
        ]);
        
        $this->client->submit($form);
        
        // Devrait rester sur la page avec des erreurs
        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('.invalid-feedback, .form-error');
    }

    private function getCSRFToken(string $tokenId): string
    {
        return static::getContainer()->get('security.csrf.token_manager')->getToken($tokenId)->getValue();
    }

    public function testNonAdminCannotAccessStockPages(): void
    {
        // Créer un utilisateur normal (non-admin)
        $normalUser = new User();
        $normalUser->setName('normal_user');
        $normalUser->setPassword(
            static::getContainer()->get('security.password_hasher')->hashPassword(
                $normalUser,
                'user123'
            )
        );
        $normalUser->setRoles(['ROLE_USER']);
        
        $this->entityManager->persist($normalUser);
        $this->entityManager->flush();

        $this->client->loginUser($normalUser);
        
        $this->client->request('GET', '/stock');
        
        // Devrait être refusé (403) ou redirigé
        $this->assertResponseStatusCodeSame(403);
        
        $this->entityManager->remove($normalUser);
        $this->entityManager->flush();
    }
}
