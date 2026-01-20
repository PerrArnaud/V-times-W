<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class CommitmentsController extends AbstractController
{
    #[Route('/engagements', name: 'app_commitments')]
    public function index(): Response
    {
        return $this->render('commitments/index.html.twig');
    }
}
