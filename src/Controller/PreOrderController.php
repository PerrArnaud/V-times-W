<?php

namespace App\Controller;

use App\Entity\PreOrder;
use App\Form\PreOrderType;
use App\Repository\StockRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/pre-commande')]
class PreOrderController extends AbstractController
{
    #[Route('/', name: 'app_preorder', methods: ['GET', 'POST'])]
    public function form(
        Request $request,
        EntityManagerInterface $entityManager,
        StockRepository $stockRepository,
        MailerInterface $mailer
    ): Response {
        $preOrder = new PreOrder();

        // Pré-sélectionner un produit si spécifié dans l'URL
        $produitId = $request->query->get('produit');
        if ($produitId) {
            $stock = $stockRepository->find($produitId);
            if ($stock === null || !$stock->isAvailable()) {
                $this->addFlash('warning', 'Le produit sélectionné n\'est pas disponible.');
                return $this->redirectToRoute('app_products');
            }
            $preOrder->setProduit($stock);
        }

        $form = $this->createForm(PreOrderType::class, $preOrder);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
                $stock = $preOrder->getProduit();
                $quantite = $preOrder->getQuantiteCommandee();

                // Vérifier le stock disponible
                if ($stock->getQuantity() < $quantite) {
                    $this->addFlash('danger', 'Stock insuffisant. Il ne reste que ' . $stock->getQuantity() . ' unité(s) disponible(s).');
                    return $this->render('pre_order/form.html.twig', [
                        'form' => $form,
                    ]);
                }

                // Décrémenter le stock
                $stock->setQuantity($stock->getQuantity() - $quantite);

                // Calculer le prix total
                $prixTotal = $stock->getPrice() * $quantite;

                // Persister les entités
                $entityManager->persist($preOrder);
                $entityManager->persist($stock);
                $entityManager->flush();

                // Envoyer l'email au client
                $emailClient = (new TemplatedEmail())
                    ->from(new Address('noreply@v-times.com', 'V-Times'))
                    ->to($preOrder->getEmail())
                    ->subject('Confirmation de votre pré-commande V-Times')
                    ->htmlTemplate('emails/pre_order_confirmation.html.twig')
                    ->context([
                        'preOrder' => $preOrder,
                        'prixTotal' => $prixTotal,
                    ]);

                // Embed logo if exists
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
                    ->subject('Nouvelle pré-commande reçue')
                    ->htmlTemplate('emails/admin_notification.html.twig')
                    ->context([
                        'preOrder' => $preOrder,
                        'prixTotal' => $prixTotal,
                    ]);

                if (file_exists($logoPath)) {
                    $emailAdmin->embedFromPath($logoPath, 'logo');
                }

                $mailer->send($emailAdmin);

                // Rediriger vers la page de confirmation
                return $this->redirectToRoute('app_preorder_confirmation', [
                    'id' => $preOrder->getId()
                ]);
            }
        

        return $this->render('pre_order/form.html.twig', [
            'form' => $form,
        ]);
    }

    #[Route('/confirmation/{id}', name: 'app_preorder_confirmation', methods: ['GET'])]
    public function confirmation(PreOrder $preOrder): Response
    {
        $prixTotal = $preOrder->getProduit()->getPrice() * $preOrder->getQuantiteCommandee();

        return $this->render('pre_order/confirmation.html.twig', [
            'preOrder' => $preOrder,
            'prixTotal' => $prixTotal,
        ]);
    }
}

