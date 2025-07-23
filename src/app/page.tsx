"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StatCard from "@/components/dashboard/StatCard";
import TeamStandingsCard from "@/components/dashboard/TeamStandingsCard";
import RecentAuctions from "@/components/dashboard/RecentAuctions";
import RecordPlayerCard from "@/components/live-auction/RecordPlayerCard";
import ClientOnly from "@/components/ClientOnly";
import TeamStatus from "@/components/live-auction/TeamStatus";
import { Team, Player, AuctionRules } from "@/types/types";
import { useAuctionContext } from "@/contexts/AuctionContext";
import PlayersTable from "@/components/live-auction/PlayersTable";
import TeamManagement from "@/components/manage-teams/TeamManagement";

export default function CricketAuctionAdmin() {
  const {
    teams,
    setTeams,
    auctionRules,
    setAuctionRules,
    players,
    setPlayers,
  } = useAuctionContext();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", initialBudget: 1000 });

  const [error, setError] = useState("");

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
            <ClientOnly>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Teams" value={teams.length} />
                <StatCard label="Players Sold" value={players.length} />
                <StatCard label="Total Spent" value={overallSpent} />
                <StatCard
                  label="Min Bid"
                  value={auctionRules.minBidIncrement}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamStandingsCard teamStats={getTeamStats()} />
                <RecentAuctions />
              </div>
            </ClientOnly>
          </TabsContent>

          <TabsContent value="auction" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RecordPlayerCard />
              <TeamStatus />
            </div>
            <PlayersTable />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <TeamManagement />
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
