import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuctionContext } from "@/contexts/AuctionContext";
import { Team } from "@/types/types";

export default function TeamManagement() {
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({ name: "", initialBudget: 1000 });
  const [error, setError] = useState("");
  const { teams, setTeams } = useAuctionContext();

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

  const editTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({ name: team.name, initialBudget: team.initialBudget });
    setIsTeamDialogOpen(true);
  };

  const deleteTeam = (teamId: string) => {
    const updatedTeams = teams.filter((team) => team.id !== teamId);
    setTeams(updatedTeams);
    setEditingTeam(null);
    setNewTeam({ name: "", initialBudget: 1000 });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>
          Add, edit, or remove teams from the auction
        </CardDescription>
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
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
                      initialBudget: Number.parseInt(e.target.value) || 0,
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
                    <span className="font-medium">{team.initialBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium text-green-600">
                      {team.remainingPoints}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Players:</span>
                    <span className="font-medium">{team.players.length}</span>
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
            No teams added yet. Click &quot;Add Team&quot; to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
