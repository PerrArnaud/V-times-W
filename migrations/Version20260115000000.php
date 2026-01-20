<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260115000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create pre_order table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE pre_order (id SERIAL NOT NULL, produit_id INT NOT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, quantite_commandee INT NOT NULL, message TEXT DEFAULT NULL, date_creation TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, statut VARCHAR(20) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_47017D3BF347EFB ON pre_order (produit_id)');
        $this->addSql('COMMENT ON COLUMN pre_order.date_creation IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE pre_order ADD CONSTRAINT FK_47017D3BF347EFB FOREIGN KEY (produit_id) REFERENCES stock (id) ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE pre_order DROP CONSTRAINT FK_47017D3BF347EFB');
        $this->addSql('DROP TABLE pre_order');
    }
}
