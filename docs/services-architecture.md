# Architecture des Services Backend

## Vue d'ensemble

Cette documentation décrit l'architecture des services métier implémentés pour séparer la logique métier des contrôleurs.

## Services Créés

### 1. StockManager (`App\Service\StockManager`)

Service responsable de la gestion complète du stock des produits.

#### Responsabilités
- Vérification de la disponibilité du stock
- Incrémentation/Décrémentation du stock
- Gestion de l'upload et suppression des images
- Opérations CRUD sur les entités Stock

#### Méthodes principales

```php
// Vérifier la disponibilité
hasAvailableStock(Stock $stock, int $quantity): bool

// Gestion du stock
decrementStock(Stock $stock, int $quantity): void
incrementStock(Stock $stock, int $quantity): void

// Gestion des images
handleImageUpload(?UploadedFile $imageFile): ?string
deleteImage(string $filename): bool
replaceImage(Stock $stock, ?UploadedFile $newImageFile): ?string

// CRUD
createStock(Stock $stock): void
updateStock(Stock $stock): void
deleteStock(Stock $stock): void

// Calculs
calculateTotalPrice(Stock $stock, int $quantity): float
```

#### Exemple d'utilisation

```php
class MyController extends AbstractController
{
    public function __construct(
        private StockManager $stockManager
    ) {}

    public function createProduct(Request $request): Response
    {
        $stock = new Stock();
        // ... configuration du produit
        
        $imageFile = $form->get('imageFile')->getData();
        $filename = $this->stockManager->handleImageUpload($imageFile);
        
        if ($filename) {
            $stock->setImage($filename);
        }
        
        $this->stockManager->createStock($stock);
    }
}
```

---

### 2. OrderProcessor (`App\Service\OrderProcessor`)

Service responsable du traitement des commandes et pré-commandes avec gestion transactionnelle.

#### Responsabilités
- Traitement complet des pré-commandes
- Validation des commandes
- Gestion des annulations avec restauration du stock
- Coordination entre StockManager et EmailNotifier
- Statistiques des commandes

#### Méthodes principales

```php
// Traitement principal (avec transaction)
processPreOrder(PreOrder $preOrder): array

// Annulation
cancelPreOrder(PreOrder $preOrder): void

// Validation
validatePreOrder(PreOrder $preOrder): array

// Calculs
calculatePreOrderTotal(PreOrder $preOrder): float

// Statistiques
getPreOrderStatistics(): array
```

#### Format de retour de processPreOrder()

```php
[
    'success' => bool,          // Succès ou échec
    'preOrder' => PreOrder|null, // L'entité créée si succès
    'totalPrice' => float,      // Prix total calculé
    'message' => string         // Message descriptif
]
```

#### Exemple d'utilisation

```php
class PreOrderController extends AbstractController
{
    public function __construct(
        private OrderProcessor $orderProcessor
    ) {}

    public function processOrder(PreOrder $preOrder): Response
    {
        $result = $this->orderProcessor->processPreOrder($preOrder);
        
        if ($result['success']) {
            $this->addFlash('success', $result['message']);
            return $this->redirectToRoute('confirmation', [
                'id' => $result['preOrder']->getId()
            ]);
        }
        
        $this->addFlash('danger', $result['message']);
        // Gérer l'erreur
    }
}
```

---

### 3. EmailNotifier (`App\Service\EmailNotifier`)

Service centralisé pour toutes les notifications par email avec logging automatique.

#### Responsabilités
- Envoi d'emails de confirmation aux clients
- Notifications administrateur
- Emails d'annulation
- Emails de contact
- Alertes de stock faible
- Gestion automatique du logo embarqué

#### Méthodes principales

```php
// Pré-commandes
sendPreOrderConfirmation(PreOrder $preOrder, float $totalPrice): bool
sendAdminNotification(PreOrder $preOrder, float $totalPrice): bool
sendCancellationNotification(PreOrder $preOrder): bool

// Autres notifications
sendContactEmail(string $senderEmail, string $subject, string $message): bool
sendLowStockAlert(string $productName, int $quantity): bool

// Configuration
setAdminEmail(string $email): void
getAdminEmail(): string
```

#### Templates associés

- `emails/pre_order_confirmation.html.twig` - Confirmation client
- `emails/admin_notification.html.twig` - Notification admin
- `emails/cancellation_notification.html.twig` - Annulation
- `emails/contact.html.twig` - Formulaire de contact
- `emails/low_stock_alert.html.twig` - Alerte stock

#### Exemple d'utilisation

```php
class ContactController extends AbstractController
{
    public function __construct(
        private EmailNotifier $emailNotifier
    ) {}

    public function sendContact(Request $request): Response
    {
        $email = $form->get('email')->getData();
        $message = $form->get('message')->getData();
        
        $success = $this->emailNotifier->sendContactEmail(
            $email,
            'Demande d\'information',
            $message
        );
        
        if ($success) {
            $this->addFlash('success', 'Message envoyé !');
        }
    }
}
```

---

## Configuration

### Services (config/services.yaml)

```yaml
services:
    App\Service\StockManager:
        arguments:
            $projectDir: '%kernel.project_dir%'

    App\Service\EmailNotifier:
        arguments:
            $projectDir: '%kernel.project_dir%'
            $adminEmail: '%env(default::ADMIN_EMAIL)%'
```

### Variables d'environnement (.env)

```bash
# Email de l'administrateur pour les notifications
ADMIN_EMAIL=admin@v-times.com
```

---

## Avantages de cette architecture

### 1. Séparation des responsabilités
- Contrôleurs légers (routing + rendu)
- Logique métier isolée et testable
- Services réutilisables

### 2. Testabilité
```php
class StockManagerTest extends TestCase
{
    public function testDecrementStock(): void
    {
        $stock = new Stock();
        $stock->setQuantity(10);
        
        $this->stockManager->decrementStock($stock, 3);
        
        $this->assertEquals(7, $stock->getQuantity());
    }
}
```

### 3. Maintenabilité
- Code DRY (Don't Repeat Yourself)
- Modifications centralisées
- Documentation claire

### 4. Gestion transactionnelle
```php
// OrderProcessor garantit la cohérence des données
$this->entityManager->beginTransaction();
try {
    $this->stockManager->decrementStock($stock, $quantity);
    $this->entityManager->persist($preOrder);
    $this->emailNotifier->sendConfirmation($preOrder);
    $this->entityManager->commit();
} catch (\Exception $e) {
    $this->entityManager->rollback();
    // Tout est annulé en cas d'erreur
}
```

### 5. Logging automatique
Tous les emails sont automatiquement loggés avec contexte :
```php
$this->logger->info('Email de confirmation envoyé', [
    'email' => $preOrder->getEmail(),
    'preOrderId' => $preOrder->getId()
]);
```

---

## Évolutions futures possibles

### 1. Event Dispatcher
```php
// Dans OrderProcessor
$event = new OrderPlacedEvent($preOrder);
$this->eventDispatcher->dispatch($event);

// Listener
class StockAlertListener
{
    public function onOrderPlaced(OrderPlacedEvent $event): void
    {
        if ($event->getStock()->getQuantity() < 5) {
            $this->emailNotifier->sendLowStockAlert(...);
        }
    }
}
```

### 2. Cache des statistiques
```php
#[Cache(expires: 3600)]
public function getPreOrderStatistics(): array
```

### 3. Queue pour les emails
```php
// Utiliser Symfony Messenger
$this->messageBus->dispatch(new SendEmailMessage($preOrder));
```

### 4. API REST avec ces services
```php
#[Route('/api/stock/{id}/decrement', methods: ['POST'])]
public function decrementStockApi(Stock $stock): JsonResponse
{
    try {
        $this->stockManager->decrementStock($stock, 1);
        return $this->json(['success' => true]);
    } catch (\Exception $e) {
        return $this->json(['error' => $e->getMessage()], 400);
    }
}
```

---

## Dépendances

### StockManager
- `Doctrine\ORM\EntityManagerInterface`
- `Symfony\Component\String\Slugger\SluggerInterface`

### OrderProcessor
- `Doctrine\ORM\EntityManagerInterface`
- `App\Service\StockManager`
- `App\Service\EmailNotifier`

### EmailNotifier
- `Symfony\Component\Mailer\MailerInterface`
- `Psr\Log\LoggerInterface`

Toutes les dépendances sont injectées automatiquement via l'autowiring de Symfony.

---

## Tests recommandés

```bash
# Tests unitaires des services
php bin/phpunit tests/Service/StockManagerTest.php
php bin/phpunit tests/Service/OrderProcessorTest.php
php bin/phpunit tests/Service/EmailNotifierTest.php

# Tests fonctionnels des contrôleurs
php bin/phpunit tests/Controller/StockControllerTest.php
php bin/phpunit tests/Controller/PreOrderControllerTest.php
```
