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
import { useAuctionContext } from "@/contexts/AuctionContext";

export default function RecentAuctions() {
  const { players, teams } = useAuctionContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Auctions</CardTitle>
        <CardDescription>Latest player sales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players
            .slice(-10)
            .reverse()
            .map((player) => {
              const team = teams.find((t) => t.id === player.teamId);
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">{team?.name}</p>
                  </div>
                  <Badge variant="secondary">{player.price} pts</Badge>
                </div>
              );
            })}
          {players.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No players sold yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
