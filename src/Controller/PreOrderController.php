<?php

namespace App\Controller;

use App\Entity\PreOrder;
use App\Form\PreOrderType;
use App\Repository\StockRepository;
use App\Service\OrderProcessor;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/pre-commande')]
class PreOrderController extends AbstractController
{
    public function __construct(
        private OrderProcessor $orderProcessor
    ) {
    }

    #[Route('/', name: 'app_preorder', methods: ['GET', 'POST'])]
    public function form(
        Request $request,
        StockRepository $stockRepository
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
            // Traiter la pré-commande via le service
            $result = $this->orderProcessor->processPreOrder($preOrder);

            if ($result['success']) {
                $this->addFlash('success', $result['message']);
                return $this->redirectToRoute('app_preorder_confirmation', [
                    'id' => $result['preOrder']->getId()
                ]);
            } else {
                $this->addFlash('danger', $result['message']);
                return $this->render('pre_order/form.html.twig', [
                    'form' => $form,
                ]);
            }
        }

        return $this->render('pre_order/form.html.twig', [
            'form' => $form,
        ]);
    }

    #[Route('/confirmation/{id}', name: 'app_preorder_confirmation', methods: ['GET'])]
    public function confirmation(PreOrder $preOrder): Response
    {
        $prixTotal = $this->orderProcessor->calculatePreOrderTotal($preOrder);

        return $this->render('pre_order/confirmation.html.twig', [
            'preOrder' => $preOrder,
            'prixTotal' => $prixTotal,
        ]);
    }
}

