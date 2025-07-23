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

export default function TeamStatus() {
  const { teams } = useAuctionContext();

  return (
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
                  <span>{team.initialBudget - team.remainingPoints}</span>
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
  );
}
