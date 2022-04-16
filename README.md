# What is this project ? 
This project is an adaptation for BoardGameArena of game Get on Board : New-York & London edited by Iello.
You can play here : https://boardgamearena.com

# How to install the auto-build stack

## Install builders
Install node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files
In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :
```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```
If you use it for another game, replace `getonboard` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files
Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint
Make sure ftp-sync.json and node_modules are in .gitignore

# TODO
stats
make 2-3p horizontal

- il faudrait que l’on voit ce qui a été coché sur les feuilles des adversaires en direct comme c’est le cas actuellement (avec toujours les encarts apparaissant sur le plateau de jeu, indiquant ce qu’ils ont coché) MAIS PAS LES SCORES ! Que ce soit dans le panel des joueurs à droite ou sur la fiche de jeu des adversaires. Ainsi on verrait que notre adversaire à cocher beaucoup de grand-mères et qu’il faut donc éventuellement se dépêcher si on veut compléter l’objectif des grand-mères avant ou en même temps que lui mais pas combien de points ses grands-mères lui rapportent. Le total visible de chaque joueur peut décourager ceux qui sont à la traîne et engager de l’abandon de parties si un joueur a décollé et est devenu irrattrapable. Je pense cependant que le scoring automatique devrait rester visible pour soi-même. Mais je ne suis pas contre un mode de jeu spécifique, à sélectionner, où l’on verrait le score de chacun s’actualiser comme c’est le cas actuellement. Je suis même pour, mais afin d’être le plus fidèle au jeu d’origine, il faudrait garder l’élément de surprise pour le mode de jeu par défaut ;


