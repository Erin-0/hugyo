import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, Search, User, Trophy, Target } from 'lucide-react';
import '../App.css';

const MatchmakingScreen = ({ 
  user, 
  gameState, 
  onStartMatchmaking, 
  onLogout, 
  loading 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-white mr-4">Hugyo!</h1>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
            Online
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-white text-right">
            <p className="font-semibold">{user?.displayName}</p>
            <p className="text-sm text-gray-300">{user?.email}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Ready to Battle?</CardTitle>
                <CardDescription className="text-gray-300">
                  Challenge other players in epic anime character battles
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {gameState === 'searching' ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Loader2 className="h-16 w-16 text-yellow-400 animate-spin" />
                    </div>
                    <h3 className="text-xl text-white font-semibold">Searching for opponent...</h3>
                    <p className="text-gray-300">
                      Finding a worthy challenger for you. This may take a moment.
                    </p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-2">
                        <div className="bg-yellow-500/20 rounded-full p-4 mx-auto w-fit">
                          <Target className="h-8 w-8 text-yellow-400" />
                        </div>
                        <h4 className="text-white font-semibold">5 Cards</h4>
                        <p className="text-gray-300 text-sm">Random anime characters</p>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-yellow-500/20 rounded-full p-4 mx-auto w-fit">
                          <Trophy className="h-8 w-8 text-yellow-400" />
                        </div>
                        <h4 className="text-white font-semibold">First to 3</h4>
                        <p className="text-gray-300 text-sm">Points to win</p>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-yellow-500/20 rounded-full p-4 mx-auto w-fit">
                          <User className="h-8 w-8 text-yellow-400" />
                        </div>
                        <h4 className="text-white font-semibold">1v1</h4>
                        <p className="text-gray-300 text-sm">Real-time battle</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={onStartMatchmaking}
                      disabled={loading}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-6"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Find Match
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player Stats */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Games</span>
                  <span className="text-white font-semibold">{user?.totalGames || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Wins</span>
                  <span className="text-green-400 font-semibold">{user?.wins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Losses</span>
                  <span className="text-red-400 font-semibold">{user?.losses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Win Rate</span>
                  <span className="text-yellow-400 font-semibold">
                    {user?.totalGames > 0 
                      ? `${Math.round((user.wins / user.totalGames) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <p>• Each player gets 5 random anime character cards</p>
                <p>• Choose your strongest character each round</p>
                <p>• AI determines the winner based on character abilities</p>
                <p>• First player to reach 3 points wins the match</p>
                <p>• You have 20 seconds to make your choice</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingScreen;

