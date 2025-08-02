import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Clock, 
  User, 
  Trophy, 
  Star, 
  Zap,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import '../App.css';

const GameScreen = ({ 
  user,
  gameRoom,
  playerCards,
  currentRound,
  timer,
  scores,
  selectedCard,
  opponentSelected,
  roundResult,
  onSelectCard,
  onLeaveGame,
  loading
}) => {
  const [timeLeft, setTimeLeft] = useState(timer);

  useEffect(() => {
    setTimeLeft(timer);
  }, [timer]);

  useEffect(() => {
    if (timeLeft > 0 && !selectedCard && !roundResult) {
      const countdown = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(countdown);
    }
  }, [timeLeft, selectedCard, roundResult]);

  const opponent = gameRoom?.players ? 
    Object.values(gameRoom.players).find(p => p.uid !== user?.uid) : null;

  const getTimerColor = () => {
    if (timeLeft > 15) return 'bg-green-500';
    if (timeLeft > 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTimerProgress = () => {
    return (timeLeft / 20) * 100;
  };

  if (roundResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Round {currentRound} Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Card */}
                <div className="text-center space-y-4">
                  <h3 className="text-white font-semibold">Your Choice</h3>
                  <div className="bg-white/10 rounded-lg p-4">
                    <img 
                      src={roundResult.player1Card?.image || '/placeholder-character.png'} 
                      alt={roundResult.player1Card?.name}
                      className="w-32 h-40 object-cover rounded-lg mx-auto mb-2"
                    />
                    <p className="text-white font-semibold">{roundResult.player1Card?.name}</p>
                  </div>
                </div>

                {/* Opponent Card */}
                <div className="text-center space-y-4">
                  <h3 className="text-white font-semibold">Opponent's Choice</h3>
                  <div className="bg-white/10 rounded-lg p-4">
                    <img 
                      src={roundResult.player2Card?.image || '/placeholder-character.png'} 
                      alt={roundResult.player2Card?.name}
                      className="w-32 h-40 object-cover rounded-lg mx-auto mb-2"
                    />
                    <p className="text-white font-semibold">{roundResult.player2Card?.name}</p>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold">
                  {roundResult.winner === 'player' && (
                    <span className="text-green-400">You Win This Round!</span>
                  )}
                  {roundResult.winner === 'opponent' && (
                    <span className="text-red-400">Opponent Wins This Round!</span>
                  )}
                  {roundResult.winner === 'tie' && (
                    <span className="text-yellow-400">It's a Tie!</span>
                  )}
                </div>
                <p className="text-gray-300 max-w-md mx-auto">
                  {roundResult.explanation}
                </p>
              </div>

              {/* Scores */}
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <p className="text-gray-300">You</p>
                  <p className="text-2xl font-bold text-white">{scores.player}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-300">Opponent</p>
                  <p className="text-2xl font-bold text-white">{scores.opponent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          onClick={onLeaveGame}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Leave Game
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Round {currentRound}</h1>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
            Battle in Progress
          </Badge>
        </div>

        <div className="text-right">
          <p className="text-white font-semibold">vs {opponent?.displayName || 'Opponent'}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Game Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Timer */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white font-semibold">Time Left</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{timeLeft}s</div>
              <Progress 
                value={getTimerProgress()} 
                className="h-2"
                style={{
                  background: 'rgba(255,255,255,0.1)'
                }}
              />
            </CardContent>
          </Card>

          {/* Scores */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white font-semibold">Score</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {scores.player} - {scores.opponent}
              </div>
              <p className="text-gray-300 text-sm">First to 3 wins</p>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white font-semibold">Status</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  {selectedCard ? (
                    <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400 mr-1" />
                  )}
                  <span className="text-white text-sm">
                    {selectedCard ? 'Card Selected' : 'Choose Card'}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  {opponentSelected ? (
                    <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400 mr-1" />
                  )}
                  <span className="text-white text-sm">
                    {opponentSelected ? 'Opponent Ready' : 'Opponent Choosing'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Cards */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Choose Your Character</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Select the character you think will win this round
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-2" />
                <p className="text-white">Loading characters...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {playerCards.map((card, index) => (
                  <div key={card.id || index} className="text-center">
                    <Button
                      onClick={() => onSelectCard(index)}
                      disabled={selectedCard !== null || timeLeft === 0}
                      className={`w-full h-auto p-0 bg-transparent border-2 transition-all duration-200 ${
                        selectedCard?.id === card.id
                          ? 'border-yellow-400 bg-yellow-400/20'
                          : 'border-white/20 hover:border-yellow-400/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="p-3 space-y-2">
                        <div className="relative">
                          <img 
                            src={card.image || '/placeholder-character.png'} 
                            alt={card.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {selectedCard?.id === card.id && (
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-yellow-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm truncate">
                            {card.name}
                          </p>
                          <div className="flex items-center justify-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-yellow-400 text-xs">
                              {Math.floor(Math.random() * 5) + 1}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting for opponent */}
        {selectedCard && !opponentSelected && (
          <div className="text-center mt-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 inline-block">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                  <span className="text-white">Waiting for opponent to choose...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Both selected, comparing */}
        {selectedCard && opponentSelected && (
          <div className="text-center mt-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 inline-block">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <span className="text-white">Comparing characters...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;

