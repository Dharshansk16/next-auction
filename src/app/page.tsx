"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trash2,
  Edit,
  Plus,
  Trophy,
  Users,
  DollarSign,
  Target,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DashboardCard from "@/components/dashboard/StatCard";
import StatCard from "@/components/dashboard/StatCard";
import TeamStandingsCard from "@/components/dashboard/TeamStandingsCard";
import RecentAuctions from "@/components/dashboard/RecentAuctions";
import RecordPlayerCard from "@/components/live-auction/RecordPlayerCard";
import { useAuctionData } from "@/hooks/useAuctionData";

interface Team {
  id: string;
  name: string;
  initialBudget: number;
  remainingPoints: number;
  players: Player[];
}

interface Player {
  id: string;
  name: string;
  price: number;
  teamId: string;
}

interface AuctionRules {
  minBidIncrement: number;
}

export default function CricketAuctionAdmin() {
  const {
    teams,
    setTeams,
    auctionRules,
    setAuctionRules,
    players,
    setPlayers,
  } = useAuctionData();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", initialBudget: 1000 });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerData, setEditingPlayerData] = useState({
    name: "",
    price: "",
  });

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");

  const addOrUpdateTeam = () => {
    if (!newTeam.name.trim()) {
      setError("Team name is required");
      return;
    }

    if (newTeam.initialBudget <= 0) {
      setError("Initial budget must be greater than 0");
      return;
    }

    if (editingTeam) {
      setTeams(
        teams.map((team) =>
          team.id === editingTeam.id
            ? {
                ...team,
                name: newTeam.name,
                remainingPoints:
                  team.remainingPoints +
                  (newTeam.initialBudget - team.initialBudget),
                initialBudget: newTeam.initialBudget,
              }
            : team
        )
      );
    } else {
      const team: Team = {
        id: Date.now().toString(),
        name: newTeam.name,
        initialBudget: newTeam.initialBudget,
        remainingPoints: newTeam.initialBudget,
        players: [],
      };
      setTeams([...teams, team]);
    }

    setNewTeam({ name: "", initialBudget: 1000 });
    setEditingTeam(null);
    setIsTeamDialogOpen(false);
    setError("");
  };

  const deleteTeam = (teamId: string) => {
    setTeams(teams.filter((team) => team.id !== teamId));
    setPlayers(players.filter((player) => player.teamId !== teamId));
  };

  const editTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({ name: team.name, initialBudget: team.initialBudget });
    setIsTeamDialogOpen(true);
  };

  const filteredPlayers = players
    .filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTeam = filterTeam === "all" || player.teamId === filterTeam;
      return matchesSearch && matchesTeam;
    })
    .reverse();

  const getTeamStats = () => {
    return teams
      .map((team) => ({
        ...team,
        totalSpent: team.initialBudget - team.remainingPoints,
        playerCount: team.players.length,
        efficiency:
          team.players.length > 0
            ? (team.initialBudget - team.remainingPoints) / team.players.length
            : 0,
      }))
      .sort((a, b) => b.remainingPoints - a.remainingPoints);
  };

  //edit and delete playerfunctions
  const handleEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditingPlayerData({
      name: player.name,
      price: player.price.toString(),
    });
  };

  const handleDeletePlayer = (playerId: string) => {
    const playerToDelete = players.find((p) => p.id === playerId);
    if (!playerToDelete) return;

    setPlayers(players.filter((p) => p.id !== playerId));
    setTeams(
      teams.map((team) =>
        team.id === playerToDelete.teamId
          ? {
              ...team,
              remainingPoints: team.remainingPoints + playerToDelete.price,
              players: team.players.filter((p) => p.id !== playerId),
            }
          : team
      )
    );
  };

  const handleSavePlayerEdit = () => {
    const price = Number(editingPlayerData.price);
    if (!editingPlayerId || isNaN(price)) return;

    const oldPlayer = players.find((p) => p.id === editingPlayerId);
    if (!oldPlayer) return;

    const updatedPlayer = {
      ...oldPlayer,
      name: editingPlayerData.name,
      price,
    };

    // Update players list
    const updatedPlayers = players.map((p) =>
      p.id === editingPlayerId ? updatedPlayer : p
    );
    setPlayers(updatedPlayers);

    // Update teams: replace player in team and adjust remainingPoints
    const updatedTeams = teams.map((team) => {
      if (team.id !== oldPlayer.teamId) return team;

      const updatedTeamPlayers = team.players.map((p) =>
        p.id === editingPlayerId ? updatedPlayer : p
      );
      const diff = oldPlayer.price - price;

      return {
        ...team,
        remainingPoints: team.remainingPoints + diff,
        players: updatedTeamPlayers,
      };
    });
    setTeams(updatedTeams);

    setEditingPlayerId(null);
    setEditingPlayerData({ name: "", price: "" });
  };

  const overallSpent = teams.reduce(
    (sum, team) => sum + (team.initialBudget - team.remainingPoints),
    0
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-50 mb-2">
            Baarish Cup Auction-2025
          </h1>
          <p className="text-gray-400">
            Manage teams, track player auctions, and monitor budgets in
            real-time
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="auction">Live Auction</TabsTrigger>
            <TabsTrigger value="teams">Manage Teams</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Teams" value={teams.length} />
              <StatCard label="Players Sold" value={players.length} />
              <StatCard label="Total Spent" value={overallSpent} />
              <StatCard label="Min Bid" value={auctionRules.minBidIncrement} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamStandingsCard teamStats={getTeamStats()} />
              <RecentAuctions />
            </div>
          </TabsContent>

          <TabsContent value="auction" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Record Player Sale</CardTitle>
                  <CardDescription>
                    Add a player to a team and deduct points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="player-name">Player Name (Optional)</Label>
                    <Input
                      id="player-name"
                      placeholder="Enter player name"
                      value={playerForm.name}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Sale Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder={`Min: ${auctionRules.minBidIncrement}`}
                      value={playerForm.price}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">Team *</Label>
                    <Select
                      value={playerForm.teamId}
                      onValueChange={(value) =>
                        setPlayerForm({ ...playerForm, teamId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.remainingPoints} pts left)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={addPlayer}
                    className="w-full"
                    disabled={teams.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record
                  </Button>
                </CardContent>
              </Card> */}
              <RecordPlayerCard />

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Team Status</CardTitle>
                  <CardDescription>Real-time budget tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div key={team.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold">{team.name}</h3>
                          <Badge
                            variant={
                              team.remainingPoints > team.initialBudget * 0.2
                                ? "default"
                                : "destructive"
                            }
                          >
                            {team.remainingPoints} pts
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-200">
                          <div className="flex justify-between">
                            <span>Initial Budget:</span>
                            <span>{team.initialBudget}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Spent:</span>
                            <span>
                              {team.initialBudget - team.remainingPoints}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Players:</span>
                            <span>{team.players.length}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  ((team.initialBudget - team.remainingPoints) /
                                    team.initialBudget) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Players</CardTitle>
                <CardDescription>Complete auction history</CardDescription>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={filterTeam} onValueChange={setFilterTeam}>
                    <SelectTrigger className="max-w-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player Name</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((player) => {
                      // const team = teams.find((t) => t.id === player.teamId);
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">
                            {editingPlayerId === player.id ? (
                              <input
                                className="border px-2 py-1 rounded w-full"
                                value={editingPlayerData.name}
                                onChange={(e) =>
                                  setEditingPlayerData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              player.name
                            )}
                          </TableCell>
                          <TableCell>
                            {teams.find((t) => t.id === player.teamId)?.name}
                          </TableCell>
                          <TableCell>
                            {editingPlayerId === player.id ? (
                              <input
                                type="number"
                                className="border px-2 py-1 rounded w-20"
                                value={editingPlayerData.price}
                                onChange={(e) =>
                                  setEditingPlayerData((prev) => ({
                                    ...prev,
                                    price: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <Badge variant="outline">
                                {player.price} pts
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {editingPlayerId === player.id ? (
                              <Button size="sm" onClick={handleSavePlayerEdit}>
                                Save
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditPlayer(player)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeletePlayer(player.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredPlayers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No players found matching your criteria
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Add, edit, or remove teams from the auction
                </CardDescription>
                <Dialog
                  open={isTeamDialogOpen}
                  onOpenChange={setIsTeamDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTeam ? "Edit Team" : "Add New Team"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTeam
                          ? "Update team details"
                          : "Create a new team for the auction"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                          id="team-name"
                          placeholder="Enter team name"
                          value={newTeam.name}
                          onChange={(e) =>
                            setNewTeam({ ...newTeam, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="initial-budget">Initial Budget</Label>
                        <Input
                          id="initial-budget"
                          type="number"
                          placeholder="1000"
                          value={newTeam.initialBudget}
                          onChange={(e) =>
                            setNewTeam({
                              ...newTeam,
                              initialBudget:
                                Number.parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsTeamDialogOpen(false);
                          setEditingTeam(null);
                          setNewTeam({ name: "", initialBudget: 1000 });
                          setError("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={addOrUpdateTeam}>
                        {editingTeam ? "Update" : "Add"} Team
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <Card key={team.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editTeam(team)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTeam(team.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Budget:</span>
                            <span className="font-medium">
                              {team.initialBudget}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className="font-medium text-green-600">
                              {team.remainingPoints}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Players:</span>
                            <span className="font-medium">
                              {team.players.length}
                            </span>
                          </div>
                        </div>
                        {team.players.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">Players:</p>
                            <div className="space-y-1">
                              {team.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex justify-between text-xs"
                                >
                                  <span>{player.name}</span>
                                  <span>{player.price} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {teams.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No teams added yet. Click &quot;Add Team&quot; to get
                    started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auction Rules</CardTitle>
                <CardDescription>
                  Configure global auction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min-bid">Minimum Bid Increment</Label>
                  <Input
                    id="min-bid"
                    type="number"
                    value={auctionRules.minBidIncrement}
                    onChange={(e) =>
                      setAuctionRules({
                        ...auctionRules,
                        minBidIncrement: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    The minimum amount that can be bid for any player
                  </p>
                </div>
                <Button
                  onClick={() => {
                    localStorage.setItem(
                      "cricket-auction-rules",
                      JSON.stringify(auctionRules)
                    );
                    alert("Settings saved!");
                  }}
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Reset or export auction data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const truncate = (
                        str: string | number | boolean | null | undefined,
                        maxLength = 30
                      ) => {
                        const value = str?.toString() ?? "";
                        return value.length > maxLength
                          ? value.slice(0, maxLength - 3) + "..."
                          : value;
                      };

                      const escapeCSV = (
                        value: string | number | boolean | null | undefined
                      ) => {
                        const str = truncate(value);
                        if (
                          str.includes(",") ||
                          str.includes('"') ||
                          str.includes("\n")
                        ) {
                          return `"${str.replace(/"/g, '""')}"`;
                        }
                        return str;
                      };

                      let csvContent = "";

                      // Step 1: Header row: Team Names
                      const teamHeaderRow = teams
                        .map((t) => `${escapeCSV(t.name)}, Points,,`)
                        .join("");
                      csvContent += teamHeaderRow + "\n";

                      // Step 2: Find max number of players in any team
                      const maxPlayers = Math.max(
                        ...teams.map((t) => t.players.length)
                      );

                      // Step 3: Build rows
                      for (let i = 0; i < maxPlayers; i++) {
                        const row = teams
                          .map((team) => {
                            const player = team.players[i];
                            return player
                              ? `${escapeCSV(player.name)},${escapeCSV(
                                  player.price
                                )},,`
                              : ",,,";
                          })
                          .join("");
                        csvContent += row + "\n";
                      }

                      // Step 4: Trigger download
                      const blob = new Blob([csvContent], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `auction-teams-${
                        new Date().toISOString().split("T")[0]
                      }.csv`;
                      a.click();
                    }}
                  >
                    Export CSV
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to reset all data? This cannot be undone."
                        )
                      ) {
                        setTeams([]);
                        setPlayers([]);
                        setAuctionRules({ minBidIncrement: 10 });
                        localStorage.clear();
                      }
                    }}
                  >
                    Reset All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
