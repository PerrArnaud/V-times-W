<?php

namespace App\Tests\Unit\Service;

use App\Entity\PreOrder;
use App\Entity\Stock;
use App\Service\EmailNotifier;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\MailerInterface;

class EmailNotifierTest extends TestCase
{
    private MailerInterface $mailer;
    private LoggerInterface $logger;
    private EmailNotifier $emailNotifier;
    private string $projectDir;

    protected function setUp(): void
    {
        $this->mailer = $this->createMock(MailerInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->projectDir = sys_get_temp_dir() . '/test_email_project';
        
        if (!is_dir($this->projectDir . '/public/images')) {
            mkdir($this->projectDir . '/public/images', 0777, true);
        }

        $this->emailNotifier = new EmailNotifier(
            $this->mailer,
            $this->logger,
            $this->projectDir,
            'admin@v-times.com'
        );
    }

    protected function tearDown(): void
    {
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

    public function testSendPreOrderConfirmationSuccess(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');
        $stock->setPrice(20.0);

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);
        $preOrder->setQuantiteCommandee(2);

        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(TemplatedEmail::class));

        $this->logger->expects($this->once())
            ->method('info')
            ->with(
                'Email de confirmation envoyé',
                $this->callback(function ($context) {
                    return $context['email'] === 'john@example.com';
                })
            );

        $result = $this->emailNotifier->sendPreOrderConfirmation($preOrder, 40.0);

        $this->assertTrue($result);
    }

    public function testSendPreOrderConfirmationFailure(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);

        $this->mailer->expects($this->once())
            ->method('send')
            ->willThrowException(new TransportException('SMTP error'));

        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Erreur lors de l\'envoi de l\'email de confirmation',
                $this->callback(function ($context) {
                    return isset($context['error']) && $context['error'] === 'SMTP error';
                })
            );

        $result = $this->emailNotifier->sendPreOrderConfirmation($preOrder, 40.0);

        $this->assertFalse($result);
    }

    public function testSendAdminNotificationSuccess(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);

        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(TemplatedEmail::class));

        $this->logger->expects($this->once())
            ->method('info')
            ->with('Notification admin envoyée', $this->anything());

        $result = $this->emailNotifier->sendAdminNotification($preOrder, 40.0);

        $this->assertTrue($result);
    }

    public function testSendAdminNotificationFailure(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);

        $this->mailer->expects($this->once())
            ->method('send')
            ->willThrowException(new TransportException('Connection refused'));

        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Erreur lors de l\'envoi de la notification admin',
                $this->anything()
            );

        $result = $this->emailNotifier->sendAdminNotification($preOrder, 40.0);

        $this->assertFalse($result);
    }

    public function testSendCancellationNotificationSuccess(): void
    {
        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);

        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(TemplatedEmail::class));

        $this->logger->expects($this->once())
            ->method('info')
            ->with('Email d\'annulation envoyé', $this->anything());

        $result = $this->emailNotifier->sendCancellationNotification($preOrder);

        $this->assertTrue($result);
    }

    public function testSendContactEmailSuccess(): void
    {
        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(TemplatedEmail::class));

        $this->logger->expects($this->once())
            ->method('info')
            ->with(
                'Email de contact envoyé',
                $this->callback(function ($context) {
                    return $context['from'] === 'sender@example.com';
                })
            );

        $result = $this->emailNotifier->sendContactEmail(
            'sender@example.com',
            'Test Subject',
            'Test message content'
        );

        $this->assertTrue($result);
    }

    public function testSendContactEmailFailure(): void
    {
        $this->mailer->expects($this->once())
            ->method('send')
            ->willThrowException(new TransportException('Send failed'));

        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Erreur lors de l\'envoi de l\'email de contact',
                $this->anything()
            );

        $result = $this->emailNotifier->sendContactEmail(
            'sender@example.com',
            'Test Subject',
            'Test message'
        );

        $this->assertFalse($result);
    }

    public function testSendLowStockAlertSuccess(): void
    {
        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(TemplatedEmail::class));

        $this->logger->expects($this->once())
            ->method('warning')
            ->with(
                'Alerte stock faible envoyée',
                $this->callback(function ($context) {
                    return $context['product'] === 'Test Product' && $context['quantity'] === 2;
                })
            );

        $result = $this->emailNotifier->sendLowStockAlert('Test Product', 2);

        $this->assertTrue($result);
    }

    public function testSendLowStockAlertFailure(): void
    {
        $this->mailer->expects($this->once())
            ->method('send')
            ->willThrowException(new TransportException('Alert failed'));

        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Erreur lors de l\'envoi de l\'alerte stock',
                $this->anything()
            );

        $result = $this->emailNotifier->sendLowStockAlert('Test Product', 2);

        $this->assertFalse($result);
    }

    public function testSetAndGetAdminEmail(): void
    {
        $newEmail = 'newadmin@v-times.com';
        
        $this->emailNotifier->setAdminEmail($newEmail);
        
        $this->assertEquals($newEmail, $this->emailNotifier->getAdminEmail());
    }

    public function testDefaultAdminEmail(): void
    {
        $this->assertEquals('admin@v-times.com', $this->emailNotifier->getAdminEmail());
    }

    public function testEmbedLogoWhenFileExists(): void
    {
        // Créer un fichier logo temporaire
        $logoPath = $this->projectDir . '/public/images/logo.png';
        file_put_contents($logoPath, 'fake logo content');

        $stock = new Stock();
        $stock->setName('Test Product');

        $preOrder = new PreOrder();
        $preOrder->setNom('Doe');
        $preOrder->setPrenom('John');
        $preOrder->setEmail('john@example.com');
        $preOrder->setProduit($stock);

        // Le logo devrait être embarqué dans l'email
        $this->mailer->expects($this->once())
            ->method('send')
            ->with($this->isInstanceOf(TemplatedEmail::class));

        $this->logger->expects($this->once())
            ->method('info');

        $result = $this->emailNotifier->sendPreOrderConfirmation($preOrder, 40.0);

        $this->assertTrue($result);
    }
}
