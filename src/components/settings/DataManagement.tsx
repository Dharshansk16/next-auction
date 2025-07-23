import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuctionContext } from "@/contexts/AuctionContext";

export default function DataManagement() {
  const { teams, setPlayers, setTeams, setAuctionRules } = useAuctionContext();

  return (
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
                      ? `${escapeCSV(player.name)},${escapeCSV(player.price)},,`
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
  );
}
