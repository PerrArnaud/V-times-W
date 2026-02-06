# Configuration Portainer pour déploiement automatique

## 1. Dans Portainer

### Créer une nouvelle Stack :
1. Allez dans **Stacks** → **Add stack**
2. Nom : `v-times-app` (ou autre)
3. **Build method** : Git Repository
4. **Repository URL** : `https://github.com/votre-username/votre-repo`
5. **Repository reference** : `refs/heads/main`
6. **Compose path** : `docker-compose.portainer.yml`
7. Activez **GitOps updates** ou créez un **Webhook**

### Variables d'environnement à définir :
```
GITHUB_REPO=https://github.com/votre-username/votre-repo.git
GITHUB_BRANCH=main
DATABASE_URL=postgresql://user:password@db:5432/dbname?serverVersion=16&charset=utf8
POSTGRES_DB=v_times
POSTGRES_USER=vtimes_user
POSTGRES_PASSWORD=mot_de_passe_secure
```

### Récupérer le Webhook URL :
1. Dans votre stack, cliquez sur l'icône **Webhook**
2. Copiez l'URL générée (format : `https://portainer.example.com/api/stacks/webhooks/xxx-xxx-xxx`)

## 2. Dans GitHub

### Ajouter le secret :
1. **Settings** → **Secrets and variables** → **Actions**
2. Créez : `PORTAINER_WEBHOOK_URL`
3. Collez l'URL du webhook Portainer

## 3. Fonctionnement

À chaque push sur `main` :
1. GitHub Actions appelle le webhook Portainer
2. Portainer redéploie la stack
3. Le container fait un `git pull` et met à jour l'app
4. Symfony cache clear + migrations automatiques

## Alternative : GitOps automatique dans Portainer

Si vous activez **Automatic updates** dans Portainer :
- Portainer vérifie automatiquement le repo toutes les X minutes
- Pas besoin de webhook ni de GitHub Actions
- Plus simple mais moins réactif
