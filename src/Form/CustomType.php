<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

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
                'placeholder' => 'Sélectionnez un cadran'
            ])
            ->add('aiguille', ChoiceType::class, [
                'label' => 'Choisissez vos aiguilles',
                'choices' => [
                    'Aiguilles Noires' => 'noires',
                    'Aiguilles Dorées' => 'dorées',
                ],
                'attr' => ['class' => 'form-select'],
                'placeholder' => 'Sélectionnez des aiguilles'
            ])
            ->add('chiffres', ChoiceType::class, [
                'label' => 'Choisissez vos chiffres',
                'choices' => [
                    'Chiffres Romains' => 'romains',
                    'Chiffres Arabes' => 'arabes',
                    'Pas de Chiffres' => 'none',
                ],
                'attr' => ['class' => 'form-select'],
                'placeholder' => 'Sélectionnez un style de chiffres'
            ])
            ->add('submit', SubmitType::class, [
                'label' => 'Personnaliser',
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
