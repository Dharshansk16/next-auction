"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/types";

type TeamStat = {
  totalSpent: number;
  playerCount: number;
  efficiency: number;
  id: string;
  name: string;
  initialBudget: number;
  remainingPoints: number;
  players: Player[];
};

type TeamStandingsProps = {
  teamStats: TeamStat[];
};

export default function TeamStandingsCard({ teamStats }: TeamStandingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Standings</CardTitle>
        <CardDescription>Ranked by remaining points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamStats.map((team, index) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Badge variant="outline">#{index + 1}</Badge>
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-gray-500">
                    {team.playerCount} players
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">
                  {team.remainingPoints} left
                </p>
                <p className="text-sm text-gray-500">{team.totalSpent} spent</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
