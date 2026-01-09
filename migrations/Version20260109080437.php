<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260109080437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE commande (id SERIAL NOT NULL, types_id INT NOT NULL, users_id INT DEFAULT NULL, date_commande DATE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_6EEAA67D8EB23357 ON commande (types_id)');
        $this->addSql('CREATE INDEX IDX_6EEAA67D67B3B43D ON commande (users_id)');
        $this->addSql('CREATE TABLE stock (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, quantity INT DEFAULT NULL, price DOUBLE PRECISION NOT NULL, image VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE type_commande (id SERIAL NOT NULL, type VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE commande ADD CONSTRAINT FK_6EEAA67D8EB23357 FOREIGN KEY (types_id) REFERENCES type_commande (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE commande ADD CONSTRAINT FK_6EEAA67D67B3B43D FOREIGN KEY (users_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE commande DROP CONSTRAINT FK_6EEAA67D8EB23357');
        $this->addSql('ALTER TABLE commande DROP CONSTRAINT FK_6EEAA67D67B3B43D');
        $this->addSql('DROP TABLE commande');
        $this->addSql('DROP TABLE stock');
        $this->addSql('DROP TABLE type_commande');
    }
}
