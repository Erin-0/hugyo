// Game logic hook
import { useState, useEffect, useCallback } from 'react';
import { ref, push, set, onValue, off, onDisconnect, remove } from 'firebase/database';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { database, firestore } from '../lib/firebase';
import { getRandomCharacters } from '../lib/jikan';
import { compareCharacters } from '../lib/gemini';

export const useGame = (user) => {
  const [gameState, setGameState] = useState('idle'); // idle, searching, in-game, finished
  const [gameRoom, setGameRoom] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [opponentCards, setOpponentCards] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [timer, setTimer] = useState(20);
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [selectedCard, setSelectedCard] = useState(null);
  const [opponentSelected, setOpponentSelected] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Start matchmaking
  const startMatchmaking = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      setGameState('searching');
      
      // Add player to matchmaking queue
      const queueRef = ref(database, 'matchmaking');
      const playerRef = push(queueRef, {
        uid: user.uid,
        displayName: user.displayName,
        timestamp: Date.now()
      });
      
      // Set up disconnect handler
      onDisconnect(playerRef).remove();
      
      // Listen for game room creation
      const gameRoomsRef = ref(database, 'gameRooms');
      const unsubscribe = onValue(gameRoomsRef, (snapshot) => {
        if (snapshot.exists()) {
          const rooms = snapshot.val();
          
          // Find room where current user is a player
          for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players && (room.players[user.uid] || Object.values(room.players).some(p => p.uid === user.uid))) {
              // Remove from queue
              remove(playerRef);
              
              // Join the game room
              setGameRoom({ id: roomId, ...room });
              setGameState('in-game');
              
              // Initialize game
              initializeGame(roomId, room);
              break;
            }
          }
        }
      });
      
      // Clean up listener after 30 seconds if no match found
      setTimeout(() => {
        unsubscribe();
        if (gameState === 'searching') {
          remove(playerRef);
          setGameState('idle');
          setError('No opponent found. Please try again.');
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting matchmaking:', error);
      setError('Failed to start matchmaking');
      setGameState('idle');
    } finally {
      setLoading(false);
    }
  }, [user, gameState]);

  // Initialize game when room is created
  const initializeGame = useCallback(async (roomId, room) => {
    try {
      // Get player cards
      const cards = await getRandomCharacters(5);
      setPlayerCards(cards);
      
      // Store player cards in database (private to player)
      const playerCardsRef = ref(database, `gameRooms/${roomId}/playerCards/${user.uid}`);
      await set(playerCardsRef, cards);
      
      // Reset game state
      setCurrentRound(1);
      setTimer(20);
      setScores({ player: 0, opponent: 0 });
      setSelectedCard(null);
      setOpponentSelected(false);
      setRoundResult(null);
      
      // Listen to game updates
      listenToGameUpdates(roomId);
      
    } catch (error) {
      console.error('Error initializing game:', error);
      setError('Failed to initialize game');
    }
  }, [user]);

  // Listen to game updates
  const listenToGameUpdates = useCallback((roomId) => {
    const gameRef = ref(database, `gameRooms/${roomId}`);
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        setGameRoom({ id: roomId, ...room });
        
        // Update scores
        if (room.players) {
          const players = Object.entries(room.players);
          const currentPlayer = players.find(([uid]) => uid === user.uid);
          const opponent = players.find(([uid]) => uid !== user.uid);
          
          if (currentPlayer && opponent) {
            setScores({
              player: currentPlayer[1].score || 0,
              opponent: opponent[1].score || 0
            });
          }
        }
        
        // Update game state
        if (room.gameState) {
          setCurrentRound(room.gameState.currentRound || 1);
          setTimer(room.gameState.timer || 20);
          
          if (room.gameState.status === 'finished') {
            setGameState('finished');
            updatePlayerStats(scores.player > scores.opponent);
          }
        }
        
        // Update round data
        if (room.roundData) {
          const opponentUid = Object.keys(room.players).find(uid => uid !== user.uid);
          setOpponentSelected(room.roundData[`${opponentUid}_selection`]?.hasSelected || false);
        }
      }
    });
    
    return unsubscribe;
  }, [user, scores]);

  // Select a card for the current round
  const selectCard = useCallback(async (cardIndex) => {
    if (!gameRoom || selectedCard !== null) return;
    
    try {
      const card = playerCards[cardIndex];
      setSelectedCard(card);
      
      // Update selection in database
      const selectionRef = ref(database, `gameRooms/${gameRoom.id}/roundData/${user.uid}_selection`);
      await set(selectionRef, {
        hasSelected: true,
        card: card,
        timestamp: Date.now()
      });
      
      // Check if both players have selected
      checkBothPlayersSelected();
      
    } catch (error) {
      console.error('Error selecting card:', error);
      setError('Failed to select card');
    }
  }, [gameRoom, playerCards, selectedCard, user]);

  // Check if both players have selected cards
  const checkBothPlayersSelected = useCallback(async () => {
    if (!gameRoom) return;
    
    const roundDataRef = ref(database, `gameRooms/${gameRoom.id}/roundData`);
    
    onValue(roundDataRef, async (snapshot) => {
      if (snapshot.exists()) {
        const roundData = snapshot.val();
        const players = Object.keys(gameRoom.players);
        
        const allSelected = players.every(uid => 
          roundData[`${uid}_selection`]?.hasSelected
        );
        
        if (allSelected) {
          // Both players selected, compare cards
          await compareCards(roundData);
        }
      }
    });
  }, [gameRoom]);

  // Compare selected cards using Gemini API
  const compareCards = useCallback(async (roundData) => {
    if (!gameRoom) return;
    
    try {
      const players = Object.keys(gameRoom.players);
      const player1Uid = players[0];
      const player2Uid = players[1];
      
      const player1Card = roundData[`${player1Uid}_selection`].card;
      const player2Card = roundData[`${player2Uid}_selection`].card;
      
      // Compare using Gemini API
      const result = await compareCharacters(player1Card, player2Card);
      
      // Determine winner and update scores
      let winner = null;
      if (result.winner === 'character1') {
        winner = player1Uid;
      } else if (result.winner === 'character2') {
        winner = player2Uid;
      }
      
      // Update scores in database
      if (winner) {
        const winnerRef = ref(database, `gameRooms/${gameRoom.id}/players/${winner}/score`);
        await set(winnerRef, (gameRoom.players[winner]?.score || 0) + 1);
      } else {
        // Tie - both players get 0.5 points
        for (const uid of players) {
          const playerRef = ref(database, `gameRooms/${gameRoom.id}/players/${uid}/score`);
          await set(playerRef, (gameRoom.players[uid]?.score || 0) + 0.5);
        }
      }
      
      // Set round result
      setRoundResult({
        player1Card,
        player2Card,
        winner: winner === user.uid ? 'player' : winner ? 'opponent' : 'tie',
        explanation: result.explanation
      });
      
      // Check if game is finished (first to 3 points)
      const newScores = {
        [player1Uid]: (gameRoom.players[player1Uid]?.score || 0) + (winner === player1Uid ? 1 : winner ? 0 : 0.5),
        [player2Uid]: (gameRoom.players[player2Uid]?.score || 0) + (winner === player2Uid ? 1 : winner ? 0 : 0.5)
      };
      
      if (Math.max(...Object.values(newScores)) >= 3) {
        // Game finished
        const gameStateRef = ref(database, `gameRooms/${gameRoom.id}/gameState`);
        await set(gameStateRef, {
          status: 'finished',
          winner: newScores[player1Uid] > newScores[player2Uid] ? player1Uid : 
                  newScores[player2Uid] > newScores[player1Uid] ? player2Uid : 'tie'
        });
      } else {
        // Next round
        setTimeout(() => {
          nextRound();
        }, 5000); // Show result for 5 seconds
      }
      
    } catch (error) {
      console.error('Error comparing cards:', error);
      setError('Failed to compare cards');
    }
  }, [gameRoom, user]);

  // Move to next round
  const nextRound = useCallback(async () => {
    if (!gameRoom) return;
    
    try {
      const nextRoundNumber = currentRound + 1;
      
      // Clear round data
      const roundDataRef = ref(database, `gameRooms/${gameRoom.id}/roundData`);
      await set(roundDataRef, {});
      
      // Update game state
      const gameStateRef = ref(database, `gameRooms/${gameRoom.id}/gameState`);
      await set(gameStateRef, {
        currentRound: nextRoundNumber,
        timer: 20,
        status: 'in_progress'
      });
      
      // Reset local state
      setSelectedCard(null);
      setOpponentSelected(false);
      setRoundResult(null);
      setTimer(20);
      
    } catch (error) {
      console.error('Error moving to next round:', error);
      setError('Failed to move to next round');
    }
  }, [gameRoom, currentRound]);

  // Update player statistics
  const updatePlayerStats = useCallback(async (won) => {
    if (!user) return;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        totalGames: increment(1),
        wins: increment(won ? 1 : 0),
        losses: increment(won ? 0 : 1)
      });
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  }, [user]);

  // Leave game
  const leaveGame = useCallback(async () => {
    if (!gameRoom) return;
    
    try {
      // Remove player from game room
      const playerRef = ref(database, `gameRooms/${gameRoom.id}/players/${user.uid}`);
      await remove(playerRef);
      
      // Reset local state
      setGameState('idle');
      setGameRoom(null);
      setPlayerCards([]);
      setOpponentCards([]);
      setSelectedCard(null);
      setRoundResult(null);
      setError(null);
      
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  }, [gameRoom, user]);

  return {
    gameState,
    gameRoom,
    playerCards,
    currentRound,
    timer,
    scores,
    selectedCard,
    opponentSelected,
    roundResult,
    loading,
    error,
    startMatchmaking,
    selectCard,
    leaveGame
  };
};

