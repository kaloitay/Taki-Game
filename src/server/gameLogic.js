const INITIAL_NUMBER_CARDS = 8;

// Taki class
 class Taki {
    constructor(numberOfPlayers, isThereComputerPlayer, table) {
        this.gameStatus = "initialization";
        this.openDeck = [];
        this.foldDeck = [];
        this.players = [];

        for (let i=0 ; i < numberOfPlayers ; i++)
            this.players[i] = new Player(table.users[i].type, table.users[i].name);

        this.winnerList = [];
        this.playerTurn = 0;
        this.isTakiHasBeenSet = false;
        this.isPlus2HasBeenSet = false;
        this.amountCardsToTake = 0;
        this.turnsDirection = 1;
        this.takiColor;

        this.createFoldDeck();
        this.randomFirstOpenCard();
        this.shuffleFoldDeck();
        this.handOutCardsToPlayers();
        this.startGameTime = new Date();
        this.endGameTime;

        this.modifyTurnIndicate(Math.floor(Math.random() * this.players.length));
        this.gameStatus = "started";
        this.gameManager();
    }

     getPlayersCards(userIDrequest) {
         let playersCards = [];
         let card;
         for (let i=0 ; i < this.players.length ; i++) {
             playersCards[i] = [];
             for (let j=0 ; j < this.players[i].cards.length; j++) {
                 if (userIDrequest == i) {
                     card = this.players[i].cards[j];
                     playersCards[i][j] = card.color + "_" + card.sign + "_" + card.id;
                 }
                 else
                     playersCards[i][j] = "card_back_" + j;
             }
         }
         return playersCards;
     }

     getPlayersStatus() {
         let playersStatus = [];
         for (let i=0 ; i < this.players.length ; i++) {
             playersStatus[i] = this.players[i].status;
         }
         return playersStatus;
     }

     getPlayersStats() {
         let playersStats = [];
         for (let i=0 ; i < this.players.length ; i++) {
             playersStats[i] = this.players[i].stats;
         }
         return playersStats;
     }

     quitGame(userIDrequest) {
        let isAllPlayersQuit = true;
         this.players[userIDrequest].status = "quit";

         for (let i = 0; i < this.players.length; i++) {
             if (this.players[i].status != "quit")
                 isAllPlayersQuit = false;
         }
         return isAllPlayersQuit;
     }

    ////////////////////////
    // Initialize methods //
    ////////////////////////

    createFoldDeck() {
        let signs = ["1", "3", "4", "5", "6", "7", "8", "9", "+2", "stop", "plus","changedir", "taki"];
        let colors = ["blue", "red", "yellow", "green"];
        let colorlessCardsSigns = ["colorChanger"];

        for (let i = 0; i < signs.length; i++) {
            let type = (signs[i] >= "1" && signs[i] <= "9") ? ("number") : signs[i];
            for (let j = 0; j < colors.length; j++) {
                for (let k = 1; k <= 2; k++)
                    this.foldDeck.push(new Card(colors[j], signs[i], type, k));
            }
        }

        for (let i = 0; i < colorlessCardsSigns.length; i++) {
            for (let k = 1; k <= 4; k++)
                this.foldDeck.push(new Card("colorless", colorlessCardsSigns[i], colorlessCardsSigns[i], k));
        }

        for (let k = 1; k <= 2; k++)
            this.foldDeck.push(new Card("colorless", "superTaki", "taki", k));
    }

    randomFirstOpenCard() {
        let randomFirstOpenCard = Math.floor(Math.random() * 64); // the 64 is for random only number card
        this.openDeck.push(this.foldDeck[randomFirstOpenCard]);
        this.foldDeck.splice(randomFirstOpenCard, 1);
    }

    shuffleFoldDeck() {
        let j, x, i;
        for (i = this.foldDeck.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = this.foldDeck[i];
            this.foldDeck[i] = this.foldDeck[j];
            this.foldDeck[j] = x;
        }
        return this.foldDeck;
    }

    handOutCardsToPlayers() {
        for (let i = 0; i < this.players.length; i++) {
            this.amountCardsToTake = INITIAL_NUMBER_CARDS;
            this.takeCards(this.players[i]);
        }
        this.amountCardsToTake = 0;
    }

     addWinner(winner) {
        if (winner.type == "human")
            winner.status = "won";
        else
            winner.status = "quit";

        this.winnerList.push(winner);

        if (this.winnerList.length + 1 == this.players.length) {
            this.endGameTime = new Date();

            this.gameStatus = "ended";
        }
    }

    ////////////////////////
    // Game logic methods //
    ////////////////////////

    gameManager() {
        if (this.players[this.playerTurn].type === "computer") {
            let cardsToSet = this.computerAlgorithmWrapper();
            setTimeout((() => {
                this.computerTurns(cardsToSet);
            }).bind(this), 1000);
        }
    }

    takeCards(player) {
        if (this.isPlus2HasBeenSet === false && this.gameStatus === "started")
            this.amountCardsToTake = 1;

        for (; this.amountCardsToTake > 0; this.amountCardsToTake--)
            this.takeCard(player);

        if (this.gameStatus === "started") {
            this.isTakiHasBeenSet = false;
            this.isPlus2HasBeenSet = false;

            this.increaseTurnsAmount(this.players[this.playerTurn]);
            this.modifyTurnIndicate(this.turnsDirection);
            this.gameManager();
         }
     }

    takeCard(player) {
        let cardToTake = this.foldDeck[this.foldDeck.length - 1];

        player.cards.push(cardToTake);
        this.removeCardFromFoldDeck();

        if (this.isfoldDeckEmpty())
            this.createFoldDeckFromOpenDeck();
    }

    modifyTurnIndicate(turnStep) {
        let currentTime = new Date().getTime();

        if (this.gameStatus == "started")
            this.players[this.playerTurn].stats.turnsTimeSum += new Date(currentTime - this.players[this.playerTurn].stats.lastTurnStartTime).getTime();

        let res = this.playerTurn + turnStep;
        this.playerTurn = (res < 0) ? (res + this.players.length) : (res % this.players.length);

        while (this.players[this.playerTurn].status != "playing")
        {
            res = this.playerTurn + this.turnsDirection;
            this.playerTurn = (res < 0) ? (res + this.players.length) : (res % this.players.length);
        }

        this.players[this.playerTurn].stats.lastTurnStartTime = new Date().getTime();
    }

    removeCardFromFoldDeck() {
        this.foldDeck.pop();
    }

    createFoldDeckFromOpenDeck() {
        this.foldDeck = this.openDeck.splice(0, this.openDeck.length - 1);
        this.retrieveColorlessCards();
        this.shuffleFoldDeck();
    }

    retrieveColorlessCards() {
        for (let i = 0; i < this.foldDeck.length; i++) {
            if (this.foldDeck[i].type === "colorChanger")
                this.foldDeck[i].color = "colorless";
            else if (this.foldDeck[i].type === "taki" && this.foldDeck[i].id > 4) {
                this.foldDeck[i].color = "colorless";
                this.foldDeck[i].sign = "superTaki"
                this.foldDeck[i].id -= 2;
            }
        }
    }

    getArrayIndexOfCard(cards, chosenCard) {
        return cards.indexOf(chosenCard);
    }

    isValidStep(card) {
        let openCard = this.openDeck[this.openDeck.length - 1];

        return ((this.isPlus2HasBeenSet === false) &&
            ((card.color === openCard.color) ||
                (this.isTakiHasBeenSet === true && (this.TakiColor === card.color || (card.sign === openCard.sign && (card.sign === "plus")))) ||
                (this.isTakiHasBeenSet === false && (card.sign === openCard.sign || card.color === "colorless")))) ||
            (this.isTakiHasBeenSet === false && this.isPlus2HasBeenSet === true && card.type === "+2" && card.type === openCard.type) ||
            (this.isPlus2HasBeenSet === true && this.isTakiHasBeenSet === true && (this.TakiColor === card.color || (card.sign === openCard.sign && (card.sign === "plus"))));
    }

    isfoldDeckEmpty() {
        return this.foldDeck.length === 0;
    }

    getCardClassByString(player, cardString) {
        var splittedString = cardString.split("_");
        for (var i = 0; i < player.cards.length; i++) {
            if ((player.cards[i].color == splittedString[0] || splittedString[1] === "colorChanger") && player.cards[i].sign == splittedString[1] && player.cards[i].id == splittedString[2])
                return player.cards[i];
        }
        return null;
    }

    ////////////////////////
    /// Computer methods ///
    ////////////////////////

     computerTurns(cardsToSet) {
         if (this.gameStatus == "started") {
             if (cardsToSet[1] > 0)
                 this.executeComputerStep(cardsToSet[0]);
             else
                 this.takeCards(this.players[this.playerTurn]);
         }
     }

    computerAlgorithmWrapper() {
        return this.computerAlgorithm(this.players[this.playerTurn].cards.slice(), this.TakiColor, this.isTakiHasBeenSet, 0, this.openDeck[this.openDeck.length - 1], this.isPlus2HasBeenSet);
    }

    computerAlgorithm(virtualComputerCards, virtualTakiColor, virtualIsTakiHasBeenSet, cardsRank, virtualOpenCard, virtualIsPlus2HasBeenSet) {
        let bestCardsMatch = [], bestRankMatch = 0, bestCardsMatchLength = 0;
        for (let i = 0; i < virtualComputerCards.length; i++) {
            if (this.isValidStepComputerAlgorithm(virtualComputerCards[i], virtualOpenCard, virtualTakiColor, virtualIsTakiHasBeenSet, virtualIsPlus2HasBeenSet)) {
                // initialize variables
                let currentCardTemp = virtualComputerCards[i], currentSequenceUsingCards = [currentCardTemp];
                let currentTakiColor = virtualTakiColor, currentBooleanTaki = virtualIsTakiHasBeenSet, currentBooleanPlus2 = virtualIsPlus2HasBeenSet;
                let currentCardsRank = this.cardRank(currentCardTemp.type), currentCardsLength = 1;

                if (currentCardTemp.type === "taki") { // update that virtual taki has been set
                    currentTakiColor = currentCardTemp.color;
                    currentBooleanTaki = true;
                }
                else if (virtualIsTakiHasBeenSet === true && currentCardTemp.color !== virtualOpenCard.color)
                    currentBooleanTaki = false;

                if (currentCardTemp.type === "+2") {
                    currentBooleanPlus2 = true;
                }

                virtualComputerCards.splice(i, 1); // remove the current card from the virtual computer cards

                // check if we in "taki" or the current card is a action card
                // if it does call the current recursive method and update the open card to be the current card
                if ((currentCardTemp.type !== "colorChanger") &&
                    (virtualIsTakiHasBeenSet === true || currentCardTemp.type === "taki" || currentCardTemp.type === "plus")) {
                    let algoRes = this.computerAlgorithm(virtualComputerCards, currentTakiColor, currentBooleanTaki, cardsRank, currentCardTemp, currentBooleanPlus2);

                    currentSequenceUsingCards = currentSequenceUsingCards.concat(algoRes[0]); // concatenate the result
                    currentCardsLength += algoRes[1]; // update the cards length
                    currentCardsRank += algoRes[2]; // update the cards rank

                    // if the current sequence ends with plus the current cards length should won't change
                    if (algoRes[2] === 0 && (currentCardTemp.type === "plus"))
                        currentCardsLength--;
                }
                virtualComputerCards.splice(i, 0, currentCardTemp); // push back the current card

                // check if the current sequence is better than the best sequence
                if ((bestCardsMatch.length < currentCardsLength) || (bestCardsMatch.length === currentCardsLength && bestRankMatch > currentCardsRank)) {
                    bestCardsMatch = currentSequenceUsingCards;
                    bestCardsMatchLength = currentCardsLength;
                    bestRankMatch = currentCardsRank;
                }
            }
        }
        return [bestCardsMatch, bestCardsMatchLength, bestRankMatch];
    }

    mostColorComputerCards(cards) {
        // color bucket
        let colorBucket = [0, 0, 0, 0];
        for (let i = 0; i < cards.length; i++) {
            colorBucket[this.colorToIndex(cards[i].color)]++;
        }

        let selectedColorIndex = 0;
        for (let i = 1; i < colorBucket.length; i++) {
            if (colorBucket[i] > colorBucket[selectedColorIndex])
                selectedColorIndex = i;
        }

        return this.indexToCard(selectedColorIndex);
    }

    colorToIndex(computerCardColor) {
        if (computerCardColor === "blue")
            return 0;
        if (computerCardColor === "red")
            return 1;
        if (computerCardColor === "yellow")
            return 2;
        if (computerCardColor === "green")
            return 3;
    }

    indexToCard(cardIndex) {
        if (cardIndex === 0)
            return "blue";
        if (cardIndex === 1)
            return "red";
        if (cardIndex === 2)
            return "yellow";
        if (cardIndex === 3)
            return "green";
    }

    isValidStepComputerAlgorithm(card, virtualOpenCard, virtualTakiColor, virtualIsTakiHasBeenSet, virtualIsPlus2HasBeenSet) {
        return ((virtualIsPlus2HasBeenSet === false) &&
            ((card.color === virtualOpenCard.color) ||
                (virtualIsTakiHasBeenSet === true && (virtualTakiColor === card.color || (card.sign === virtualOpenCard.sign && (card.sign === "plus")))) ||
                (virtualIsTakiHasBeenSet === false && (card.sign === virtualOpenCard.sign || card.color === "colorless")))) ||
            (virtualIsTakiHasBeenSet === false && virtualIsPlus2HasBeenSet === true && card.type === "+2" && card.type === virtualOpenCard.type) ||
            (virtualIsPlus2HasBeenSet === true && virtualIsTakiHasBeenSet === true && (virtualTakiColor === card.color || (card.sign === virtualOpenCard.sign && (card.sign === "plus"))));
    }

    cardRank(cardType) {
        if (cardType === "number")
            return 1;
        if (cardType === "plus" || cardType === "stop" || cardType === "changedir")
            return 10;
        if (cardType === "+2")
            return 50;
        if (cardType === "taki")
            return 100;
        if (cardType === "colorChanger")
            return 1000;
        return 0;
    }

    getCardHandIndex(card) {
        for (let i = 0; i < this.players[this.playerTurn].cards.length; i++) {
            if (card.type == this.players[this.playerTurn].cards[i].type && card.id == this.players[this.playerTurn].cards[i].id)
                return i;
        }
    }

     useCard(player, chosenCard, chosenColor) {
         if ((this.isTakiHasBeenSet === true) && (chosenCard.color !== this.openDeck[this.openDeck.length - 1].color))
             this.isTakiHasBeenSet = false;

         if (chosenCard.type === "colorChanger" && chosenColor)
             chosenCard.color = chosenColor

         if (chosenCard.type === "taki") {
             this.isTakiHasBeenSet = true;
             if (chosenCard.color === "colorless") {
                 // super taki
                 chosenCard.sign = "taki";
                 chosenCard.color = this.openDeck[this.openDeck.length - 1].color;
                 chosenCard.id += 2;
             }
             this.TakiColor = chosenCard.color;
         }
         else if (chosenCard.type === "+2") {
             if (this.isTakiHasBeenSet === true)
                 this.amountCardsToTake = 2;
             else
                 this.amountCardsToTake += 2;

             this.isPlus2HasBeenSet = true;
         }
         else {
             this.isPlus2HasBeenSet = false;
             this.amountCardsToTake = 0;
         }

         if (player.cards.length == 1)
             player.stats.singleCardAmount++;

         this.openDeck.push(chosenCard);
         player.cards.splice(this.getArrayIndexOfCard(player.cards, chosenCard), 1);
     }

     executeStep(player, chosenCard, chosenColor) {
         this.useCard(player, chosenCard, chosenColor);

         if ((!this.isTakiHasBeenSet || (this.isTakiHasBeenSet && !this.isPlayerHaveCardToSet(this.players[this.playerTurn]))) && (chosenCard.type !== "plus")) {
             this.isTakiHasBeenSet = false;
             this.increaseTurnsAmount(this.players[this.playerTurn]);

             if (player.cards.length == 0)
                 this.addWinner(this.players[this.playerTurn]);

             if (chosenCard.type === "stop")
                 this.modifyTurnIndicate(this.turnsDirection * 2);
             else if (chosenCard.type === "changedir") {
                 this.turnsDirection *= -1;
                 this.modifyTurnIndicate(this.turnsDirection);
             }
             else
                 this.modifyTurnIndicate(this.turnsDirection);

             if (this.gameStatus == "started")
                 this.gameManager();
         }
     }

     executeComputerStep(cardsToSet) {
         let i = 0;
         let interval = setInterval((() => {
             if (this.gameStatus != "started") {
                 clearInterval(interval);
                 return;
             }

             // change color change from colorless to one of the colors in the computer hand
             if (cardsToSet[i].type === "colorChanger") {
                 let cardIndex = this.getCardHandIndex(cardsToSet[i]);
                 cardsToSet[i].color = this.mostColorComputerCards(this.players[this.playerTurn].cards);
                 this.players[this.playerTurn].cards[cardIndex].color = cardsToSet[i].color;
             }

             this.executeStep(this.players[this.playerTurn], cardsToSet[i]);

             // end computer turn
             if (i === cardsToSet.length - 1) {
                 clearInterval(interval);

                 if (cardsToSet[i].type === "plus")
                     this.takeCards(this.players[this.playerTurn]);
             }
             i++;
         }).bind(this), 500);
     }

    isPlayerHaveCardToSet(player) {
        let res = false;
        for (let i = 0; i < player.cards.length; i++) {
            if (this.isValidStep(player.cards[i]))
                res = true;
        }
        return res;
    }

    increaseTurnsAmount(player) {
        player.stats.turnsAmount++;
    }
}

// Player class
class Player {
    constructor(type, name) {
        this.cards = [];
        this.type = type;
        this.stats = new Stats();
        this.name = name;
        this.status = "playing";
    }
}

// Card class
class Card {
    constructor(Color, Sign, Type, ID) {
        this.color = Color;
        this.sign = Sign;
        this.type = Type;
        this.id = ID;
    }
}

// Stats class
class Stats {
    constructor() {
        this.turnsAmount = 0;
        this.singleCardAmount = 0;
        this.lastTurnStartTime;
        this.turnsTimeSum = 0;
    }
}

module.exports = { game: Taki }