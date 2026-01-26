<?php

namespace App\Controller;

use App\Entity\PreOrder;
use App\Form\CustomType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Attribute\Route;

final class CustomController extends AbstractController
{
    #[Route('/custom', name: 'app_custom', methods: ['GET', 'POST'])]
    public function index(
        Request $request,
        EntityManagerInterface $entityManager,
        MailerInterface $mailer
    ): Response {
        $form = $this->createForm(CustomType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            
            // Créer une PreOrder pour la commande personnalisée
            $preOrder = new PreOrder();
            $preOrder->setNom($data['nom']);
            $preOrder->setPrenom($data['prenom']);
            $preOrder->setEmail($data['email']);
            
            // Format du message avec les options de personnalisation
            $customMessage = sprintf(
                "Commande personnalisée :\n- Cadran : %s\n- Aiguilles : %s\n- Chiffres : %s",
                $data['cadran'],
                $data['aiguille'],
                $data['chiffres']
            );
            
            if (!empty($data['message'])) {
                $customMessage .= "\n\nMessage client :\n" . $data['message'];
            }
            
            $preOrder->setMessage($customMessage);
            $preOrder->setQuantiteCommandee(1);
            // Produit null pour les commandes personnalisées
            $preOrder->setProduit(null);
            
            $entityManager->persist($preOrder);
            $entityManager->flush();
            
            // Envoyer l'email au client
            $emailClient = (new TemplatedEmail())
                ->from(new Address('noreply@v-times.com', 'V-Times'))
                ->to($preOrder->getEmail())
                ->subject('Confirmation de votre commande personnalisée V-Times')
                ->htmlTemplate('emails/custom_order_confirmation.html.twig')
                ->context([
                    'preOrder' => $preOrder,
                    'cadran' => $data['cadran'],
                    'aiguille' => $data['aiguille'],
                    'chiffres' => $data['chiffres'],
                ]);

            $logoPath = $this->getParameter('kernel.project_dir') . '/public/images/logo.png';
            if (file_exists($logoPath)) {
                $emailClient->embedFromPath($logoPath, 'logo');
            }

            $mailer->send($emailClient);

            // Envoyer l'email à l'admin
            $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@v-times.com';
            $emailAdmin = (new TemplatedEmail())
                ->from(new Address('noreply@v-times.com', 'V-Times'))
                ->to($adminEmail)
                ->subject('Nouvelle commande personnalisée reçue')
                ->htmlTemplate('emails/custom_admin_notification.html.twig')
                ->context([
                    'preOrder' => $preOrder,
                    'cadran' => $data['cadran'],
                    'aiguille' => $data['aiguille'],
                    'chiffres' => $data['chiffres'],
                ]);

            if (file_exists($logoPath)) {
                $emailAdmin->embedFromPath($logoPath, 'logo');
            }

            $mailer->send($emailAdmin);
            
            $this->addFlash('success', 'Votre commande personnalisée a été enregistrée ! Nous vous contacterons sous 48h.');
            
            return $this->redirectToRoute('app_home');
        }

        return $this->render('custom/index.html.twig', [
            'form' => $form,
        ]);
    }
}
