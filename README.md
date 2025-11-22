Lokálne spustenie
==================

Požiadavky
--------------------

Pre spustenie je potrebné mať stiahnutý Node a Visual Studio Code s Azure App Service extension.  
Na manažment Node verzií môžeme použiť tento nástroj https://github.com/coreybutler/nvm-windows.  
Následne v konzole spustíme príkaz **nvm install 20.18.0** a ďalej **nvm use 20.18.0**.  
Ďalej si otvoríme projektový priečinok vo Visual Studio Code a v terminálovom okne Visual Studio Code napíšeme príkaz **npm install**.

Spustenie
---------------------

Je nutne si pozrieť na akú adresu sa odkazuje client na manažment HTTP requestov.  
Toto je možné v súbore **src/app/api.ts** na prvých par riadkoch kódu.  
Pre lokálne spustenie je potrebné mať https://localhost:5092/api.  
Ďalej môžeme napísať príkaz **npm start** ktorý nám spusti aplikáciu lokálne.  

Nasadenie do produkcie
======================

Tento guide je miereny na nasadenie na Microsoft Azure.  

Požiadavky
-----------------------

Pre nasadenie je potrebné mať vytvorenú App Service službu s runtime stack NODE 20 LTS.  

Proces nasadenia
-----------------------

Je nutne si pozrieť na akú adresu sa odkazuje client na manažment HTTP requestov.  
Toto je možné v súbore **src/app/api.ts** na prvých par riadkoch kódu.  
Pre lokálne spustenie je potrebné mať adresu nasadenej backend aplikácie.  
Následne môžeme napísať príkaz npm build, ktorý nam vygeneruje Build priečinok s obsahom pre nasadenie.   
Na lavej lište otvoríme menu pre Azure, prihlasíme sa, zvolíme ktorú subscription používame pre nasadenú app service.  
Ďalej si otvoríme záložku App Services, kde by sme mali vidieť nam prístupne App Services.  
Na tu ktorú sme vytvorili pre frontend dame prave tlačídlo myši a zvolíme možnosť **Deploy to web app**.  
![image](https://github.com/user-attachments/assets/e9b410b1-168e-4b49-8ba7-e98401b4182b)
