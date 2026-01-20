<?php

namespace App\Form;

use App\Entity\PreOrder;
use App\Entity\Stock;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Range;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotNull;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\Positive;
use Symfony\Component\Validator\Constraints\LessThanOrEqual;

class PreOrderType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('nom', TextType::class, [
                'label' => 'Nom',
                'attr' => [
                    'placeholder' => 'Votre nom',
                    'class' => 'form-control'
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'Le nom est requis'])
                ]
            ])
            ->add('prenom', TextType::class, [
                'label' => 'Prénom',
                'attr' => [
                    'placeholder' => 'Votre prénom',
                    'class' => 'form-control'
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'Le prénom est requis']),
                ]
            ])
            ->add('email', EmailType::class, [
                'label' => 'Adresse email',
                'attr' => [
                    'placeholder' => 'votre@email.com',
                    'class' => 'form-control'
                ],
                'constraints' => [
                    new Assert\NotBlank(['message' => 'L\'adresse email est requise']),
                    new Assert\Email(['message' => 'L\'adresse email n\'est pas valide'])
                ]
            ])
            ->add('produit', EntityType::class, [
                'class' => Stock::class,
                'query_builder' => function ($repository) {
                    return $repository->createQueryBuilder('s')
                        ->orderBy('s.name', 'ASC');
                },
                'choice_label' => function (Stock $stock) {
                    return sprintf('%s (%.2f €)', $stock->getName(), $stock->getPrice());
                },
                'label' => 'Produit',
                'placeholder' => 'Sélectionnez un produit',
                'expanded' => false,
                'multiple' => false,
                'attr' => [
                    'class' => 'form-select'
                ],
                'constraints' => [
                    new Assert\NotNull(['message' => 'Veuillez sélectionner un produit'])
                ]
            ])
            ->add('quantiteCommandee', IntegerType::class, [
                'label' => 'Quantité',
                'data' => 1,
                'attr' => [
                    'min' => 1,
                    'max' => 10,
                    'class' => 'form-control'
                ],
                'help' => 'Maximum 10 unités par commande',
                'constraints' => [
                    new Assert\NotBlank(['message' => 'La quantité est requise']),
                    new Assert\Range([
                        'min' => 1,
                        'max' => 10,
                        'notInRangeMessage' => 'La quantité doit être entre {{ min }} et {{ max }}',
                    ]),
                ]
            ])
            ->add('message', TextareaType::class, [
                'label' => 'Message (optionnel)',
                'required' => false,
                'attr' => [
                    'rows' => 4,
                    'placeholder' => 'Des précisions sur votre commande...',
                    'class' => 'form-control'
                ]
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'Valider la pré-commande',
                'attr' => [
                    'class' => 'btn btn-primary btn-lg w-100'
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => PreOrder::class,
            'constraints' => [
                new Assert\Callback([$this, 'validateStockQuantity'])
            ]
        ]);
    }

    public function validateStockQuantity(PreOrder $preOrder, ExecutionContextInterface $context): void
    {
        $stock = $preOrder->getProduit();
        $quantite = $preOrder->getQuantiteCommandee();

        if ($stock && $quantite) {
            $stockDisponible = $stock->getQuantity();
            
            if ($quantite > $stockDisponible) {
                $context->buildViolation(
                    'La quantité demandée ({{ quantite }}) dépasse le stock disponible ({{ stock }} unité(s)).'
                )
                ->setParameter('{{ quantite }}', $quantite)
                ->setParameter('{{ stock }}', $stockDisponible)
                ->atPath('quantiteCommandee')
                ->addViolation();
            }
        }
    }
}
