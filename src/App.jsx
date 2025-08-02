import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGame } from './hooks/useGame';
import { preCacheCharacters } from './lib/jikan';
import LoginScreen from './components/LoginScreen';
import MatchmakingScreen from './components/MatchmakingScreen';
import GameScreen from './components/GameScreen';
import GameFinishedScreen from './components/GameFinishedScreen';
import './App.css';

function App() {
  const { user, loading: authLoading, error: authError, login, register, logout } = useAuth();
  const {
    gameState,
    gameRoom,
    playerCards,
    currentRound,
    timer,
    scores,
    selectedCard,
    opponentSelected,
    roundResult,
    loading: gameLoading,
    error: gameError,
    startMatchmaking,
    selectCard,
    leaveGame
  } = useGame(user);

  // Pre-cache characters when app loads
  useEffect(() => {
    if (user) {
      preCacheCharacters(20);
    }
  }, [user]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Hugyo!...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return (
      <LoginScreen 
        onLogin={login}
        onRegister={register}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Handle different game states
  switch (gameState) {
    case 'searching':
    case 'idle':
      return (
        <MatchmakingScreen 
          user={user}
          gameState={gameState}
          onStartMatchmaking={startMatchmaking}
          onLogout={logout}
          loading={gameLoading}
        />
      );

    case 'in-game':
      return (
        <GameScreen 
          user={user}
          gameRoom={gameRoom}
          playerCards={playerCards}
          currentRound={currentRound}
          timer={timer}
          scores={scores}
          selectedCard={selectedCard}
          opponentSelected={opponentSelected}
          roundResult={roundResult}
          onSelectCard={selectCard}
          onLeaveGame={leaveGame}
          loading={gameLoading}
        />
      );

    case 'finished':
      return (
        <GameFinishedScreen 
          user={user}
          gameRoom={gameRoom}
          scores={scores}
          onPlayAgain={() => {
            leaveGame();
            setTimeout(() => startMatchmaking(), 1000);
          }}
          onBackToMenu={leaveGame}
        />
      );

    default:
      return (
        <MatchmakingScreen 
          user={user}
          gameState={gameState}
          onStartMatchmaking={startMatchmaking}
          onLogout={logout}
          loading={gameLoading}
        />
      );
  }
}

export default App;
