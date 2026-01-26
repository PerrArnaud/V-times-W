<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class CustomType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('cadran', ChoiceType::class, [
                'label' => 'Choisissez votre cadran',
                'choices' => [
                    'Cadran Noir' => 'noir',
                    'Cadran Rouge' => 'rouge',
                ],
                'attr' => ['class' => 'form-select'],
                'placeholder' => 'Sélectionnez un cadran',
                'constraints' => [
                    new Assert\NotBlank(['message' => 'Veuillez sélectionner un cadran'])
                ]
            ])
            ->add('aiguille', ChoiceType::class, [
                'label' => 'Choisissez vos aiguilles',
                'choices' => [
                    'Aiguilles Noires' => 'noires',
                    'Aiguilles Dorées' => 'dorées',
                ],
                'attr' => ['class' => 'form-select'],
                'placeholder' => 'Sélectionnez des aiguilles',
                'constraints' => [
                    new Assert\NotBlank(['message' => 'Veuillez sélectionner des aiguilles'])
                ]
            ])
            ->add('chiffres', ChoiceType::class, [
                'label' => 'Choisissez vos chiffres',
                'choices' => [
                    'Chiffres Romains' => 'romains',
                    'Chiffres Arabes' => 'arabes',
                    'Pas de Chiffres' => 'none',
                ],
                'attr' => ['class' => 'form-select'],
                'placeholder' => 'Sélectionnez un style de chiffres',
                'constraints' => [
                    new Assert\NotBlank(['message' => 'Veuillez sélectionner un style de chiffres'])
                ]
            ])
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
                    new Assert\NotBlank(['message' => 'Le prénom est requis'])
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
            ->add('message', TextareaType::class, [
                'label' => 'Message complémentaire (optionnel)',
                'required' => false,
                'attr' => [
                    'rows' => 3,
                    'placeholder' => 'Des précisions sur votre personnalisation...',
                    'class' => 'form-control'
                ]
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'Commander ma personnalisation',
                'attr' => ['class' => 'btn btn-primary btn-lg w-100 mt-3']
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            // Configure your form options here
        ]);
    }
}
