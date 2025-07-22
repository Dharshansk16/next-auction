"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Player, Team } from "@/types/types";
import { useAuctionData } from "@/hooks/useAuctionData";

export default function RecordPlayerCard() {
  const { teams, setTeams, auctionRules, players, setPlayers } =
    useAuctionData();

  const [error, setError] = useState("");
  const [playerForm, setPlayerForm] = useState({
    name: "",
    price: "",
    teamId: "",
  });
  const addPlayer = () => {
    const teamId = playerForm.teamId;
    const name = playerForm.name.trim();
    const price = parseFloat(playerForm.price);

    if (!teamId) {
      setError("Please select a team");
      return;
    }

    if (isNaN(price) || price < auctionRules.minBidIncrement) {
      setError(`Price must be at least ${auctionRules.minBidIncrement} points`);
      return;
    }

    const selectedTeam = teams.find((team: Team) => team.id === teamId);
    if (!selectedTeam) {
      setError("Selected team not found");
      return;
    }

    if (selectedTeam.remainingPoints < price) {
      setError(
        `Selected team does not have enough points. Remaining: ${selectedTeam.remainingPoints} pts`
      );
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      teamId,
      price,
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);

    const updatedTeams = teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            remainingPoints: team.remainingPoints - price,
            players: [...team.players, newPlayer],
          }
        : team
    );
    setTeams(updatedTeams);

    setPlayerForm({ name: "", price: "", teamId: "" });
    setError("");
  };

  return (
    <Card className="lg:col-span-1">
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
            onChange={(e) => {
              setPlayerForm({ ...playerForm, name: e.target.value });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Sale Price *</Label>
          <Input
            id="price"
            type="number"
            value={playerForm.price}
            onChange={(e) => {
              setPlayerForm({ ...playerForm, price: e.target.value });
            }}
            placeholder={`Min: ${auctionRules.minBidIncrement}`}
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
    </Card>
  );
}
