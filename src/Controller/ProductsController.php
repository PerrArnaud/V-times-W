<?php

namespace App\Controller;

use App\Repository\StockRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProductsController extends AbstractController
{
    #[Route('/produits', name: 'app_products')]
    public function index(StockRepository $stockRepository): Response
    {
        $stocks = $stockRepository->findBy([], ['name' => 'ASC']);

        return $this->render('products/index.html.twig', [
            'stocks' => $stocks,
        ]);
    }
}
