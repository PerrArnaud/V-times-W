<?php

namespace App\Entity;

use App\Repository\StockRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: StockRepository::class)]
class Stock
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    #[Assert\PositiveOrZero(message: 'La quantité ne peut pas être négative')]
    private ?int $quantity = null;

    #[ORM\Column]
    private ?float $price = null;

    #[ORM\Column(length: 255)]
    private ?string $image = null;

    /**
     * @var Collection<int, PreOrder>
     */
    #[ORM\OneToMany(targetEntity: PreOrder::class, mappedBy: 'produit')]
    private Collection $preOrders;

    public function __construct()
    {
        $this->preOrders = new ArrayCollection();
        $this->price = 20.0; // Prix par défaut
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(?int $quantity): static
    {if ($quantity !== null && $quantity < 0) {
            throw new \InvalidArgumentException('La quantité ne peut pas être négative');
        }
        
        $this->quantity = $quantity;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(string $image): static
    {
        $this->image = $image;

        return $this;
    }

    /**
     * @return Collection<int, PreOrder>
     */
    public function getPreOrders(): Collection
    {
        return $this->preOrders;
    }

    public function addPreOrder(PreOrder $preOrder): static
    {
        if (!$this->preOrders->contains($preOrder)) {
            $this->preOrders->add($preOrder);
            $preOrder->setProduit($this);
        }

        return $this;
    }

    public function removePreOrder(PreOrder $preOrder): static
    {
        if ($this->preOrders->removeElement($preOrder)) {
            // set the owning side to null (unless already changed)
            if ($preOrder->getProduit() === $this) {
                $preOrder->setProduit(null);
            }
        }

        return $this;
    }

    public function isAvailable(): bool
    {
        return $this->quantity !== null && $this->quantity > 0;
    }
}
