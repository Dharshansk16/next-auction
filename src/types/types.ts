export type Team = {
  id: string;
  name: string;
  initialBudget: number;
  remainingPoints: number;
  players: Player[];
};

export type Player = {
  id: string;
  name: string;
  price: number;
  teamId: string;
};

export type AuctionRules = {
  minBidIncrement: number;
};
