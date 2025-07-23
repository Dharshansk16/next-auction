"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import TeamStandingsCard from "@/components/dashboard/TeamStandingsCard";
import RecentAuctions from "@/components/dashboard/RecentAuctions";
import RecordPlayerCard from "@/components/live-auction/RecordPlayerCard";
import ClientOnly from "@/components/ClientOnly";
import TeamStatus from "@/components/live-auction/TeamStatus";
import { useAuctionContext } from "@/contexts/AuctionContext";
import PlayersTable from "@/components/live-auction/PlayersTable";
import TeamManagement from "@/components/manage-teams/TeamManagement";
import AuctionRules from "@/components/settings/AuctionRules";
import DataManagement from "@/components/settings/DataManagement";

export default function CricketAuctionAdmin() {
  const { teams, auctionRules, players } = useAuctionContext();

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
          <h1 className="text-3xl font-bold text-gray-50 mb-2">Next-Auction</h1>
          <p className="text-gray-400">
            Manage teams, track player auctions, and monitor budgets in
            real-time
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="auction">
              <span className="block md:hidden">Auction</span>
              <span className="hidden md:block">Live Auction</span>
            </TabsTrigger>
            <TabsTrigger value="teams">
              <span className="block md:hidden">Teams</span>
              <span className="hidden md:block">Manage Teams</span>
            </TabsTrigger>
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
            <AuctionRules />
            <DataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
