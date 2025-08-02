import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Trophy, 
  Star, 
  RotateCcw, 
  Home,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import '../App.css';

const GameFinishedScreen = ({ 
  user,
  gameRoom,
  scores,
  onPlayAgain,
  onBackToMenu
}) => {
  const isWinner = scores.player > scores.opponent;
  const isTie = scores.player === scores.opponent;
  
  const opponent = gameRoom?.players ? 
    Object.values(gameRoom.players).find(p => p.uid !== user?.uid) : null;

  const getResultIcon = () => {
    if (isWinner) return <Trophy className="h-16 w-16 text-yellow-400" />;
    if (isTie) return <Minus className="h-16 w-16 text-gray-400" />;
    return <TrendingDown className="h-16 w-16 text-red-400" />;
  };

  const getResultText = () => {
    if (isWinner) return 'Victory!';
    if (isTie) return 'Draw!';
    return 'Defeat!';
  };

  const getResultColor = () => {
    if (isWinner) return 'text-green-400';
    if (isTie) return 'text-gray-400';
    return 'text-red-400';
  };

  const getResultBadge = () => {
    if (isWinner) return 'Winner';
    if (isTie) return 'Draw';
    return 'Better luck next time';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {getResultIcon()}
            </div>
            <div>
              <CardTitle className={`text-4xl font-bold ${getResultColor()}`}>
                {getResultText()}
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg mt-2">
                Game completed
              </CardDescription>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-lg px-4 py-2 ${
                isWinner ? 'bg-green-500/20 text-green-300' :
                isTie ? 'bg-gray-500/20 text-gray-300' :
                'bg-red-500/20 text-red-300'
              }`}
            >
              {getResultBadge()}
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Final Score */}
            <div className="text-center space-y-4">
              <h3 className="text-white text-xl font-semibold">Final Score</h3>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <p className="text-gray-300 mb-1">You</p>
                  <p className="text-3xl font-bold text-white">{scores.player}</p>
                  <p className="text-sm text-gray-400">{user?.displayName}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">VS</div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-300 mb-1">Opponent</p>
                  <p className="text-3xl font-bold text-white">{scores.opponent}</p>
                  <p className="text-sm text-gray-400">{opponent?.displayName || 'Opponent'}</p>
                </div>
              </div>
            </div>

            {/* Stats Update */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 text-center">Stats Updated</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-blue-400 text-sm">Games</span>
                  </div>
                  <p className="text-white font-semibold">+1</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    {isWinner ? (
                      <>
                        <Trophy className="h-4 w-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm">Wins</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                        <span className="text-red-400 text-sm">Losses</span>
                      </>
                    )}
                  </div>
                  <p className="text-white font-semibold">{isTie ? '0' : '+1'}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 text-sm">Rating</span>
                  </div>
                  <p className="text-white font-semibold">
                    {isWinner ? '+25' : isTie ? '0' : '-15'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onPlayAgain}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-3"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </Button>
              
              <Button 
                onClick={onBackToMenu}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Menu
              </Button>
            </div>

            {/* Motivational Message */}
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                {isWinner && "Great job! Your anime knowledge is impressive!"}
                {isTie && "A well-fought battle! Both characters were evenly matched."}
                {!isWinner && !isTie && "Don't give up! Every defeat is a step towards victory."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameFinishedScreen;

