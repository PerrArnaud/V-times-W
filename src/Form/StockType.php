<?php

namespace App\Form;

use App\Entity\Stock;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\NotBlank;

class StockType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'Nom du produit',
                'attr' => ['class' => 'form-control']
            ])
            ->add('quantity', IntegerType::class, [
                'label' => 'Quantité',
                'attr' => ['class' => 'form-control', 'min' => 0],
                'required' => false
            ])
            ->add('customPrice', CheckboxType::class, [
                'label' => 'Utiliser un prix personnalisé',
                'mapped' => false,
                'required' => false,
                'attr' => ['class' => 'form-check-input']
            ])
            ->add('price', NumberType::class, [
                'label' => 'Prix (€)',
                'attr' => [
                    'class' => 'form-control bg-light',
                    'step' => '0.01',
                    'min' => '0',
                    'readonly' => 'readonly'
                ],
                'required' => true,
                'empty_data' => '20.00'
            ])
            ->add('imageFile', FileType::class, [
                'label' => 'Image du produit',
                'mapped' => false,
                'required' => false,
                'attr' => ['class' => 'form-control'],
                'constraints' => [
                    new File([
                        'maxSize' => '2M',
                        'mimeTypes' => [
                            'image/jpeg',
                            'image/png',
                            'image/jpg',
                            'image/webp',
                        ],
                        'mimeTypesMessage' => 'Veuillez télécharger une image valide (JPEG, PNG, WebP)',
                        'maxSizeMessage' => 'L\'image ne doit pas dépasser 2 MB',
                    ])
                ],
                'help' => 'Formats acceptés: JPEG, PNG, WebP. Taille max: 2 MB'
            ])
        ;
        
        // Gérer le prix par défaut uniquement pour les nouvelles entités
        $builder->addEventListener(FormEvents::POST_SET_DATA, function (FormEvent $event) {
            $stock = $event->getData();
            $form = $event->getForm();
            
            // Si c'est un nouveau stock sans prix défini, mettre 20.0
            if ($stock && $stock->getPrice() === null) {
                $stock->setPrice(20.0);
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Stock::class,
        ]);
    }
}
