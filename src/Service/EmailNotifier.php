<?php

namespace App\Service;

use App\Entity\PreOrder;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Service de gestion des notifications par email.
 */
class EmailNotifier
{
    private const FROM_EMAIL = 'noreply@v-times.com';
    private const FROM_NAME = 'V-Times';

    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        private string $projectDir,
        private string $adminEmail = 'admin@v-times.com'
    ) {
    }

    /**
     * Envoie un email de confirmation de pré-commande au client.
     */
    public function sendPreOrderConfirmation(PreOrder $preOrder, float $totalPrice): bool
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address(self::FROM_EMAIL, self::FROM_NAME))
                ->to($preOrder->getEmail())
                ->subject('Confirmation de votre pré-commande V-Times')
                ->htmlTemplate('emails/pre_order_confirmation.html.twig')
                ->context([
                    'preOrder' => $preOrder,
                    'prixTotal' => $totalPrice,
                ]);

            $this->embedLogoIfExists($email);
            $this->mailer->send($email);

            $this->logger->info('Email de confirmation envoyé', [
                'email' => $preOrder->getEmail(),
                'preOrderId' => $preOrder->getId()
            ]);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Erreur lors de l\'envoi de l\'email de confirmation', [
                'error' => $e->getMessage(),
                'preOrderId' => $preOrder->getId()
            ]);
            return false;
        }
    }

    /**
     * Envoie une notification à l'administrateur pour une nouvelle pré-commande.
     */
    public function sendAdminNotification(PreOrder $preOrder, float $totalPrice): bool
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address(self::FROM_EMAIL, self::FROM_NAME))
                ->to($this->adminEmail)
                ->subject('Nouvelle pré-commande reçue')
                ->htmlTemplate('emails/admin_notification.html.twig')
                ->context([
                    'preOrder' => $preOrder,
                    'prixTotal' => $totalPrice,
                ]);

            $this->embedLogoIfExists($email);
            $this->mailer->send($email);

            $this->logger->info('Notification admin envoyée', [
                'preOrderId' => $preOrder->getId()
            ]);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Erreur lors de l\'envoi de la notification admin', [
                'error' => $e->getMessage(),
                'preOrderId' => $preOrder->getId()
            ]);
            return false;
        }
    }

    /**
     * Envoie une notification d'annulation de commande.
     */
    public function sendCancellationNotification(PreOrder $preOrder): bool
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address(self::FROM_EMAIL, self::FROM_NAME))
                ->to($preOrder->getEmail())
                ->subject('Annulation de votre pré-commande V-Times')
                ->htmlTemplate('emails/cancellation_notification.html.twig')
                ->context([
                    'preOrder' => $preOrder,
                ]);

            $this->embedLogoIfExists($email);
            $this->mailer->send($email);

            $this->logger->info('Email d\'annulation envoyé', [
                'email' => $preOrder->getEmail(),
                'preOrderId' => $preOrder->getId()
            ]);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Erreur lors de l\'envoi de l\'email d\'annulation', [
                'error' => $e->getMessage(),
                'preOrderId' => $preOrder->getId()
            ]);
            return false;
        }
    }

    /**
     * Envoie un email de contact.
     */
    public function sendContactEmail(string $senderEmail, string $subject, string $message): bool
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address(self::FROM_EMAIL, self::FROM_NAME))
                ->replyTo($senderEmail)
                ->to($this->adminEmail)
                ->subject('Contact: ' . $subject)
                ->htmlTemplate('emails/contact.html.twig')
                ->context([
                    'senderEmail' => $senderEmail,
                    'messageContent' => $message,
                ]);

            $this->embedLogoIfExists($email);
            $this->mailer->send($email);

            $this->logger->info('Email de contact envoyé', [
                'from' => $senderEmail
            ]);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Erreur lors de l\'envoi de l\'email de contact', [
                'error' => $e->getMessage(),
                'from' => $senderEmail
            ]);
            return false;
        }
    }

    /**
     * Envoie un email de notification de stock faible.
     */
    public function sendLowStockAlert(string $productName, int $quantity): bool
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address(self::FROM_EMAIL, self::FROM_NAME))
                ->to($this->adminEmail)
                ->subject('Alerte: Stock faible - ' . $productName)
                ->htmlTemplate('emails/low_stock_alert.html.twig')
                ->context([
                    'productName' => $productName,
                    'quantity' => $quantity,
                ]);

            $this->embedLogoIfExists($email);
            $this->mailer->send($email);

            $this->logger->warning('Alerte stock faible envoyée', [
                'product' => $productName,
                'quantity' => $quantity
            ]);

            return true;
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Erreur lors de l\'envoi de l\'alerte stock', [
                'error' => $e->getMessage(),
                'product' => $productName
            ]);
            return false;
        }
    }

    /**
     * Embarque le logo dans l'email s'il existe.
     */
    private function embedLogoIfExists(TemplatedEmail $email): void
    {
        $logoPath = $this->projectDir . '/public/images/logo.png';
        
        if (file_exists($logoPath)) {
            $email->embedFromPath($logoPath, 'logo');
        }
    }

    /**
     * Configure l'email administrateur.
     */
    public function setAdminEmail(string $email): void
    {
        $this->adminEmail = $email;
    }

    /**
     * Récupère l'email administrateur.
     */
    public function getAdminEmail(): string
    {
        return $this->adminEmail;
    }
}
