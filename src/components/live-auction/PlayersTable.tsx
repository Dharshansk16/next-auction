import React, { useMemo } from "react";
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Player } from "@/types/types";
import { useAuctionContext } from "@/contexts/AuctionContext";

export default function PlayersTable() {
  const { players, teams, setTeams, setPlayers } = useAuctionContext();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterTeam, setFilterTeam] = React.useState("all");

  const [editingPlayerId, setEditingPlayerId] = React.useState<string | null>(
    null
  );
  const [editingPlayerData, setEditingPlayerData] = React.useState<{
    name: string;
    price: string;
  }>({ name: "", price: "" });

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTeam = filterTeam === "all" || player.teamId === filterTeam;
      return matchesSearch && matchesTeam;
    });
  }, [players, searchTerm, filterTeam]);

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
    const updatedPlayers = players.filter((player) => player.id !== playerId);
    setPlayers(updatedPlayers);
    setTeams(
      teams.map((team) => ({
        ...team,
        players: team.players.filter((p) => p.id !== playerId),
        remainingPoints: team.remainingPoints + playerToDelete.price,
      }))
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

  return (
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
                      <Badge variant="outline">{player.price} pts</Badge>
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
  );
}
