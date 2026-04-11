Structure du projet (VS Code)
Dossiers :
backend
frontend

<img width="1919" height="1007" alt="Capture d&#39;écran 2026-04-10 215808" src="https://github.com/user-attachments/assets/fadebe5b-11b1-49fe-9955-3529beb8175d" />
Description :
Le projet est organisé en deux parties :

Backend : API (Node.js / Spring selon ton cas)
Frontend : interface utilisateur (React)

Cette architecture suit le modèle Full Stack (client / serveur).
---
Page d’accueil (Home)
Message : Welcome to BookStore
Boutons :
Browse Books
View Categories
<img width="1853" height="732" alt="Capture d&#39;écran 2026-04-10 221903" src="https://github.com/user-attachments/assets/d78fdde5-63b3-4e4b-aae8-aaa8f81ed6e0" />
Description :
Page principale de l’application.
Elle permet à l’utilisateur de naviguer vers :

la liste des livres
les catégories
---
Navbar (Menu)
Home
Books
Categories
Cart
Dashboard
My Orders
<img width="1919" height="952" alt="Capture d&#39;écran 2026-04-10 221917" src="https://github.com/user-attachments/assets/c3b14dea-7efb-49ce-830a-0838100c046d" />
Description :
Barre de navigation qui permet d’accéder rapidement aux différentes fonctionnalités du site.
---
Page Books
Livres affichés :
The Midnight Library
Clean Code
Atomic Habits
Bouton : Add to cart
<img width="1919" height="960" alt="Capture d&#39;écran 2026-04-10 221927" src="https://github.com/user-attachments/assets/c61c6c0e-1501-4e93-a90c-e18658726218" />
Description :
Affichage dynamique des livres récupérés depuis le backend.
L’utilisateur peut ajouter un livre au panier.
---
Page Categories
Fiction
Technology
Business
<img width="1919" height="943" alt="Capture d&#39;écran 2026-04-10 221936" src="https://github.com/user-attachments/assets/c10e5eb1-ef17-41f5-8bd8-b6eb971193c7" />
Description :
Affiche les catégories disponibles avec le nombre de livres dans chaque catégorie.
---
Page Cart (Panier)
Liste des livres ajoutés
Quantité + prix
Total : 74.49
Boutons :
Clear cart
Confirm order
<img width="1919" height="946" alt="Capture d&#39;écran 2026-04-10 221954" src="https://github.com/user-attachments/assets/0fde9df2-3890-48c6-8f3d-b70ae7e1f8ab" />
Description :
Le panier permet :

de visualiser les produits sélectionnés
de calculer le total
de confirmer la commande
---
Dashboard (Admin)
Ajouter un livre
Modifier / Supprimer un livre
<img width="1919" height="946" alt="Capture d&#39;écran 2026-04-10 222009" src="https://github.com/user-attachments/assets/a8e7ee9a-6456-4cea-bade-771f6eadaabe" />
Description :
Interface d’administration permettant :

la gestion des livres (CRUD)
mise à jour des données
---
Page Login
Email + Password
Bouton Login
<img width="1919" height="952" alt="Capture d&#39;écran 2026-04-10 222018" src="https://github.com/user-attachments/assets/9e5599f6-53a8-4375-8fd0-c82f9f7edca5" />
Description :
Permet à l’utilisateur de se connecter à son compte
---
Page Register
Champs :
nom
email
adresse
téléphone
mot de passe

<img width="1919" height="952" alt="Capture d&#39;écran 2026-04-10 222040" src="https://github.com/user-attachments/assets/0b693eb3-25c2-4e5d-bc6c-d3dbfd400505" />
Description :
Permet à un nouvel utilisateur de créer un compte.
---
Page Category Detail
Exemple : Fiction → affiche les livres

<img width="1919" height="949" alt="Capture d&#39;écran 2026-04-10 222056" src="https://github.com/user-attachments/assets/86f1490c-c536-412d-8fe5-98e93068454a" />
Description :
Quand on clique sur une catégorie, on voit les livres associés.
---
Conclusion générale (Frontend)
✔️ Interface moderne et responsive
✔️ Communication avec backend (API)
✔️ Gestion panier
✔️ Authentification (login/register)
✔️ Dashboard admin (CRUD)
✔️ Navigation fluide

👉 Le frontend est complètement fonctionnel et connecté au backend.








