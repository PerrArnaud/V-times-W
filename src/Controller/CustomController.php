<?php

namespace App\Controller;

use App\Form\CustomType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class CustomController extends AbstractController
{
    #[Route('/custom', name: 'app_custom', methods: ['GET', 'POST'])]
    public function index(Request $request): Response
    {
        $form = $this->createForm(CustomType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            
            $this->addFlash('success', sprintf(
                'Personnalisation enregistrée : Cadran %s, Aiguilles %s, Chiffres %s',
                $data['cadran'],
                $data['aiguille'],
                $data['chiffres']
            ));
            
            // Ici vous pouvez traiter les données (sauvegarde, email, etc.)
            
            return $this->redirectToRoute('app_custom');
        }

        return $this->render('custom/index.html.twig', [
            'form' => $form,
        ]);
    }
}
