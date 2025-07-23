"use client";

import { useEffect, useState } from "react";
import { Player, Team, AuctionRulesType } from "@/types/types";

export function useAuctionData() {
  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cricket-auction-teams");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cricket-auction-players");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [auctionRules, setAuctionRules] = useState<AuctionRulesType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cricket-auction-rules");
      return saved ? JSON.parse(saved) : { minBidIncrement: 10 };
    }
    return { minBidIncrement: 10 };
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem("cricket-auction-teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("cricket-auction-players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("cricket-auction-rules", JSON.stringify(auctionRules));
  }, [auctionRules]);

  return {
    teams,
    setTeams,
    players,
    setPlayers,
    auctionRules,
    setAuctionRules,
  };
}
