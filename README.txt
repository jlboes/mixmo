
meteor add jquery
meteor add jquery-ui
meteor add houston:admin

===== Importer un dictionnaire =====

mongoimport -h localhost:3001 --db meteor --collection dictionary --type json --file mots_fr_utf8.json

===== The Game =====
Components of the game:
120 tiles carved with letters and a Gangster
1 rulebook
1 storing bag

It's a quick letters game.
The letter tiles are all in the middle of the table face down.
Each player receives 6 letters.
At the signal, all players turn their tiles and try to make crosswords with them.
When a player has used all his letters he says Mixmo
Each player picks two more letters and the game goes on until the all face-down letters are used.
